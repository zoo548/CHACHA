// 재난문자 중계 핵심 로직.
// Oracle Cloud 로 옮길 때 이 파일 + index.ts + data 폴더만 가져가면 된다.
//
// 필드 이름은 공식 명세(safetydata.go.kr DSSP-IF-00247 출력결과)를 그대로 쓴다.
//   SN, CRT_DT, MSG_CN, RCPTN_RGN_NM, EMRG_STEP_NM, DST_SE_NM
// 에러코드는 같은 페이지의 에러코드 목록을 그대로 쓴다 (32=미등록 IP, 30=키 미등록 등).

import { appendFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))

export const API_URL = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247"
export const DATA_DIR = join(here, "data")
export const ALERTS_FILE = join(DATA_DIR, "alerts.json")
export const LATENCY_FILE = join(DATA_DIR, "latency.csv")

export const DEFAULT_POLL_MS = 2 * 60 * 1000
export const DAILY_LIMIT = 1000
export const KEEP_DAYS = 7
export const MIDNIGHT_WINDOW_MIN = 10
export const PAGE_SIZE = 100

/** 앱/웹에 내려주는 한 건. 필드 이름은 요청 명세 그대로. */
export type AlertItem = {
  id: string
  createdAt: string
  message: string
  region: string
  level: string
  disasterType: string
}

type StoredAlert = AlertItem & {
  createdAtMs: number | null
  firstSeenAtMs: number
}

type Store = {
  alerts: Record<string, StoredAlert>
}

export type FetchError = {
  code: string
  reason: string
  httpStatus?: number
  raw?: string
}

export type PollResult = {
  fetched: number
  added: number
  error: FetchError | null
  callsUsed: number
}

type UpstreamHeader = {
  resultCode?: string
  resultMsg?: string
}

/** 공식 에러코드 → 사람이 읽을 이유. 명세 표 그대로. */
const RESULT_CODE_REASON: Record<string, string> = {
  "00": "정상",
  "01": "어플리케이션 에러",
  "02": "요청시간초과 에러",
  "10": "잘못된 요청 파라메터 에러",
  "11": "필수 파라메터 에러",
  "12": "해당 오픈API서비스가 없거나 폐기됨",
  "13": "잘못된 메소드 요청",
  "20": "서비스 접근거부",
  "22": "서비스 요청제한횟수 초과",
  "30": "등록되지 않은 서비스키",
  "31": "기한만료된 서비스키",
  "32": "등록되지 않은 IP",
  "33": "서비스키가 없음",
  "34": "여러개의 서비스키",
  "99": "기타에러",
}

let store: Store = { alerts: {} }
let loaded = false
let lastError: FetchError | null = null
let lastPollAt: string | null = null
const callLog: number[] = [] // 호출 시각(ms). 24시간 창으로 한도 계산.

export function getLastError(): FetchError | null {
  return lastError
}

export function getLastPollAt(): string | null {
  return lastPollAt
}

export function callsInLast24h(): number {
  pruneCallLog()
  return callLog.length
}

function pruneCallLog() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  while (callLog.length > 0 && (callLog[0] ?? 0) < cutoff) callLog.shift()
}

export async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

/** 임시 파일에 쓴 뒤 rename. 쓰다 꺼져도 alerts.json 이 반쯤 깨지지 않게. */
async function atomicWrite(file: string, contents: string) {
  await ensureDataDir()
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, contents, "utf8")
  try {
    await rename(tmp, file)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    // Windows 는 대상이 있으면 rename 이 실패한다. 지우고 한 번 더.
    if (code === "EEXIST" || code === "EPERM" || code === "EACCES") {
      await rm(file, { force: true })
      await rename(tmp, file)
    } else {
      await rm(tmp, { force: true }).catch(() => {})
      throw err
    }
  }
}

export async function loadStore(): Promise<void> {
  if (loaded) return
  loaded = true
  try {
    const raw = await readFile(ALERTS_FILE, "utf8")
    const parsed = JSON.parse(raw) as Store
    if (parsed && parsed.alerts && typeof parsed.alerts === "object") {
      store = parsed
    }
  } catch {
    store = { alerts: {} }
  }
  pruneOldAlerts()
}

