// 시연 문자 → 알림 payload · 차차등 명령. 생성형 AI 없이 템플릿 매칭만 쓴다.

import { isExcludedDisaster } from "../alerts/excluded"
import { deviceCommand, parseBroadcast, resolveAlertLevel } from "../alerts/level"
import { getAlertView, rawTextView } from "../data/alertTemplate"
import type { Profile } from "../data/profile"
import { matchAlert } from "../matching/matchAlert"
import type { NotificationPayload } from "../notifications"
import {
  DEFAULT_DEMO_GOV_TYPE,
  DEFAULT_DEMO_MESSAGE,
  DEFAULT_DEMO_SENDER,
  type DemoMessage,
} from "../../shared/demoDefaults"

export type { DemoMessage }
export { DEFAULT_DEMO_GOV_TYPE, DEFAULT_DEMO_MESSAGE, DEFAULT_DEMO_SENDER }

export function demoMessageToPayload(msg: DemoMessage): NotificationPayload {
  const broadcast = parseBroadcast(msg.govType) ?? "안전안내"
  // 기본 시연 문자는 '급경사지'가 산사태 키워드라 호우보다 길게 잡힌다.
  // 발표용 호우 대피 화면·차차등 R 을 위해 호우+대피가 있으면 호우로 본다.
  const rainDemo = msg.message.includes("호우") && msg.message.includes("대피")
  const result = rainDemo
    ? { id: "heavy_rain" as const, level: "evacuate" as const }
    : matchAlert(msg.message, broadcast)
  if (result && !isExcludedDisaster(result.id)) {
    return {
      kind: "preset",
      disasterId: result.id,
      level: result.level,
      broadcastType: broadcast,
      rawText: msg.message,
      alertId: msg.id,
    }
  }
  return {
    kind: "raw",
    text: msg.message,
    broadcastType: broadcast,
    alertId: msg.id,
  }
}

export function demoDeviceCommand(msg: Pick<DemoMessage, "message" | "govType">): "H" | "L" | "I" | "R" {
  const payload = demoMessageToPayload({
    id: "preview",
    sentAt: "",
    message: msg.message,
    sender: "",
    govType: msg.govType,
  })
  if (payload.kind === "preset") {
    const level = resolveAlertLevel({ disasterId: payload.disasterId, variant: payload.level })
    return deviceCommand(level, payload.disasterId)
  }
  return deviceCommand(resolveAlertLevel({}))
}

export function demoNotificationCopy(
  msg: DemoMessage,
  profile: Profile,
): { title: string; body: string; payload: NotificationPayload } {
  const payload = demoMessageToPayload(msg)
  if (payload.kind === "preset") {
    const view = getAlertView(payload.disasterId, payload.level, profile, {
      broadcast: payload.broadcastType,
      rawText: payload.rawText,
    })
    return {
      title: view?.title ?? "재난문자가 왔어요",
      body: view?.situation ?? msg.message,
      payload,
    }
  }
  if (payload.kind === "raw") {
    const view = rawTextView(payload.text, profile, payload.broadcastType)
    return {
      title: view.title,
      body: view.situation,
      payload,
    }
  }
  return {
    title: "재난문자가 왔어요",
    body: msg.message,
    payload,
  }
}

export function formatDemoSentAt(iso: string): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return "보냈어요"
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).formatToParts(at)
  const period = parts.find((part) => part.type === "dayPeriod")?.value ?? ""
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0")
  const ampm = period.includes("후") || period.toUpperCase() === "PM" ? "오후" : "오전"
  return `보냈어요 · ${ampm} ${hour}시 ${minute}분`
}

export const defaultDemoFields = {
  message: DEFAULT_DEMO_MESSAGE,
  sender: DEFAULT_DEMO_SENDER,
  govType: DEFAULT_DEMO_GOV_TYPE,
}
