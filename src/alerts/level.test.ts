import { describe, expect, it } from "vitest"
import { matchAlert } from "../matching/matchAlert"
import {
  badgeLabel,
  broadcastFromLevel,
  deviceCommand,
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
  it("위급은 빨강(critical), 긴급은 노랑(emergency), 안전안내는 파랑(safety)", () => {
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
  it("위급 H, 긴급 L, 안전안내 B", () => {
    expect(deviceCommand("critical")).toBe("H")
    expect(deviceCommand("emergency")).toBe("L")
    expect(deviceCommand("safety")).toBe("B")
  })

  it("알림 띠는 위급·긴급·안전안내", () => {
    expect(badgeLabel("critical")).toBe("▲ 위급")
    expect(badgeLabel("emergency")).toBe("● 긴급")
    expect(badgeLabel("safety")).toBe("ⓘ 안전안내")
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
