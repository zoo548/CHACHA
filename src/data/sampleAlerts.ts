// 누구나 눌러 볼 수 있는 3색 예시 알림.

import type { BroadcastType, TemplateVariant } from "../alerts/level"

export type SampleAlertSpec = {
  id: "critical" | "emergency" | "safety"
  button: string
  name: string
  disasterId: string
  variant: TemplateVariant
  broadcast: BroadcastType
}

export const SAMPLE_ALERTS: SampleAlertSpec[] = [
  {
    id: "critical",
    button: "위급 예시 · 빨강",
    name: "공습경보",
    disasterId: "air_raid",
    variant: "evacuate",
    broadcast: "위급",
  },
  {
    id: "emergency",
    button: "긴급 예시 · 주황",
    name: "호우 대피",
    disasterId: "heavy_rain",
    variant: "evacuate",
    broadcast: "긴급",
  },
  {
    id: "safety",
    button: "안전안내 예시 · 파랑",
    name: "폭염",
    disasterId: "heatwave",
    variant: "caution",
    broadcast: "안전안내",
  },
]

export const SAMPLE_DELAY_SEC = 5
