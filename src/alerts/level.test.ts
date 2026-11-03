import { describe, expect, it } from "vitest"
import { matchAlert } from "../matching/matchAlert"
import { SAMPLE_ALERTS } from "../data/sampleAlerts"
import {
  badgeLabel,
  broadcastFromLevel,
  deviceCommand,
  gradeDots,
  gradeEasyName,
  gradeOfficialName,
  parseBroadcast,
  resolveAlertLevel,
} from "./level"

describe("parseBroadcast", () => {
  it("위급재난·긴급재난·안전안내를 발송 유형으로 읽는다", () => {
    expect(parseBroadcast("위급재난")).toBe("위급")
    expect(parseBroadcast("긴급재난")).toBe("긴급")
    expect(parseBroadcast("안전안내")).toBe("안전안내")
  })

  it("모르는 값은 비운다", () => {
    expect(parseBroadcast("")).toBeUndefined()
    expect(parseBroadcast("기타")).toBeUndefined()
  })
})

describe("broadcastFromLevel", () => {
  it("모르면 안전안내로 둔다", () => {
    expect(broadcastFromLevel("알 수 없음")).toBe("안전안내")
  })
})

describe("resolveAlertLevel — 발송 유형", () => {
  it("위급은 빨강(critical), 긴급은 주황(emergency), 안전안내는 파랑(safety)", () => {
    expect(resolveAlertLevel({ broadcast: "위급재난" })).toBe("critical")
    expect(resolveAlertLevel({ broadcast: "긴급재난" })).toBe("emergency")
    expect(resolveAlertLevel({ broadcast: "안전안내" })).toBe("safety")
  })

  it("안전안내인데 원문에 대피가 있으면 긴급으로 올린다", () => {
    expect(
      resolveAlertLevel({ broadcast: "안전안내", variant: "caution", rawText: "저지대 대피하세요" }),
    ).toBe("emergency")
  })

  it("위급은 대피가 없어도 낮추지 않는다", () => {
    expect(resolveAlertLevel({ broadcast: "위급", variant: "caution", rawText: "외출 자제" })).toBe(
      "critical",
    )
  })
})

describe("resolveAlertLevel — 발송 유형을 모를 때", () => {
  it("템플릿 evacuate 는 긴급, caution 은 안전안내", () => {
    expect(resolveAlertLevel({ variant: "evacuate" })).toBe("emergency")
    expect(resolveAlertLevel({ variant: "caution" })).toBe("safety")
  })
})

describe("기기 신호·띠 글자", () => {
  it("위급 H, 긴급 L, 안전안내 I, 위급 호우 R", () => {
    expect(deviceCommand("critical")).toBe("H")
    expect(deviceCommand("emergency")).toBe("L")
    expect(deviceCommand("safety")).toBe("I")
    expect(deviceCommand("critical", "heavy_rain")).toBe("R")
    expect(deviceCommand("critical", "air_raid")).toBe("H")
  })

  it("점은 안전안내 1개, 긴급 2개, 위급 3개", () => {
    expect(gradeDots("safety")).toBe("●")
    expect(gradeDots("emergency")).toBe("●●")
    expect(gradeDots("critical")).toBe("●●●")
  })

  it("쉬운 이름과 정부 이름을 같이 쓴다", () => {
    expect(gradeEasyName("safety")).toBe("알아두세요")
    expect(gradeEasyName("emergency")).toBe("조심해요")
    expect(gradeEasyName("critical")).toBe("지금 해야 해요")
    expect(gradeOfficialName("safety")).toBe("안전안내문자")
    expect(gradeOfficialName("emergency")).toBe("긴급재난문자")
    expect(gradeOfficialName("critical")).toBe("위급재난문자")
    expect(badgeLabel("critical")).toBe("●●● 지금 해야 해요")
  })
})

describe("예시 화면 기기 명령", () => {
  it("공습경보·호우 대피·폭염은 H, L, I 를 보낸다", () => {
    const commands = SAMPLE_ALERTS.map((spec) =>
      deviceCommand(
        resolveAlertLevel({ broadcast: spec.broadcast, variant: spec.variant }),
        spec.disasterId,
      ),
    )
    expect(commands).toEqual(["H", "L", "I"])
  })

  it("위급 호우는 R 을 보낸다", () => {
    expect(
      deviceCommand(
        resolveAlertLevel({ broadcast: "위급", variant: "evacuate" }),
        "heavy_rain",
      ),
    ).toBe("R")
  })
})

describe("matchAlert 행동 단계와 색 등급은 따로 간다", () => {
  it("안전안내 + 대피 → 문장은 evacuate, 색은 emergency", () => {
    const text = "[기상청] 집중호우경보. 저지대 주민은 대피하세요"
    const matched = matchAlert(text, "안전안내")
    expect(matched?.id).toBe("heavy_rain")
    expect(matched?.level).toBe("evacuate")
    expect(
      resolveAlertLevel({
        broadcast: matched?.broadcastType,
        variant: matched?.level,
        rawText: text,
      }),
    ).toBe("emergency")
  })

  it("위급 + 호우주의보 → 문장은 caution, 색은 critical", () => {
    const text = "[기상청] 서울시 호우경보 발효"
    const matched = matchAlert(text, "위급")
    expect(matched?.level).toBe("caution")
    expect(
      resolveAlertLevel({
        broadcast: matched?.broadcastType,
        variant: matched?.level,
        rawText: text,
      }),
    ).toBe("critical")
  })
})
