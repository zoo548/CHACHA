import { describe, expect, it } from "vitest"
import { matchAlert } from "../matching/matchAlert"
import { isExcludedDisaster } from "./excluded"

describe("제외 재난", () => {
  it("실종경보 문자가 오면 알림이 뜨지 않는다", () => {
    const matched = matchAlert("[경찰청] OO어르신 실종. 발견시 신고 바람", "안전안내")
    expect(matched?.id).toBe("missing_person")
    expect(isExcludedDisaster(matched?.id)).toBe(true)
  })

  it("폭염은 알린다", () => {
    const matched = matchAlert("[기상청] 폭염경보. 외출 자제", "안전안내")
    expect(matched?.id).toBe("heatwave")
    expect(isExcludedDisaster(matched?.id)).toBe(false)
  })
})
