import { describe, expect, it } from "vitest"
import {
  badgeLabel,
  broadcastFromLevel,
  broadcastOfficialName,
  gradeDots,
  gradeEasyName,
  parseBroadcast,
  senderAgency,
  sourceCaption,
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

describe("화면 띠·원문 글씨", () => {
  it("점은 알아두세요 1개, 조심해요 2개, 지금 해야 해요 3개", () => {
    expect(gradeDots("safety")).toBe("●")
    expect(gradeDots("emergency")).toBe("●●")
    expect(gradeDots("critical")).toBe("●●●")
  })

  it("쉬운 이름은 차차 등급을 따른다", () => {
    expect(gradeEasyName("safety")).toBe("알아두세요")
    expect(gradeEasyName("emergency")).toBe("조심해요")
    expect(gradeEasyName("critical")).toBe("지금 해야 해요")
    expect(badgeLabel("critical")).toBe("●●● 지금 해야 해요")
  })

  it("정부 문자 이름과 발송 기관은 원문에서 읽는다", () => {
    expect(broadcastOfficialName("위급")).toBe("위급재난문자")
    expect(broadcastOfficialName("긴급재난")).toBe("긴급재난문자")
    expect(broadcastOfficialName("안전안내")).toBe("안전안내문자")
    expect(senderAgency("[기상청] 호우경보")).toBe("기상청")
    expect(senderAgency("기관 표시 없음")).toBe("행정안전부")
    expect(sourceCaption("안전안내", "[기상청] 미세먼지")).toBe(
      "안전안내문자 · 기상청 · 원문 보기 ⌄",
    )
  })
})
