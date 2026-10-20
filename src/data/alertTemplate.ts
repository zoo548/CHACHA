// JSON 템플릿(docs/disaster_templates.json) → 알림 화면이 쓰기 좋은 형태로 변환.
//
// 생성형 AI 쓰지 않는다. 문구는 JSON 그대로, 슬롯({보호자}/{이웃})만 profile 로 채운다.

import templates from "../../docs/disaster_templates.json"
import type { Profile } from "./profile"
import type { IconName } from "../types"

export type AlertAction = {
  text: string
  icon?: IconName
  phone?: boolean
  disabled?: boolean
}

/** 알림 뷰가 그대로 쓰는 알림 데이터. UI 레벨은 danger/caution/practice. */
export type AlertView = {
  uiLevel: "danger" | "caution" | "practice"
  title: string
  situation: string
  hero: IconName
  actions: AlertAction[]
  /** 참고용 (원문보기 시트, 디버그) */
  sourceType?: string
  rawText?: string
}

type JsonAction = {
  text: string
  icon?: string
  hide_if_empty?: string
}
type JsonVariant = {
  level: "caution" | "evacuate"
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

const PHONE_ICON_KEYS = new Set(["phone_119", "phone_112", "phone_guardian", "phone_neighbor"])

/** JSON actions → UI actions. {보호자}/{이웃} 치환, 번호 없으면 전화 액션은 비활성. */
function materializeActions(actions: JsonAction[], profile: Profile): AlertAction[] {
  const guardianLabel = profile.guardian.relation || profile.guardian.name || "보호자"
  const neighborLabel = profile.neighbor.relation || profile.neighbor.name || "이웃"
  return actions
    .filter((a) => {
      if (a.hide_if_empty === "이웃") return !!profile.neighbor.phone
      if (a.hide_if_empty === "보호자") return !!profile.guardian.phone
      return true
    })
    .map((a) => {
      const text = a.text
        .replace(/\{보호자\}/g, guardianLabel)
        .replace(/\{이웃\}/g, neighborLabel)
      const iconKey = a.icon ?? ""
      const phone = PHONE_ICON_KEYS.has(iconKey)
      // 전화 액션인데 해당 번호가 등록 안 돼 있으면 비활성화 (리스트에 두되 눌러도 전화 안 감).
      const disabled =
        (iconKey === "phone_guardian" && !profile.guardian.phone) ||
        (iconKey === "phone_neighbor" && !profile.neighbor.phone) ||
        false
      return {
        text,
        icon: ACTION_ICON_MAP[iconKey],
        phone: phone || undefined,
        disabled: disabled || undefined,
      }
    })
}

/** 재난 id + 레벨 → 알림 뷰. 없으면 null. */
export function getAlertView(
  disasterId: string,
  level: "caution" | "evacuate",
  profile: Profile,
): AlertView | null {
  if (disasterId === "practice") return practiceView(profile)
  const d = disasters.find((x) => x.id === disasterId)
  if (!d) return null
  // 요청한 레벨이 있으면 그걸, 없으면 그 재난이 가진 유일 variant 로 폴백 (예: tsunami 는 evacuate 만).
  const variant: JsonVariant | undefined =
    d.variants.find((v) => v.level === level) ?? d.variants[0]
  if (!variant) return null
  return {
    uiLevel: variant.level === "evacuate" ? "danger" : "caution",
    title: variant.title,
    situation: variant.situation,
    hero: HERO_MAP[d.hero_icon] ?? "bell",
    actions: materializeActions(variant.actions, profile),
    sourceType: variant.source_type,
  }
}

/** 재난 목록 (시연 패널 드롭다운용). */
export function listDisasters(): { id: string; name: string; levels: ("caution" | "evacuate")[] }[] {
  return disasters.map((d) => ({
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
    actions: [
      { text: "이 화면을 끝까지 읽어요." },
      {
        text: `${guardianLabel}에게 전화해요.`,
        phone: true,
        disabled: !profile.guardian.phone,
      },
      { text: '아래 "알았어요"를 눌러요.' },
    ],
  }
}

/** 매칭 실패/원문 테스트 — 원문을 그대로 보여주고 주의로. */
export function rawTextView(rawText: string): AlertView {
  return {
    uiLevel: "caution",
    title: "재난문자가 왔어요",
    situation: rawText || "",
    hero: "bell",
    actions: [
      { text: "내용을 끝까지 읽어요." },
      { text: "잘 모르면 보호자에게 전화해요.", phone: true },
    ],
    rawText,
  }
}
