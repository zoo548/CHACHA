// 대비하기·설정에서 바로 보는 예시 화면. 알림을 보내지 않는다.

import { Preferences } from "@capacitor/preferences"
import type { BroadcastType, TemplateVariant } from "../alerts/level"
import { getAlertView, type AlertView } from "./alertTemplate"
import type { Profile, ReadingLevel } from "./profile"

export type SampleAlertSpec = {
  id: "critical" | "emergency" | "safety"
  tab: string
  name: string
  disasterId: string
  variant: TemplateVariant
  broadcast: BroadcastType
}

export const SAMPLE_ALERTS: SampleAlertSpec[] = [
  {
    id: "critical",
    tab: "지금 해야 해요 · 빨강",
    name: "호우 대피",
    disasterId: "heavy_rain",
    variant: "evacuate",
    broadcast: "긴급",
  },
  {
    id: "emergency",
    tab: "조심해요 · 주황",
    name: "폭염",
    disasterId: "heatwave",
    variant: "caution",
    broadcast: "안전안내",
  },
  {
    id: "safety",
    tab: "알아두세요 · 파랑",
    name: "미세먼지",
    disasterId: "fine_dust",
    variant: "caution",
    broadcast: "안전안내",
  },
]

export const SAMPLE_VIEW_MODES: { level: ReadingLevel; label: string }[] = [
  { level: 1, label: "글" },
  { level: 2, label: "그림과 글" },
  { level: 3, label: "큰 그림" },
]

export const SAMPLE_NO_CALL = "예시 화면에서는 전화가 걸리지 않아요"

const SAMPLE_PICKER_KEY = "chacha-sample-picker-v1"

export type SamplePickerState = {
  specId: SampleAlertSpec["id"]
  readingLevel: ReadingLevel
  hideMark: boolean
}

export const emptySamplePicker: SamplePickerState = {
  specId: "critical",
  readingLevel: 1,
  hideMark: false,
}

export function parseSamplePicker(
  raw: Partial<SamplePickerState> | null | undefined,
  fallbackLevel: ReadingLevel = 1,
): SamplePickerState {
  const specId = SAMPLE_ALERTS.some((item) => item.id === raw?.specId)
    ? (raw?.specId as SampleAlertSpec["id"])
    : emptySamplePicker.specId
  const readingLevel =
    raw?.readingLevel === 2 || raw?.readingLevel === 3
      ? raw.readingLevel
      : raw?.readingLevel === 1
        ? 1
        : fallbackLevel
  return {
    specId,
    readingLevel,
    hideMark: raw?.hideMark === true,
  }
}

export async function loadSamplePicker(fallbackLevel: ReadingLevel = 1): Promise<SamplePickerState> {
  try {
    const { value } = await Preferences.get({ key: SAMPLE_PICKER_KEY })
    if (!value) return parseSamplePicker(null, fallbackLevel)
    return parseSamplePicker(JSON.parse(value) as Partial<SamplePickerState>, fallbackLevel)
  } catch {
    return parseSamplePicker(null, fallbackLevel)
  }
}

export async function saveSamplePicker(state: SamplePickerState): Promise<void> {
  try {
    await Preferences.set({ key: SAMPLE_PICKER_KEY, value: JSON.stringify(state) })
  } catch {
    /* ignore */
  }
}

/** 카드에 이름이 없으면 엄마·이웃으로 보여 준다. */
export function samplePreviewProfile(profile: Profile): Profile {
  const guardianLabel =
    profile.guardian.relation.trim() || profile.guardian.name.trim() || "엄마"
  const neighborLabel =
    profile.neighbor.relation.trim() || profile.neighbor.name.trim() || "이웃"
  return {
    ...profile,
    guardian: {
      ...profile.guardian,
      name: profile.guardian.name.trim() || "엄마",
      relation: profile.guardian.relation.trim() || guardianLabel,
    },
    neighbor: {
      ...profile.neighbor,
      name: profile.neighbor.name.trim() || "이웃",
      relation: profile.neighbor.relation.trim() || neighborLabel,
    },
  }
}

export function sampleAlertView(
  spec: SampleAlertSpec,
  profile: Profile,
): AlertView | null {
  return getAlertView(spec.disasterId, spec.variant, samplePreviewProfile(profile), {
    broadcast: spec.broadcast,
    sample: true,
  })
}
