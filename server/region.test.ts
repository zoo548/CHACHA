import assert from "node:assert/strict"
import { test } from "node:test"
import { regionMatches } from "./alerts-core.ts"

test("시·도 단위는 그 시·도의 구에 해당", () => {
  assert.equal(regionMatches("서울특별시", "서울특별시 관악구"), true)
  assert.equal(regionMatches("서울특별시 전체", "서울특별시 관악구"), true)
  assert.equal(regionMatches("서울특별시 전체", "경기도 용인시"), false)
})

test("다른 구는 해당 없음", () => {
  assert.equal(regionMatches("서울특별시 강남구 ", "서울특별시 관악구"), false)
  assert.equal(regionMatches("경기도 의왕시 ", "서울특별시 관악구"), false)
})

test("같은 구·더 좁은 동은 해당", () => {
  assert.equal(regionMatches("서울특별시 관악구 ", "서울특별시 관악구"), true)
  assert.equal(regionMatches("서울특별시 관악구 봉천동", "서울특별시 관악구"), true)
  assert.equal(regionMatches("서울특별시 관악구", "서울특별시 관악구 봉천동"), true)
})

test("쉼표로 이어진 여러 지역", () => {
  assert.equal(
    regionMatches("경상북도 포항시 남구 ,경상북도 포항시 북구 ", "경상북도 포항시 남구"),
    true,
  )
  assert.equal(
    regionMatches("서울특별시 관악구,서울특별시 동작구", "서울특별시 동작구"),
    true,
  )
  assert.equal(
    regionMatches("서울특별시 강남구, 서울특별시 서초구", "서울특별시 관악구"),
    false,
  )
})

test("실제 저장본 형식", () => {
  assert.equal(regionMatches("경기도 용인시 처인구 이동읍", "경기도 용인시 처인구"), true)
  assert.equal(regionMatches("경기도 의왕시 ", "경기도 의왕시"), true)
})
