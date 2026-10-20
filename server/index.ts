// 재난문자 중계 HTTP 서버.
// 포트 8787. CORS 허용. 핵심 로직은 alerts-core.ts.

import { config } from "dotenv"
import cors from "cors"
import express from "express"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  DEFAULT_POLL_MS,
  getLastError,
  getLastPollAt,
  listAlerts,
  loadStore,
  logFetchError,
  pollOnce,
  callsInLast24h,
  countToday,
  sampleRegions,
} from "./alerts-core.ts"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "..")

function loadKey(): string {
  // 루트 .env.local 을 먼저, 없으면 server/.env.local (Oracle Cloud 이식 때).
  const paths = [resolve(root, ".env.local"), resolve(here, ".env.local")]
  let loadedFrom = ""
  for (const p of paths) {
    const result = config({ path: p })
    if (result.error) continue
    loadedFrom = p
    break
  }
  if (loadedFrom) console.log(`[alerts] env: ${loadedFrom}`)
  else console.error("[alerts] .env.local 을 못 찾았어요. 프로젝트 루트에 SAFETYDATA_KEY= 줄을 넣으세요.")
  return (process.env.SAFETYDATA_KEY || "").trim().replace(/^["']|["']$/g, "")
}

const PORT = Number(process.env.ALERTS_PORT || 8787)
const POLL_MS = Number(process.env.POLL_INTERVAL_MS || DEFAULT_POLL_MS)
const KEY = loadKey()

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "chacha-alert-relay",
    alerts: "/alerts?region=서울특별시 관악구",
    lastPollAt: getLastPollAt(),
    lastError: getLastError(),
    callsInLast24h: callsInLast24h(),
    keyLoaded: KEY.length > 0,
  })
})

app.get("/alerts", (req, res) => {
  const region = typeof req.query.region === "string" ? req.query.region : ""
  const err = getLastError()
  const alerts = listAlerts(region)
  res.json({
    alerts,
    totalToday: countToday(),
    matched: alerts.length,
    region: region || null,
    regionSamples: sampleRegions(8),
    error: err ? err.reason : null,
    errorCode: err ? err.code : null,
    lastPollAt: getLastPollAt(),
  })
})

async function tick() {
  const result = await pollOnce(KEY)
  if (result.error) logFetchError(result.error)
  else {
    console.log(
      `[alerts] 조회 ${result.fetched}건, 신규 ${result.added}건, 24시간 호출 ${result.callsUsed}회`,
    )
  }
}

await loadStore()

app.listen(PORT, () => {
  console.log(`[alerts] http://localhost:${PORT}  (poll ${POLL_MS / 1000}s)`)
  if (!KEY) {
    console.error(
      "[alerts] missing_key: SAFETYDATA_KEY 가 비어 있어요. 프로젝트 루트 .env.local 에 SAFETYDATA_KEY=발급키 를 넣으세요.",
    )
  }
  tick().catch((err) => console.error("[alerts] 첫 조회 실패", err))
  setInterval(() => {
    tick().catch((err) => console.error("[alerts] 조회 실패", err))
  }, POLL_MS)
})
