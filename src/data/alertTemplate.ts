// JSON 템플릿(docs/disaster_templates.json) → 알림 화면이 쓰기 좋은 형태로 변환.
//
// 생성형 AI 쓰지 않는다. 문구는 JSON 그대로, 슬롯({보호자}/{이웃})만 profile 로 채운다.
// short 필드는 타입이 받을 수 있게만 열어 두고, JSON 에는 넣지 않는다.

import { isExcludedDisaster } from "../alerts/excluded"
import {
  resolveAlertLevel,
  type AlertLevel,
  type BroadcastType,
  type TemplateVariant,
} from "../alerts/level"
import templates from "../../docs/disaster_templates.json"
import { maskPhone, type Profile } from "./profile"
import type { IconName } from "../types"

export type PhoneKind = "guardian" | "neighbor" | "119" | "112"

export type AlertAction = {
  text: string
  /** JSON 에 short 가 있으면 쓰고, 없으면 화면에서 원래 문장으로 폴백. */
  short?: string
  /** 1단계용 선 아이콘. */
  icon?: IconName
  /** JSON icon 이름. 2·3단계 그림. 없으면 2단계는 빈 자리, 3단계는 글만. */
  art?: string
  phone?: boolean
  disabled?: boolean
  /** 3단계에서 바로 걸 번호. */
  phoneNumber?: string
  /** 문장 또는 JSON icon 으로 알아낸 전화 대상. */
  phoneKind?: PhoneKind
  /** 버튼 둘째 줄에 쓸 이름. 예: 엄마, 119 */
  who?: string
  /** 끝 네 자리만 남긴 번호. */
  maskedNumber?: string
}

/** 알림 뷰가 그대로 쓰는 알림 데이터. 색은 정부 3단계, 연습은 practice. */
export type AlertView = {
  uiLevel: AlertLevel | "practice"
  sample?: boolean
  title: string
  situation: string
  /** 1단계 헤더용 선 아이콘. */
  hero: IconName
  /** JSON hero_icon. 2·3단계 대표 그림. */
  heroArt: string
  actions: AlertAction[]
  /** 참고용 (원문보기 시트, 디버그) */
  sourceType?: string
  rawText?: string
}

type JsonAction = {
  text: string
  icon?: string
  short?: string
  hide_if_empty?: string
}
export type AlertViewOptions = {
  broadcast?: string | null
  rawText?: string
  sample?: boolean
  alertLevel?: AlertLevel
}

type JsonVariant = {
  level: TemplateVariant
  device_signal: string
  source_type: string
  title: string
  situation: string
  actions: JsonAction[]
}
type JsonDisaster = {
  id: string
  name_official: string
  hero_icon: string
  variants: JsonVariant[]
}

const disasters = templates.disasters as JsonDisaster[]

/** JSON 의 hero_icon → 자체 IconName. 매칭 안 되는 건 "bell" 로 폴백. */
const HERO_MAP: Record<string, IconName> = {
  rain_heavy: "cloud",
  typhoon: "cloud",
  snow_cold: "cloud",
  snow_heavy: "cloud",
  wind: "cloud",
  lightning: "cloud",
  dust: "cloud",
  sun_hot: "sun",
  drought: "sun",
  earthquake: "building",
  collapse: "building",
  landslide: "building",
  wildfire: "alert",
  fire: "alert",
  chemical: "alert",
  gas: "alert",
  radiation: "alert",
  siren: "alert",
  virus: "alert",
  tsunami: "water",
  wave: "water",
  dam: "water",
  water_off: "water",
  ice: "water",
  power: "light",
  crowd: "people",
  search: "people",
  road_closed: "map",
}

/** 액션의 icon → 자체 IconName. 없는 것은 아이콘 생략. */
const ACTION_ICON_MAP: Record<string, IconName | undefined> = {
  stay_home: "home",
  no_river: "water",
  no_mountain: "map",
  away_mountain: "map",
  away_sea: "water",
  away_window: "home",
  close_window: "home",
  exit_basement: "stairs",
  under_desk: "desk",
  go_underground: "stairs",
  drink_water: "water",
  cool_place: "shade",
  wet_towel: "shade",
  bag_ready: "list",
  follow_guide: "people",
  phone_119: "call",
  phone_112: "call",
  phone_guardian: "call",
  phone_neighbor: "call",
}

function detectPhoneKind(rawText: string, iconKey: string): PhoneKind | undefined {
  if (iconKey === "phone_119") return "119"
  if (iconKey === "phone_112") return "112"
  if (iconKey === "phone_guardian") return "guardian"
  if (iconKey === "phone_neighbor") return "neighbor"
  if (rawText.includes("119")) return "119"
  if (rawText.includes("112")) return "112"
  if (rawText.includes("{이웃}") || rawText.includes("이웃에게")) return "neighbor"
  if (rawText.includes("{보호자}") || rawText.includes("보호자에게")) return "guardian"
  return undefined
}

function phoneNumberFor(kind: PhoneKind, profile: Profile): string | undefined {
  if (kind === "119") return "119"
  if (kind === "112") return "112"
  if (kind === "guardian") return profile.guardian.phone || undefined
  return profile.neighbor.phone || undefined
}

