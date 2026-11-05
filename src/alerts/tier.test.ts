import { describe, expect, it } from "vitest"
import templates from "../../docs/disaster_templates.json"
import { matchAlert } from "../matching/matchAlert"
import { isExcludedDisaster } from "./excluded"
import { deviceCommand, resolveAlertLevel, type TemplateVariant } from "./level"
import {
  devicePrefCommands,
  ORANGE_CAUTION_IDS,
  SIGNAL_DESCRIPTIONS,
  soundCommand,
} from "./tier"

type JsonDisaster = {
  id: string
  variants: { level: TemplateVariant }[]
}

const disasters = templates.disasters as JsonDisaster[]

function expectedLevel(id: string, variant: TemplateVariant) {
  return resolveAlertLevel({ disasterId: id, variant })
}

describe("차차 색 등급", () => {
  it("evacuate 는 빨강, 지정 caution 은 주황, 나머지 caution 은 파랑", () => {
    for (const disaster of disasters) {
      if (isExcludedDisaster(disaster.id)) continue
      for (const variant of disaster.variants) {
        const level = expectedLevel(disaster.id, variant.level)
        if (variant.level === "evacuate") expect(level).toBe("critical")
        else if (ORANGE_CAUTION_IDS.includes(disaster.id)) expect(level).toBe("emergency")
        else expect(level).toBe("safety")
      }
    }
  })

  it("30종 템플릿 각 변형의 색이 차차 규칙을 따른다", () => {
    expect(disasters).toHaveLength(30)
    const rows = disasters.flatMap((disaster) =>
      disaster.variants.map((variant) => ({
        id: disaster.id,
        variant: variant.level,
        level: expectedLevel(disaster.id, variant.level),
        excluded: isExcludedDisaster(disaster.id),
      })),
    )
    expect(rows.find((row) => row.id === "heavy_rain" && row.variant === "evacuate")?.level).toBe(
      "critical",
    )
    expect(rows.find((row) => row.id === "heavy_rain" && row.variant === "caution")?.level).toBe(
      "emergency",
    )
    expect(rows.find((row) => row.id === "heatwave")?.level).toBe("emergency")
    expect(rows.find((row) => row.id === "fine_dust")?.level).toBe("safety")
    expect(rows.find((row) => row.id === "air_raid")?.level).toBe("critical")
    expect(rows.find((row) => row.id === "cold_wave")?.level).toBe("safety")
    expect(rows.find((row) => row.id === "missing_person")?.excluded).toBe(true)
  })

  it("정부 발송 유형은 색을 바꾸지 않는다", () => {
    expect(resolveAlertLevel({ disasterId: "heatwave", variant: "caution" })).toBe("emergency")
    expect(resolveAlertLevel({ disasterId: "fine_dust", variant: "caution" })).toBe("safety")
    expect(resolveAlertLevel({ disasterId: "air_raid", variant: "evacuate" })).toBe("critical")
  })

  it("원문에 대피가 있으면 evacuate 를 골라 빨강이 된다", () => {
    const matched = matchAlert("[기상청] 집중호우경보. 저지대 주민은 대피하세요", "안전안내")
    expect(matched?.id).toBe("heavy_rain")
    expect(matched?.level).toBe("evacuate")
    expect(
      resolveAlertLevel({ disasterId: matched?.id, variant: matched?.level }),
    ).toBe("critical")
    expect(deviceCommand("critical", matched?.id)).toBe("R")
  })

  it("실종경보는 알림에서 뺀다", () => {
    const matched = matchAlert("[경찰청] OO어르신 실종. 발견시 신고 바람", "안전안내")
    expect(matched?.id).toBe("missing_person")
    expect(isExcludedDisaster(matched?.id)).toBe(true)
  })

  it("빨강 호우는 R, 그 외 빨강은 H, 주황은 L, 파랑은 I", () => {
    expect(deviceCommand("critical", "heavy_rain")).toBe("R")
    expect(deviceCommand("critical", "air_raid")).toBe("H")
    expect(deviceCommand("emergency", "heatwave")).toBe("L")
    expect(deviceCommand("safety", "fine_dust")).toBe("I")
  })

  it("소리에 예민하면 Q, 아니면 N 을 보낸다", () => {
    expect(soundCommand(true)).toBe("Q")
    expect(soundCommand(false)).toBe("N")
  })

  it("연결 직후 목소리와 소리를 같이 한 번 보낸다", () => {
    expect(devicePrefCommands({ chachaVoice: "F", soundSensitive: true })).toEqual(["F", "Q"])
    expect(devicePrefCommands({ chachaVoice: "M", soundSensitive: false })).toEqual(["M", "N"])
  })

  it("차차등 신호 설명이 앱 문구와 같다", () => {
    expect(SIGNAL_DESCRIPTIONS).toEqual({
      I: "파랑 점 1개, 띵 한 번",
      L: "주황 점 2개, 1초에 1번 깜빡, 차임·진동 30초",
      H: "빨강 점 3개, 빠르게 깜빡, 차임·음성·진동 반복",
      R: "H와 같음, 폭우 음성",
    })
    const signals = templates.device_signals as Record<string, string>
    expect(signals.I).toBe(SIGNAL_DESCRIPTIONS.I)
    expect(signals.L).toBe(SIGNAL_DESCRIPTIONS.L)
    expect(signals.H).toBe(SIGNAL_DESCRIPTIONS.H)
    expect(signals.R).toBe(SIGNAL_DESCRIPTIONS.R)
  })
})
