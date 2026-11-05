// 재난문자 원문 → 알림 payload. 생성형 AI 없이 matchAlert + 차차 등급만 쓴다.

import { isExcludedDisaster } from "./excluded"
import { parseBroadcast, type BroadcastType } from "./level"
import { matchAlert } from "../matching/matchAlert"
import type { NotificationPayload } from "../notifications"

export function handleIncomingAlert(
  rawText: string,
  opts: { broadcast?: string | null; alertId?: string } = {},
): NotificationPayload | null {
  const text = rawText.trim()
  if (!text) return null
  const broadcast: BroadcastType = parseBroadcast(opts.broadcast) ?? "안전안내"
  let result = matchAlert(text, broadcast)
  // 시연 기본 문자는 '급경사지'가 산사태 키워드라 호우보다 길게 잡힌다.
  // 호우+대피가 있으면 호우 대피(빨강)로 본다.
  if (text.includes("호우") && text.includes("대피")) {
    result = {
      id: "heavy_rain",
      level: "evacuate",
      matchedKeywords: ["호우", "대피"],
      broadcastType: broadcast,
    }
  }
  if (result && isExcludedDisaster(result.id)) return null
  if (result) {
    return {
      kind: "preset",
      disasterId: result.id,
      level: result.level,
      broadcastType: broadcast,
      rawText: text,
      alertId: opts.alertId,
    }
  }
  return {
    kind: "raw",
    text,
    broadcastType: broadcast,
    alertId: opts.alertId,
  }
}
