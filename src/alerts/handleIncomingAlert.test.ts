import { describe, expect, it } from "vitest"
import { DEFAULT_DEMO_GOV_TYPE, DEFAULT_DEMO_MESSAGE } from "../../shared/demoDefaults"
import { matchAlert } from "../matching/matchAlert"
import { resolveAlertLevel } from "./tier"
import { handleIncomingAlert } from "./handleIncomingAlert"

describe("handleIncomingAlert", () => {
  it("시연 원문에 대피가 있으면 빨강(지금 해야 해요)이다", () => {
    const matched = matchAlert(DEFAULT_DEMO_MESSAGE, "안전안내")
    expect(matched?.level).toBe("evacuate")
    const payload = handleIncomingAlert(DEFAULT_DEMO_MESSAGE, {
      broadcast: DEFAULT_DEMO_GOV_TYPE,
      alertId: "demo-1",
    })
    expect(payload?.kind).toBe("preset")
    if (payload?.kind !== "preset") return
    expect(payload.disasterId).toBe("heavy_rain")
    expect(payload.level).toBe("evacuate")
    expect(payload.rawText).toBe(DEFAULT_DEMO_MESSAGE)
    expect(
      resolveAlertLevel({ disasterId: payload.disasterId, variant: payload.level }),
    ).toBe("critical")
  })
})
