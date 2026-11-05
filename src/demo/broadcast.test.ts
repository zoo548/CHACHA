import { describe, expect, it } from "vitest"
import { deviceCommand, resolveAlertLevel } from "../alerts/tier"
import {
  DEFAULT_DEMO_GOV_TYPE,
  DEFAULT_DEMO_MESSAGE,
  demoDeviceCommand,
  demoMessageToPayload,
  formatDemoSentAt,
} from "./broadcast"

describe("시연 방송", () => {
  it("기본 문자는 호우 대피라서 차차등 명령이 R 이다", () => {
    const payload = demoMessageToPayload({
      id: "demo-1",
      sentAt: "2026-11-05T15:12:00+09:00",
      message: DEFAULT_DEMO_MESSAGE,
      sender: "관악구청",
      govType: DEFAULT_DEMO_GOV_TYPE,
    })
    expect(payload.kind).toBe("preset")
    if (payload.kind !== "preset") return
    expect(payload.disasterId).toBe("heavy_rain")
    expect(payload.level).toBe("evacuate")
    expect(payload.alertId).toBe("demo-1")
    expect(payload.broadcastType).toBe("안전안내")
    const level = resolveAlertLevel({
      disasterId: payload.disasterId,
      variant: payload.level,
    })
    expect(level).toBe("critical")
    expect(deviceCommand(level, payload.disasterId)).toBe("R")
    expect(demoDeviceCommand({ message: DEFAULT_DEMO_MESSAGE, govType: DEFAULT_DEMO_GOV_TYPE })).toBe("R")
  })

  it("보낸 시각을 오후 3시 12분처럼 보여 준다", () => {
    expect(formatDemoSentAt("2026-11-05T15:12:00+09:00")).toBe("보냈어요 · 오후 3시 12분")
  })
})
