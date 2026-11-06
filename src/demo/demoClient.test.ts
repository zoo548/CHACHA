import { describe, expect, it } from "vitest"
import { shouldPresentDemoMessage } from "./demoClient"

describe("시연 문자 알림 조건", () => {
  const joinedAt = "2026-11-06T02:00:00.000Z"

  it("참여한 뒤에 보낸 새 문자만 띄운다", () => {
    expect(
      shouldPresentDemoMessage(
        { id: "demo-2", sentAt: "2026-11-06T02:00:03.000Z" },
        { seenId: "demo-1", joinedAt },
      ),
    ).toBe(true)
  })

  it("참여할 때 이미 있던 문자는 띄우지 않는다", () => {
    expect(
      shouldPresentDemoMessage(
        { id: "demo-1", sentAt: "2026-11-06T01:59:50.000Z" },
        { seenId: "demo-1", joinedAt },
      ),
    ).toBe(false)
  })

  it("참여 시각과 같거나 그 전에 보낸 문자는 띄우지 않는다", () => {
    expect(
      shouldPresentDemoMessage(
        { id: "demo-1", sentAt: joinedAt },
        { seenId: null, joinedAt },
      ),
    ).toBe(false)
    expect(
      shouldPresentDemoMessage(
        { id: "demo-1", sentAt: "2026-11-06T01:59:59.000Z" },
        { seenId: null, joinedAt },
      ),
    ).toBe(false)
  })

  it("보낸 시각이나 참여 시각이 없으면 띄우지 않는다", () => {
    expect(
      shouldPresentDemoMessage({ id: "demo-1", sentAt: "2026-11-06T02:00:03.000Z" }, {
        seenId: null,
        joinedAt: null,
      }),
    ).toBe(false)
    expect(
      shouldPresentDemoMessage({ id: "demo-1" }, { seenId: null, joinedAt }),
    ).toBe(false)
  })
})
