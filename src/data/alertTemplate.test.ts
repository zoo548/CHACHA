import { describe, expect, it } from "vitest"
import { emptyProfile } from "./profile"
import { getAlertView, listDisasters } from "./alertTemplate"
import { SAMPLE_ALERTS } from "./sampleAlerts"

describe("getAlertView 색은 차차 규칙", () => {
  it("예시 화면 세 가지는 차차 색을 따른다", () => {
    const expected = {
      critical: "critical",
      emergency: "emergency",
      safety: "safety",
    } as const
    for (const spec of SAMPLE_ALERTS) {
      const view = getAlertView(spec.disasterId, spec.variant, emptyProfile, {
        broadcast: spec.broadcast,
        sample: true,
      })
      expect(view?.uiLevel).toBe(expected[spec.id])
      expect(view?.sample).toBe(true)
    }
  })

  it("호우주의보 caution 은 주황이다", () => {
    const view = getAlertView("heavy_rain", "caution", emptyProfile, {
      broadcast: "위급",
      rawText: "[기상청] 서울시 호우경보 발효",
    })
    expect(view?.uiLevel).toBe("emergency")
    expect(view?.title).toBe("비가 많이 와요")
  })

  it("evacuate 는 빨강, 지정 caution 은 주황, 나머지 caution 은 파랑", () => {
    expect(getAlertView("air_raid", "evacuate", emptyProfile)?.uiLevel).toBe("critical")
    expect(getAlertView("heatwave", "caution", emptyProfile)?.uiLevel).toBe("emergency")
    expect(getAlertView("fine_dust", "caution", emptyProfile)?.uiLevel).toBe("safety")
  })

  it("예시 화면은 호우 대피·폭염·미세먼지이다", () => {
    expect(SAMPLE_ALERTS.map((spec) => spec.disasterId)).toEqual([
      "heavy_rain",
      "heatwave",
      "fine_dust",
    ])
  })

  it("시연 목록에 실종경보는 없다", () => {
    expect(listDisasters().some((d) => d.id === "missing_person")).toBe(false)
  })
})
