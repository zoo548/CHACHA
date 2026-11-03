import { describe, expect, it } from "vitest"
import { emptyProfile } from "./profile"
import { getAlertView, listDisasters } from "./alertTemplate"
import { SAMPLE_ALERTS } from "./sampleAlerts"

describe("getAlertView 색과 행동 단계는 따로", () => {
  it("예시 알림 세 가지는 발송 유형 색을 따른다", () => {
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

  it("위급 + 호우주의보 문장은 caution 이어도 색은 critical", () => {
    const view = getAlertView("heavy_rain", "caution", emptyProfile, {
      broadcast: "위급",
      rawText: "[기상청] 서울시 호우경보 발효",
    })
    expect(view?.uiLevel).toBe("critical")
    expect(view?.title).toBe("비가 많이 와요")
  })

  it("발송 유형이 없으면 evacuate 는 긴급, caution 은 안전안내", () => {
    expect(getAlertView("air_raid", "evacuate", emptyProfile)?.uiLevel).toBe("emergency")
    expect(getAlertView("heatwave", "caution", emptyProfile)?.uiLevel).toBe("safety")
  })

  it("안전안내 예시 알림은 폭염이다", () => {
    const safety = SAMPLE_ALERTS.find((s) => s.id === "safety")
    expect(safety?.disasterId).toBe("heatwave")
  })

  it("시연 목록에 실종경보는 없다", () => {
    expect(listDisasters().some((d) => d.id === "missing_person")).toBe(false)
  })
})
