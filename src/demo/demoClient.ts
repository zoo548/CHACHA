// 시연 방송 API 클라이언트. 개인정보·재난문자 API 키는 보내지 않는다.

import { Preferences } from "@capacitor/preferences"
import type { DemoMessage } from "../../shared/demoDefaults"

const DEVICE_KEY = "chacha-demo-device-id-v1"
const SEEN_KEY = "chacha-demo-seen-id-v1"
const PRESENTER_KEY = "chacha-presenter-key"

export function demoApiUrl(path: string): string {
  const base = (import.meta.env.VITE_DEMO_URL as string | undefined)?.trim().replace(/\/$/, "") ?? ""
  const suffix = path.startsWith("/") ? path : `/${path}`
  return `${base}${suffix}`
}

async function fetchDemo(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(demoApiUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  })
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
