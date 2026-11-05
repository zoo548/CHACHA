import { describe, expect, it } from "vitest"
import { DEFAULT_DEMO_MESSAGE } from "../../shared/demoDefaults"
import { demoAudienceProfile } from "./audience"

describe("시연 참여 프로필", () => {
  it("김호두, 관악구, 그림과 글이다", () => {
    expect(demoAudienceProfile.name).toBe("김호두")
    expect(demoAudienceProfile.address).toBe("서울 관악구")
    expect(demoAudienceProfile.guardian.relation).toBe("엄마")
    expect(demoAudienceProfile.neighbor.relation).toBe("옆집 이모")
    expect(demoAudienceProfile.readingLevel).toBe(2)
  })

  it("시연 원문에 대피가 있다", () => {
    expect(DEFAULT_DEMO_MESSAGE).toContain("대피")
  })
})