async function saveStore() {
  pruneOldAlerts()
  await atomicWrite(ALERTS_FILE, JSON.stringify(store, null, 2))
}

function pruneOldAlerts() {
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000
  for (const [id, item] of Object.entries(store.alerts)) {
    const t = item.createdAtMs ?? item.firstSeenAtMs
    if (t < cutoff) delete store.alerts[id]
  }
}

/** 수신지역 한 조각을 공백 토큰으로. 끝의 "전체"는 시·도 단위로 본다. */
export function regionTokens(part: string): string[] {
  const trimmed = part.trim().replace(/\s*전체\s*$/u, "").trim()
  return trimmed.split(/\s+/).filter(Boolean)
}

/** a 토큰이 b 토큰의 앞부분이면 a 가 b 를 덮는다. ("서울특별시" ⊂ "서울특별시 관악구") */
function tokensCover(broader: string[], narrower: string[]): boolean {
  if (broader.length === 0 || broader.length > narrower.length) return false
  return broader.every((t, i) => t === narrower[i])
}

/**
 * 사용자 지역(예: "서울특별시 관악구")이 이 문자의 수신지역에 해당하는지.
 * - 쉼표로 이어진 여러 지역은 하나씩 본다.
 * - "서울특별시" / "서울특별시 전체" 는 그 시·도의 모든 구에 해당.
 * - "서울특별시 관악구" 는 그 구(동 단위 포함)에 해당.
 */
export function regionMatches(alertRegion: string, userRegion: string): boolean {
  const user = regionTokens(userRegion)
  if (user.length === 0) return true
  const parts = alertRegion.split(/[,，]/)
  for (const part of parts) {
    const alert = regionTokens(part)
    if (alert.length === 0) continue
    if (tokensCover(alert, user) || tokensCover(user, alert)) return true
  }
  return false
}

function isTodaySeoul(ms: number, now = new Date()): boolean {
  return seoulYmd(new Date(ms)) === seoulYmd(now)
}

export function countToday(now = new Date()): number {
  return Object.values(store.alerts).filter((a) =>
    isTodaySeoul(a.createdAtMs ?? a.firstSeenAtMs, now),
  ).length
}

/** 최근에 받은 수신지역 원문 몇 개. 로그·디버그용. */
export function sampleRegions(limit = 8): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const items = Object.values(store.alerts).sort(
    (a, b) => (b.createdAtMs ?? b.firstSeenAtMs) - (a.createdAtMs ?? a.firstSeenAtMs),
  )
  for (const a of items) {
    if (seen.has(a.region)) continue
    seen.add(a.region)
    out.push(a.region)
    if (out.length >= limit) break
  }
  return out
}

export function listAlerts(region?: string): AlertItem[] {
  const q = (region ?? "").trim()
  const items = Object.values(store.alerts)
    .filter((a) => {
      const t = a.createdAtMs ?? a.firstSeenAtMs
      if (!q) return isTodaySeoul(t)
      return regionMatches(a.region, q)
    })
    .sort((a, b) => (b.createdAtMs ?? b.firstSeenAtMs) - (a.createdAtMs ?? a.firstSeenAtMs))
  return items.map(({ createdAtMs: _c, firstSeenAtMs: _f, ...rest }) => rest)
}

/** 서울 기준 YYYYMMDD. */
export function seoulYmd(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d)
  const y = parts.find((p) => p.type === "year")?.value ?? "0000"
  const m = parts.find((p) => p.type === "month")?.value ?? "01"
  const day = parts.find((p) => p.type === "day")?.value ?? "01"
  return `${y}${m}${day}`
}

function seoulMinutesSinceMidnight(d = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d)
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0")
  const min = Number(parts.find((p) => p.type === "minute")?.value ?? "0")
  return h * 60 + min
}

export function datesToFetch(now = new Date()): string[] {
  const today = seoulYmd(now)
  if (seoulMinutesSinceMidnight(now) < MIDNIGHT_WINDOW_MIN) {
    const yesterday = seoulYmd(new Date(now.getTime() - 24 * 60 * 60 * 1000))
    return [today, yesterday]
  }
  return [today]
}

