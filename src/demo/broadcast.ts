// 시연 문자 → 알림 payload · 차차등 명령. 생성형 AI 없이 템플릿 매칭만 쓴다.

import { handleIncomingAlert } from "../alerts/handleIncomingAlert"
import { deviceCommand, resolveAlertLevel } from "../alerts/level"
import { getAlertView, rawTextView } from "../data/alertTemplate"
import type { Profile } from "../data/profile"
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
  return (
    handleIncomingAlert(msg.message, {
      broadcast: msg.govType,
      alertId: msg.id,
    }) ?? {
      kind: "raw",
      text: msg.message,
      broadcastType: "안전안내",
      alertId: msg.id,
    }
  )
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