function whoFor(kind: PhoneKind, profile: Profile): string {
  if (kind === "119" || kind === "112") return kind
  if (kind === "guardian") return profile.guardian.relation || profile.guardian.name || "보호자"
  return profile.neighbor.relation || profile.neighbor.name || "이웃"
}

function phoneFields(kind: PhoneKind | undefined, profile: Profile) {
  if (!kind) return {}
  const phoneNumber = phoneNumberFor(kind, profile)
  const missing = (kind === "guardian" || kind === "neighbor") && !phoneNumber
  return {
    phone: true as const,
    phoneKind: kind,
    phoneNumber,
    who: whoFor(kind, profile),
    maskedNumber: phoneNumber ? maskPhone(phoneNumber) : undefined,
    disabled: missing || undefined,
  }
}

/** JSON actions → UI actions. {보호자}/{이웃} 치환, 번호 없으면 전화 액션은 비활성. */
function materializeActions(actions: JsonAction[], profile: Profile): AlertAction[] {
  const guardianLabel = profile.guardian.relation || profile.guardian.name || "보호자"
  const neighborLabel = profile.neighbor.relation || profile.neighbor.name || "이웃"
  return actions
    .filter((a) => {
      const kind = detectPhoneKind(a.text, a.icon ?? "")
      // 전화 줄은 번호가 없어도 남겨 두고, 화면에서 안내한다.
      if (kind) return true
      if (a.hide_if_empty === "이웃") return !!profile.neighbor.phone
      if (a.hide_if_empty === "보호자") return !!profile.guardian.phone
      return true
    })
    .map((a) => {
      const iconKey = a.icon ?? ""
      const kind = detectPhoneKind(a.text, iconKey)
      const text = a.text
        .replace(/\{보호자\}/g, guardianLabel)
        .replace(/\{이웃\}/g, neighborLabel)
      return {
        text,
        short: a.short,
        icon: ACTION_ICON_MAP[iconKey],
        art: a.icon,
        ...phoneFields(kind, profile),
      }
    })
}

/** 재난 id + 템플릿 variant → 알림 뷰. 색은 options.broadcast 로 따로 정한다. */
export function getAlertView(
  disasterId: string,
  level: TemplateVariant,
  profile: Profile,
  options?: AlertViewOptions,
): AlertView | null {
  if (disasterId === "practice") return practiceView(profile)
  const d = disasters.find((x) => x.id === disasterId)
  if (!d) return null
  // 요청한 레벨이 있으면 그걸, 없으면 그 재난이 가진 유일 variant 로 폴백 (예: tsunami 는 evacuate 만).
  const variant: JsonVariant | undefined =
    d.variants.find((v) => v.level === level) ?? d.variants[0]
  if (!variant) return null
  const uiLevel =
    options?.alertLevel ??
    resolveAlertLevel({
      broadcast: options?.broadcast,
      variant: variant.level,
      rawText: options?.rawText,
    })
  return {
    uiLevel,
    sample: options?.sample,
    title: variant.title,
    situation: variant.situation,
    hero: HERO_MAP[d.hero_icon] ?? "bell",
    heroArt: d.hero_icon,
    actions: materializeActions(variant.actions, profile),
    sourceType: variant.source_type,
    rawText: options?.rawText,
  }
}

/** 재난 목록 (시연 패널 드롭다운용). */
export function listDisasters(): { id: string; name: string; levels: TemplateVariant[] }[] {
  return disasters
    .filter((d) => !isExcludedDisaster(d.id))
    .map((d) => ({
      id: d.id,
      name: d.name_official,
      levels: d.variants.map((v) => v.level),
    }))
}

/** 연습 알림 — JSON 에 없는 특별 케이스. */
function practiceView(profile: Profile): AlertView {
  const guardianLabel = profile.guardian.relation || profile.guardian.name || "보호자"
  return {
    uiLevel: "practice",
    title: "연습 알림이에요",
    situation: "진짜 재난이 아니에요.",
    hero: "bell",
    heroArt: "bell",
    actions: [
      { text: "이 화면을 끝까지 읽어요." },
      {
        text: `${guardianLabel}에게 전화해요.`,
        icon: "call",
        art: "phone_guardian",
        ...phoneFields("guardian", profile),
      },
      { text: '아래 "알았어요"를 눌러요.' },
    ],
  }
}

/** 매칭 실패/원문 테스트 — 원문을 그대로 보여주고, 색은 발송 유형을 따른다. */
export function rawTextView(
  rawText: string,
  profile: Profile,
  broadcast?: BroadcastType,
  sample?: boolean,
): AlertView {
  return {
    uiLevel: resolveAlertLevel({ broadcast, rawText }),
    sample,
    title: "재난문자가 왔어요",
    situation: rawText || "",
    hero: "bell",
    heroArt: "bell",
    actions: [
      { text: "내용을 끝까지 읽어요." },
      {
        text: "잘 모르면 보호자에게 전화해요.",
        icon: "call",
        art: "phone_guardian",
        ...phoneFields("guardian", profile),
      },
    ],
    rawText,
  }
}