/**
 * CRT_DT 는 명세에 포맷이 안 적혀 있다.
 * 숫자만 모아 Date 로 바꿔 보고, 실패하면 null (원문 createdAt 은 그대로 보관).
 */
export function parseCreatedAt(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  const digits = s.replace(/\D/g, "")
  if (digits.length >= 14) {
    const y = Number(digits.slice(0, 4))
    const mo = Number(digits.slice(4, 6)) - 1
    const d = Number(digits.slice(6, 8))
    const h = Number(digits.slice(8, 10))
    const mi = Number(digits.slice(10, 12))
    const se = Number(digits.slice(12, 14))
    const t = Date.UTC(y, mo, d, h - 9, mi, se) // 생성일시는 한국시간으로 보고 KST→UTC
    return Number.isFinite(t) ? t : null
  }
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : null
}

function asString(v: unknown): string {
  if (v == null) return ""
  return String(v)
}

function headerOf(json: unknown): UpstreamHeader {
  if (!json || typeof json !== "object") return {}
  const o = json as Record<string, unknown>
  const h = (o.header ?? o.HEADER) as Record<string, unknown> | undefined
  if (!h || typeof h !== "object") return {}
  return {
    resultCode: asString(h.resultCode ?? h.resultcode ?? h.RESULT_CODE),
    resultMsg: asString(h.resultMsg ?? h.resultmsg ?? h.RESULT_MSG),
  }
}

function bodyOf(json: unknown): unknown[] {
  if (!json || typeof json !== "object") return []
  const o = json as Record<string, unknown>
  const body = o.body ?? o.BODY
  if (Array.isArray(body)) return body
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>
    if (Array.isArray(b.item)) return b.item
    if (Array.isArray(b.items)) return b.items
  }
  return []
}

function explainResultCode(code: string, msg: string): FetchError {
  const known = RESULT_CODE_REASON[code]
  if (code === "32" || /UNREGISTERED IP/i.test(msg) || msg.includes("등록되지 않은 IP")) {
    return {
      code,
      reason:
        "등록되지 않은 IP 입니다. safetydata.go.kr 활용신청에서 이 PC의 공인 IP를 등록하세요.",
    }
  }
  if (code === "30" || code === "33" || /SERVICE KEY/i.test(msg) || msg.includes("서비스키")) {
    return {
      code,
      reason:
        "서비스키가 없거나 등록되지 않았습니다. 프로젝트 루트 .env.local 의 SAFETYDATA_KEY 를 확인하세요.",
    }
  }
  return {
    code: code || "unknown",
    reason: known ? `${known}${msg ? ` (${msg})` : ""}` : msg || "업스트림 오류",
  }
}

function rowToAlert(row: unknown): AlertItem | null {
  if (!row || typeof row !== "object") return null
  const r = row as Record<string, unknown>
  const id = asString(r.SN)
  if (!id) return null
  return {
    id,
    createdAt: asString(r.CRT_DT),
    message: asString(r.MSG_CN),
    region: asString(r.RCPTN_RGN_NM),
    level: asString(r.EMRG_STEP_NM),
    disasterType: asString(r.DST_SE_NM),
  }
}

async function appendLatency(item: StoredAlert) {
  if (item.createdAtMs == null) return
  const latencyMs = item.firstSeenAtMs - item.createdAtMs
  await ensureDataDir()
  try {
    await readFile(LATENCY_FILE)
  } catch {
    await writeFile(
      LATENCY_FILE,
      "sn,createdAt,firstSeenAt,latencyMs\n",
      "utf8",
    )
  }
  const line = [
    item.id,
    item.createdAt.replaceAll(",", " "),
    new Date(item.firstSeenAtMs).toISOString(),
    String(latencyMs),
  ].join(",")
  await appendFile(LATENCY_FILE, `${line}\n`, "utf8")
}

