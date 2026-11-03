// 정부 재난문자 3단계 → 앱 색·차차등 신호.
// 행동 문장은 matchAlert 가 고른 템플릿 variant(caution/evacuate)를 쓰고,
// 이 파일은 색과 기기 신호만 정한다. 등급을 낮추는 규칙은 없다.

export type BroadcastType = "위급" | "긴급" | "안전안내"
export type TemplateVariant = "caution" | "evacuate"
export type AlertLevel = "critical" | "emergency" | "safety"
export type DeviceSignal = "H" | "L" | "I" | "R" | "C" | "F" | "M"
export type DeviceVoice = "F" | "M"

/** 위급(H/R) > 긴급(L) > 안전안내(I). 연습은 0. */
export const ALERT_LEVEL_RANK: Record<AlertLevel, number> = {
  critical: 3,
  emergency: 2,
  safety: 1,
}

/** API 긴급단계명(위급재난/긴급재난/안전안내) → 발송 유형. 모르면 undefined. */
export function parseBroadcast(raw: string | undefined | null): BroadcastType | undefined {
  if (!raw) return undefined
  if (raw.includes("위급")) return "위급"
  if (raw.includes("긴급")) return "긴급"
  if (raw.includes("안전안내")) return "안전안내"
  return undefined
}

/** 중계 서버 값처럼 항상 값이 필요할 때. 모르면 안전안내. */
export function broadcastFromLevel(level: string): BroadcastType {
  return parseBroadcast(level) ?? "안전안내"
}

export function resolveAlertLevel(opts: {
  broadcast?: string | null
  variant?: TemplateVariant
  rawText?: string
}): AlertLevel {
  const parsed = parseBroadcast(opts.broadcast)
  let level: AlertLevel
  if (parsed === "위급") level = "critical"
  else if (parsed === "긴급") level = "emergency"
  else if (parsed === "안전안내") level = "safety"
  else level = opts.variant === "evacuate" ? "emergency" : "safety"

  if (level === "safety" && opts.rawText?.includes("대피")) {
    return "emergency"
  }
  return level
}

/** 앱 → 차차등 알림 명령. 위급+호우는 R, 그 외 위급은 H. */
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

export function gradeOfficialName(level: AlertLevel): string {
  if (level === "critical") return "위급재난문자"
  if (level === "emergency") return "긴급재난문자"
  return "안전안내문자"
}

export function badgeLabel(level: AlertLevel): string {
  return `${gradeDots(level)} ${gradeEasyName(level)}`
}
