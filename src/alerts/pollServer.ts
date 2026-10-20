/// <reference types="vite/client" />
// 중계 서버에서 내 지역 재난문자를 1분마다 가져온다.
// 서버 URL 은 VITE_ALERTS_URL (없으면 http://localhost:8787).
// 본 적 있는 SN 은 Preferences 에 남겨 앱을 껐다 켜도 다시 울리지 않는다.

import { Preferences } from "@capacitor/preferences"

export type RelayAlert = {
  id: string
  createdAt: string
  message: string
  region: string
  level: string
  disasterType: string
}

export type RelayResponse = {
  alerts: RelayAlert[]
  totalToday?: number
  matched?: number
  region?: string | null
  regionSamples?: string[]
  error: string | null
  errorCode: string | null
  lastPollAt: string | null
}

const SEEN_KEY = "chacha-seen-alert-ids-v1"
const MAX_SEEN = 400
const DEFAULT_URL = "http://localhost:8787"

export function alertsBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_ALERTS_URL as string | undefined
  return (fromEnv && fromEnv.trim()) || DEFAULT_URL
}

export function formatLastChecked(at: Date): string {
  const h = at.getHours()
  const m = at.getMinutes()
  const ampm = h < 12 ? "오전" : "오후"
  const h12 = h % 12 || 12
  return `마지막 확인: ${ampm} ${h12}시 ${m}분`
}

export async function fetchRegionAlerts(region: string): Promise<RelayResponse> {
  const url = new URL("/alerts", alertsBaseUrl())
  if (region.trim()) url.searchParams.set("region", region.trim())
  const res = await fetch(url)
  const json = (await res.json()) as RelayResponse
  return {
    alerts: Array.isArray(json.alerts) ? json.alerts : [],
    totalToday: json.totalToday,
    matched: json.matched,
    region: json.region,
    regionSamples: json.regionSamples,
    error: json.error ?? null,
    errorCode: json.errorCode ?? null,
    lastPollAt: json.lastPollAt ?? null,
  }
}

export async function loadSeenIds(): Promise<Set<string>> {
  try {
    const { value } = await Preferences.get({ key: SEEN_KEY })
    if (!value) return new Set()
    const arr = JSON.parse(value) as unknown
    return new Set(Array.isArray(arr) ? arr.map(String) : [])
  } catch {
    return new Set()
  }
}

export async function saveSeenIds(ids: Set<string>): Promise<void> {
  const arr = [...ids]
  const trimmed = arr.length > MAX_SEEN ? arr.slice(arr.length - MAX_SEEN) : arr
  await Preferences.set({ key: SEEN_KEY, value: JSON.stringify(trimmed) })
}

/** 긴급단계명(EMRG_STEP_NM) → 앱 매칭이 쓰는 발송유형. */
export function broadcastFromLevel(level: string): "위급" | "긴급" | "안전안내" {
  if (level.includes("위급")) return "위급"
  if (level.includes("긴급")) return "긴급"
  return "안전안내"
}
