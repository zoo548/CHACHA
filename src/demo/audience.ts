// QR(?demo=1)로 들어온 관객 시연 모드. 개인정보는 휴대폰 안에만 둔다.

import { Preferences } from "@capacitor/preferences"
import { emptyProfile, type Profile } from "../data/profile"

const AUDIENCE_KEY = "chacha-demo-audience-v1"

export const DEMO_NO_CALL = "시연에서는 전화가 걸리지 않아요"

export const DEMO_WAIT_BANNER = "시연 참여 중 · 발표를 기다리고 있어요"

export const DEMO_OFFLINE_BANNER = "연결이 끊겼어요 · 다시 연결 중"

export const DEMO_INVITE_LABEL = "지금 시연에 참여하기"

export const DEMO_START_FRESH = "처음부터 시작하기"

/** 발표 기간에만 Vercel 에서 VITE_DEMO_DEFAULT=true. 빌드에 들어간다. */
export function isDemoDefault(): boolean {
  const value = import.meta.env.VITE_DEMO_DEFAULT
  return value === "true" || value === "1"
}

export type DemoEntry = {
  screen: "demo-join" | "home" | "onboarding"
  audience: boolean
  clearSaved: boolean
}

/** 시연 기간·QR·저장된 참여·프로필로 첫 화면을 고른다. */
export function resolveDemoEntry(input: {
  demoPeriod: boolean
  demoQuery: boolean
  joined: boolean
  profileReady: boolean
}): DemoEntry {
  const demoOn = input.demoPeriod || input.demoQuery
  if (input.joined && demoOn) {
    return { screen: "home", audience: true, clearSaved: false }
  }
  const clearSaved = input.joined && !demoOn
  if (input.demoQuery) return { screen: "demo-join", audience: false, clearSaved }
  if (input.demoPeriod && !input.profileReady) {
    return { screen: "demo-join", audience: false, clearSaved }
  }
  if (input.profileReady) return { screen: "home", audience: false, clearSaved }
  return { screen: "onboarding", audience: false, clearSaved }
}

/** 가짜 번호. 화면에서 전화가 걸리지 않게 막는다. */
export const demoAudienceProfile: Profile = {
  ...emptyProfile,
  name: "김호두",
  address: "서울 관악구",
  guardian: {
    name: "엄마",
    relation: "엄마",
    phone: "010-0000-1111",
    arrival: "",
  },
  neighbor: {
    name: "옆집 이모",
    relation: "옆집 이모",
    phone: "010-0000-2222",
    arrival: "",
  },
  readingLevel: 2,
  soundSensitive: false,
}

export function hasDemoQuery(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("demo") === "1"
}

export async function loadDemoAudience(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: AUDIENCE_KEY })
    return value === "1"
  } catch {
    return false
  }
}

export async function saveDemoAudience(on: boolean): Promise<void> {
  try {
    if (on) await Preferences.set({ key: AUDIENCE_KEY, value: "1" })
    else await Preferences.remove({ key: AUDIENCE_KEY })
  } catch {
    /* ignore */
  }
}
