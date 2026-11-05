// 정부 재난문자 발송 유형. 화면 맨 아래 회색 글씨에만 쓰고, 색·차차등 신호는 tier.ts.

export type BroadcastType = "위급" | "긴급" | "안전안내"
export type TemplateVariant = "caution" | "evacuate"
export type AlertLevel = "critical" | "emergency" | "safety"
export type DeviceSignal = "H" | "L" | "I" | "R" | "C" | "F" | "M" | "Q" | "N"
export type DeviceVoice = "F" | "M"
export type DeviceSound = "Q" | "N"
export type DeviceAlertCommand = "H" | "L" | "I" | "R"

export {
  ALERT_LEVEL_RANK,
  badgeLabel,
  deviceCommand,
  devicePrefCommands,
  gradeDots,
  gradeEasyName,
  resolveAlertLevel,
  SIGNAL_DESCRIPTIONS,
  soundCommand,
} from "./tier"

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

/** 원래 정부 문자 이름. 색 등급과 따로 둔다. */
export function broadcastOfficialName(broadcast?: string | null): string | undefined {
  const parsed = parseBroadcast(broadcast)
  if (parsed === "위급") return "위급재난문자"
  if (parsed === "긴급") return "긴급재난문자"
  if (parsed === "안전안내") return "안전안내문자"
  return undefined
}

/** 원문 앞 [기관] 이 있으면 그걸, 없으면 행정안전부. */
export function senderAgency(rawText?: string | null): string {
  const match = rawText?.trim().match(/^\[([^\]]+)\]/)
  const name = match?.[1]?.trim()
  return name || "행정안전부"
}

export function sourceCaption(broadcast?: string | null, rawText?: string | null): string {
  const parts = [broadcastOfficialName(broadcast), senderAgency(rawText), "원문 보기 ⌄"]
  return parts.filter(Boolean).join(" · ")
}
