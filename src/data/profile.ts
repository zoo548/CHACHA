// 사용자 프로필 (내 재난 대비 카드의 모든 항목).
//
// 저장소: @capacitor/preferences
// - 아이폰/안드로이드: 네이티브 Preferences (iOS=UserDefaults, Android=SharedPreferences)
//   → 앱을 닫거나 재시작해도 유지. 서버로는 절대 보내지 않는다.
// - 웹(개발/Vercel): localStorage 로 자동 폴백.
//
// 핵심 규칙:
// 1) 외부 전송 금지 — 함수에서 fetch/XHR 쓰지 않는다.
// 2) 저장 키는 PROFILE_KEY 하나만 쓴다. 전체 JSON 을 통째로 저장/불러오기.

import { Preferences } from "@capacitor/preferences"

/** 보호자/이웃 공통 정보. */
export type Contact = {
  name: string
  relation: string
  phone: string
  /** 우리 집까지 오는 시간. ProtoChips 라벨 중 하나 또는 "". */
  arrival: string
}

/** 복지관/센터 등 기관. */
export type Institution = {
  name: string
  phone: string
}

/** 저장되는 사용자 정보 전부. */
export type Profile = {
  name: string
  address: string
  shelter: string
  guardian: Contact
  neighbor: Contact
  institution: Institution
  /** 소통 방법 (여러 개). ProtoChips 라벨. */
  communication: string[]
  /** 이동할 때 필요한 도움 (한 개). */
  mobility: string
  hardThing: string
  bring: string
}

/** 아무것도 입력하지 않은 초기 값. */
export const emptyProfile: Profile = {
  name: "",
  address: "",
  shelter: "",
  guardian: { name: "", relation: "", phone: "", arrival: "" },
  neighbor: { name: "", relation: "", phone: "", arrival: "" },
  institution: { name: "", phone: "" },
  communication: [],
  mobility: "",
  hardThing: "",
  bring: "",
}

const PROFILE_KEY = "chacha-profile-v1"

/** 저장된 프로필 불러오기. 없거나 깨졌으면 emptyProfile. */
export async function loadProfile(): Promise<Profile> {
  try {
    const { value } = await Preferences.get({ key: PROFILE_KEY })
    if (!value) return emptyProfile
    const parsed = JSON.parse(value) as Partial<Profile>
    // 저장된 버전에 새 필드가 빠져 있어도 기본값과 섞어서 돌려 준다.
    return {
      ...emptyProfile,
      ...parsed,
      guardian: { ...emptyProfile.guardian, ...(parsed.guardian ?? {}) },
      neighbor: { ...emptyProfile.neighbor, ...(parsed.neighbor ?? {}) },
      institution: { ...emptyProfile.institution, ...(parsed.institution ?? {}) },
      communication: Array.isArray(parsed.communication) ? parsed.communication : [],
    }
  } catch {
    return emptyProfile
  }
}

/** 프로필 저장. 실패해도 화면은 영향 받지 않도록 조용히 넘긴다. */
export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await Preferences.set({ key: PROFILE_KEY, value: JSON.stringify(profile) })
  } catch {
    /* ignore */
  }
}

/** 저장된 프로필이 "완료된" 상태인지 — 이름 + 첫 보호자 이름이 있으면 완료로 본다. */
export function isProfileReady(profile: Profile): boolean {
  return profile.name.trim().length > 0 && profile.guardian.name.trim().length > 0
}

/** 전화번호에서 숫자만 뽑는다 (tel: 링크용). */
export function toTelDigits(raw: string): string {
  return (raw ?? "").replace(/[^\d+]/g, "")
}

/** 사람(보호자/이웃) 소개 문구. 비어 있는 필드는 자동으로 건너뛴다. */
export function describeContact(contact: Contact): string {
  const bits: string[] = []
  if (contact.name) bits.push(contact.name)
  if (contact.relation) bits.push(`(${contact.relation})`)
  if (contact.phone) bits.push(contact.phone)
  if (contact.arrival) bits.push(contact.arrival)
  return bits.join(" · ")
}

/** 기관 소개 문구. */
export function describeInstitution(inst: Institution): string {
  const bits: string[] = []
  if (inst.name) bits.push(inst.name)
  if (inst.phone) bits.push(inst.phone)
  return bits.join(" · ")
}
