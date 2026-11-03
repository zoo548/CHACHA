// 차차 알림 색·차차등 신호. 정부 발송 유형(위급/긴급/안전안내)은 쓰지 않는다.
// 문장은 matchAlert 가 고른 템플릿 variant 를 그대로 쓰고, 이 파일은 색과 기기 신호만 정한다.
// docs/disaster_templates.json 문구는 여기서 고치지 않는다.

import type { AlertLevel, DeviceSignal, TemplateVariant } from "./level"

/** 주의(caution)여도 주황. 갑자기 나빠지거나, 잘못하면 다치거나, 몸 이상을 느끼기 어려운 재난. */
export const ORANGE_CAUTION_IDS: readonly string[] = [
  "heavy_rain",
  "typhoon",
  "wildfire",
  "landslide",
  "fire",
  "earthquake",
  "dam_release",
  "high_wave",
  "gas_leak",
  "crowd",
  "alert_warning",
  "heatwave",
]

/** 지금 해야 해요(빨강) 3 > 조심해요(주황) 2 > 알아두세요(파랑) 1. 연습은 0. */
export const ALERT_LEVEL_RANK: Record<AlertLevel, number> = {
  critical: 3,
  emergency: 2,
  safety: 1,
}

export function isOrangeCaution(disasterId?: string | null): boolean {
  return typeof disasterId === "string" && ORANGE_CAUTION_IDS.includes(disasterId)
}

/** 차차 색 등급. evacuate 는 빨강, 지정 caution 은 주황, 나머지 caution 은 파랑. */
export function resolveAlertLevel(opts: {
  disasterId?: string | null
  variant?: TemplateVariant
}): AlertLevel {
  if (opts.variant === "evacuate") return "critical"
  if (opts.variant === "caution" && isOrangeCaution(opts.disasterId)) return "emergency"
  return "safety"
}

/** 앱 → 차차등 알림 명령. 빨강 호우는 R, 그 외 빨강은 H. */
export function deviceCommand(
  level: AlertLevel,
  disasterId?: string | null,
): Exclude<DeviceSignal, "C" | "F" | "M"> {
  if (level === "critical" && disasterId === "heavy_rain") return "R"
  if (level === "critical") return "H"
  if (level === "emergency") return "L"
  return "I"
}

export function gradeDots(level: AlertLevel): string {
  if (level === "critical") return "●●●"
  if (level === "emergency") return "●●"
  return "●"
}

export function gradeEasyName(level: AlertLevel): string {
  if (level === "critical") return "지금 해야 해요"
  if (level === "emergency") return "조심해요"
  return "알아두세요"
}

export function badgeLabel(level: AlertLevel): string {
  return `${gradeDots(level)} ${gradeEasyName(level)}`
}
