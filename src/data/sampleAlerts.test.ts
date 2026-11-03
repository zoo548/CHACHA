import { describe, expect, it } from "vitest"
import { deviceCommand, resolveAlertLevel } from "../alerts/tier"
import { emptyProfile } from "./profile"
import {
  SAMPLE_ALERTS,
  sampleAlertView,
  samplePreviewProfile,
} from "./sampleAlerts"

describe("예시 화면", () => {
  it("호우 대피·폭염·미세먼지는 R, L, I 이다", () => {
    const commands = SAMPLE_ALERTS.map((spec) =>
      deviceCommand(
        resolveAlertLevel({ disasterId: spec.disasterId, variant: spec.variant }),
        spec.disasterId,
      ),
    )
    expect(commands).toEqual(["R", "L", "I"])
  })

  it("카드 이름이 없으면 엄마와 이웃으로 보여 준다", () => {
    const preview = samplePreviewProfile(emptyProfile)
    expect(preview.guardian.relation).toBe("엄마")
    expect(preview.neighbor.relation).toBe("이웃")
    const view = sampleAlertView(SAMPLE_ALERTS[0], emptyProfile)
    expect(view?.sample).toBe(true)
    expect(view?.actions.some((action) => action.text.includes("엄마"))).toBe(true)
  })

  it("카드에 적은 보호자 이름을 쓴다", () => {
    const profile = {
      ...emptyProfile,
      guardian: { ...emptyProfile.guardian, relation: "이모", name: "영희" },
    }
    const view = sampleAlertView(SAMPLE_ALERTS[0], profile)
    expect(view?.actions.some((action) => action.text.includes("이모"))).toBe(true)
    expect(view?.actions.some((action) => action.text.includes("엄마"))).toBe(false)
  })
})
