// QR(?demo=1)로 들어온 관객 시연 모드. 개인정보는 휴대폰 안에만 둔다.

import { Preferences } from "@capacitor/preferences"
import { emptyProfile, type Profile } from "../data/profile"

const AUDIENCE_KEY = "chacha-demo-audience-v1"

export const DEMO_NO_CALL = "시연에서는 전화가 걸리지 않아요"

export const DEMO_WAIT_BANNER = "시연 참여 중 · 발표를 기다리고 있어요"

export const DEMO_OFFLINE_BANNER = "연결이 끊겼어요 · 다시 연결 중"

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
