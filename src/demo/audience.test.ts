import { describe, expect, it } from "vitest"
import { DEFAULT_DEMO_MESSAGE } from "../../shared/demoDefaults"
import { devicePrefCommands, soundCommand } from "../alerts/tier"
import { demoAudienceProfile, resolveDemoEntry } from "./audience"

describe("시연 참여 프로필", () => {
  it("김호두, 관악구, 그림과 글이다", () => {
    expect(demoAudienceProfile.name).toBe("김호두")
    expect(demoAudienceProfile.address).toBe("서울 관악구")
    expect(demoAudienceProfile.guardian.relation).toBe("엄마")
    expect(demoAudienceProfile.neighbor.relation).toBe("옆집 이모")
    expect(demoAudienceProfile.readingLevel).toBe(2)
  })

  it("시연 참여 사용자는 소리 보통 N 이다", () => {
    expect(demoAudienceProfile.soundSensitive).toBe(false)
    expect(soundCommand(demoAudienceProfile.soundSensitive)).toBe("N")
    expect(devicePrefCommands(demoAudienceProfile)).toEqual(["F", "N"])
  })

  it("시연 원문에 대피가 있다", () => {
    expect(DEFAULT_DEMO_MESSAGE).toContain("대피")
  })
})

describe("시연 기간 첫 화면", () => {
  it("기간 중 처음 온 사람은 시연 참여 화면이다", () => {
    expect(
      resolveDemoEntry({
        demoPeriod: true,
        demoQuery: false,
        joined: false,
        profileReady: false,
      }),
    ).toEqual({ screen: "demo-join", audience: false, clearSaved: false })
  })

  it("기간 중 온보딩을 마친 사람은 홈이다", () => {
    expect(
      resolveDemoEntry({
        demoPeriod: true,
        demoQuery: false,
        joined: false,
        profileReady: true,
      }),
    ).toEqual({ screen: "home", audience: false, clearSaved: false })
  })

  it("기간이 끝나면 참여 상태를 지운다", () => {
    expect(
      resolveDemoEntry({
        demoPeriod: false,
        demoQuery: false,
        joined: true,
        profileReady: true,
      }),
    ).toEqual({ screen: "home", audience: false, clearSaved: true })
  })

  it("기간이 꺼져 있으면 QR 없을 때 온보딩이다", () => {
    expect(
      resolveDemoEntry({
        demoPeriod: false,
        demoQuery: false,
        joined: false,
        profileReady: false,
      }),
    ).toEqual({ screen: "onboarding", audience: false, clearSaved: false })
  })

  it("QR 이면 기간과 관계없이 시연 참여 화면이다", () => {
    expect(
      resolveDemoEntry({
        demoPeriod: false,
        demoQuery: true,
        joined: false,
        profileReady: false,
      }),
    ).toEqual({ screen: "demo-join", audience: false, clearSaved: false })
  })
})
