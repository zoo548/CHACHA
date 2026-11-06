// 시연 방송 API 클라이언트. 개인정보·재난문자 API 키는 보내지 않는다.

import { Preferences } from "@capacitor/preferences"
import type { DemoMessage } from "../../shared/demoDefaults"

const DEVICE_KEY = "chacha-demo-device-id-v1"
const SEEN_KEY = "chacha-demo-seen-id-v1"
const JOINED_AT_KEY = "chacha-demo-joined-at-v1"
const PRESENTER_KEY = "chacha-presenter-key"

export function demoApiUrl(path: string): string {
  const base = (import.meta.env.VITE_DEMO_URL as string | undefined)?.trim().replace(/\/$/, "") ?? ""
  const suffix = path.startsWith("/") ? path : `/${path}`
  return `${base}${suffix}`
}

const FETCH_MS = 4_000

async function fetchDemo(path: string, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController()
  const timer = globalThis.setTimeout(() => ctrl.abort(), FETCH_MS)
  try {
    return await fetch(demoApiUrl(path), {
      cache: "no-store",
      ...init,
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    })
  } finally {
    globalThis.clearTimeout(timer)
  }
}

function newDeviceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export async function loadDemoDeviceId(): Promise<string> {
  try {
    const { value } = await Preferences.get({ key: DEVICE_KEY })
    if (value && /^[A-Za-z0-9_-]{8,80}$/.test(value)) return value
  } catch {
    /* ignore */
  }
  const id = newDeviceId().replace(/[^A-Za-z0-9_-]/g, "")
  try {
    await Preferences.set({ key: DEVICE_KEY, value: id })
  } catch {
    /* ignore */
  }
  return id
}

export async function loadSeenDemoId(): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key: SEEN_KEY })
    return value || null
  } catch {
    return null
  }
}

export async function saveSeenDemoId(id: string): Promise<void> {
  try {
    await Preferences.set({ key: SEEN_KEY, value: id })
  } catch {
    /* ignore */
  }
}

export async function loadDemoJoinedAt(): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key: JOINED_AT_KEY })
    return value || null
  } catch {
    return null
  }
}

export async function saveDemoJoinedAt(iso: string): Promise<void> {
  try {
    await Preferences.set({ key: JOINED_AT_KEY, value: iso })
  } catch {
    /* ignore */
  }
}

export async function clearDemoJoinGate(): Promise<void> {
  try {
    await Preferences.remove({ key: JOINED_AT_KEY })
  } catch {
    /* ignore */
  }
}

/** 앱을 예전 버전에서 올린 경우: 참여 시각이 없으면 지금으로 두고 예전 문자는 막는다. */
export async function loadOrStartDemoJoinedAt(): Promise<string> {
  const existing = await loadDemoJoinedAt()
  if (existing) return existing
  const joinedAt = new Date().toISOString()
  await saveDemoJoinedAt(joinedAt)
  return joinedAt
}

export function isDemoSentAfterJoin(sentAt: string | undefined, joinedAt: string | null): boolean {
  if (!joinedAt || !sentAt) return false
  const sent = Date.parse(sentAt)
  const joined = Date.parse(joinedAt)
  if (!Number.isFinite(sent) || !Number.isFinite(joined)) return false
  return sent > joined
}

export function shouldPresentDemoMessage(
  current: { id?: string; sentAt?: string },
  opts: { seenId: string | null; joinedAt: string | null },
): boolean {
  if (!current.id) return false
  if (opts.seenId === current.id) return false
  return isDemoSentAfterJoin(current.sentAt, opts.joinedAt)
}

/** 참여하는 순간 서버에 있던 문자는 본 문자로 표시해서 알림을 띄우지 않는다. */
export async function markExistingDemoCurrentSeen(): Promise<void> {
  try {
    const current = await fetchDemoCurrent()
    if (current?.id) await saveSeenDemoId(current.id)
  } catch {
    /* ignore */
  }
}

export function loadPresenterKey(): string {
  try {
    return sessionStorage.getItem(PRESENTER_KEY) ?? ""
  } catch {
    return ""
  }
}

export function savePresenterKey(key: string) {
  try {
    sessionStorage.setItem(PRESENTER_KEY, key)
  } catch {
    /* ignore */
  }
}

export function clearPresenterKey() {
  try {
    sessionStorage.removeItem(PRESENTER_KEY)
  } catch {
    /* ignore */
  }
}

export async function fetchDemoCurrent(): Promise<DemoMessage | null> {
  const res = await fetchDemo("/api/demo/current")
  if (!res.ok) throw new Error(`http_${res.status}`)
  const json = (await res.json()) as { current?: DemoMessage | null }
  return json.current ?? null
}

export async function fetchDemoCount(): Promise<number> {
  const res = await fetchDemo("/api/demo/count")
  if (!res.ok) throw new Error(`http_${res.status}`)
  const json = (await res.json()) as { count?: number }
  return typeof json.count === "number" ? json.count : 0
}

export async function joinDemo(deviceId: string): Promise<number | null> {
  const res = await fetchDemo("/api/demo/join", {
    method: "POST",
    body: JSON.stringify({ deviceId }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { count?: number }
  return typeof json.count === "number" ? json.count : null
}

export async function sendDemo(
  key: string,
  fields: { message: string; sender: string; govType: string },
): Promise<DemoMessage> {
  const res = await fetchDemo("/api/demo/send", {
    method: "POST",
    headers: { "x-demo-key": key },
    body: JSON.stringify(fields),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error(`http_${res.status}`)
  const json = (await res.json()) as { current?: DemoMessage }
  if (!json.current) throw new Error("empty")
  return json.current
}

export async function resetDemo(key: string): Promise<void> {
  const res = await fetchDemo("/api/demo/reset", {
    method: "POST",
    headers: { "x-demo-key": key },
    body: JSON.stringify({}),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error(`http_${res.status}`)
}