export async function fetchPage(
  key: string,
  crtDt: string,
  pageNo: number,
): Promise<{ rows: AlertItem[]; totalCount: number; error: FetchError | null }> {
  pruneCallLog()
  if (callLog.length >= DAILY_LIMIT) {
    return {
      rows: [],
      totalCount: 0,
      error: {
        code: "local_limit",
        reason: `일일 호출 한도 ${DAILY_LIMIT}회를 넘기지 않으려고 이번 조회를 건너뛰었어요.`,
      },
    }
  }

  const url = new URL(API_URL)
  url.searchParams.set("serviceKey", key)
  url.searchParams.set("returnType", "json")
  url.searchParams.set("pageNo", String(pageNo))
  url.searchParams.set("numOfRows", String(PAGE_SIZE))
  url.searchParams.set("crtDt", crtDt)

  callLog.push(Date.now())

  let res: Response
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } })
  } catch (err) {
    return {
      rows: [],
      totalCount: 0,
      error: {
        code: "network",
        reason: `safetydata.go.kr 에 연결하지 못했어요. ${(err as Error).message}`,
      },
    }
  }

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    const clipped = text.replace(/\s+/g, " ").slice(0, 240)
    return {
      rows: [],
      totalCount: 0,
      error: {
        code: "not_json",
        httpStatus: res.status,
        reason: `JSON 이 아닌 응답이에요 (HTTP ${res.status}). ${clipped}`,
        raw: clipped,
      },
    }
  }

  const header = headerOf(json)
  const code = header.resultCode || (res.ok ? "00" : "")
  if (code && code !== "00" && code !== "0") {
    return { rows: [], totalCount: 0, error: explainResultCode(code, header.resultMsg ?? "") }
  }
  if (!res.ok) {
    return {
      rows: [],
      totalCount: 0,
      error: {
        code: String(res.status),
        httpStatus: res.status,
        reason: `업스트림 HTTP ${res.status}. ${header.resultMsg || text.slice(0, 200)}`,
      },
    }
  }

  const o = json as Record<string, unknown>
  const totalCount = Number(o.totalCount ?? o.TOTAL_COUNT ?? 0)
  const rows = bodyOf(json)
    .map(rowToAlert)
    .filter((x): x is AlertItem => x != null)
  return { rows, totalCount: Number.isFinite(totalCount) ? totalCount : rows.length, error: null }
}

export async function ingest(rows: AlertItem[], now = Date.now()): Promise<number> {
  let added = 0
  for (const row of rows) {
    if (store.alerts[row.id]) continue
    const createdAtMs = parseCreatedAt(row.createdAt)
    const stored: StoredAlert = {
      ...row,
      createdAtMs,
      firstSeenAtMs: now,
    }
    store.alerts[row.id] = stored
    added += 1
    await appendLatency(stored)
  }
  if (added > 0) await saveStore()
  else pruneOldAlerts()
  return added
}

export async function pollOnce(key: string): Promise<PollResult> {
  await loadStore()
  if (!key.trim()) {
    lastError = {
      code: "missing_key",
      reason:
        "SAFETYDATA_KEY 가 비어 있어요. 프로젝트 루트 .env.local 에 SAFETYDATA_KEY=발급키 를 넣으세요.",
    }
    lastPollAt = new Date().toISOString()
    return { fetched: 0, added: 0, error: lastError, callsUsed: callsInLast24h() }
  }

  const dates = datesToFetch()
  let fetched = 0
  let added = 0
  let error: FetchError | null = null

  for (const crtDt of dates) {
    let pageNo = 1
    let total = Infinity
    while ((pageNo - 1) * PAGE_SIZE < total) {
      const page = await fetchPage(key, crtDt, pageNo)
      if (page.error) {
        error = page.error
        break
      }
      fetched += page.rows.length
      added += await ingest(page.rows)
      if (page.rows.length > 0) {
        const uniq = [...new Set(page.rows.map((r) => r.region))].slice(0, 8)
        console.log(
          `[alerts] 수신지역 예: ${uniq.map((s) => JSON.stringify(s)).join(", ")}`,
        )
      }
      total = page.totalCount || page.rows.length
      if (page.rows.length === 0) break
      pageNo += 1
      if (pageNo > 20) break // 한 주기에서 페이지 폭주 방지
    }
    if (error) break
  }

  lastError = error
  lastPollAt = new Date().toISOString()
  return { fetched, added, error, callsUsed: callsInLast24h() }
}

export function logFetchError(err: FetchError) {
  console.error(`[alerts] ${err.code}: ${err.reason}`)
}
