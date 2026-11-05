import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  findSigungu,
  formatRegionQuery,
  locationBanner,
  parseAddressRegion,
  useSigunguGeo,
  type SigunguCollection,
} from "./region"

const geo = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../public/geo/sigungu.json"), "utf8"),
) as SigunguCollection

useSigunguGeo(geo)

describe("좌표 → 시·군·구", () => {
  it("서울 관악구청은 관악구이다", () => {
    const hit = findSigungu(126.95154, 37.47835, geo)
    expect(hit).toEqual({ sido: "서울특별시", sigungu: "관악구" })
    expect(formatRegionQuery(hit!)).toBe("서울특별시 관악구")
    expect(locationBanner(hit)).toBe("지금 위치: 서울 관악구")
  })

  it("서울대는 관악구이다", () => {
    expect(findSigungu(126.952, 37.4601, geo)).toEqual({
      sido: "서울특별시",
      sigungu: "관악구",
    })
  })

  it("경기 성남시 분당구청은 분당구이다", () => {
    const hit = findSigungu(127.11891, 37.38264, geo)
    expect(hit).toEqual({ sido: "경기도", sigungu: "성남시 분당구" })
    expect(formatRegionQuery(hit!)).toBe("경기도 성남시 분당구")
    expect(locationBanner(hit)).toBe("지금 위치: 경기 성남시 분당구")
  })

  it("분당 정자동도 분당구이다", () => {
    expect(findSigungu(127.1146, 37.3595, geo)).toEqual({
      sido: "경기도",
      sigungu: "성남시 분당구",
    })
  })

  it("경계 근처 사당역은 서초구이다", () => {
    expect(findSigungu(126.9817, 37.4765, geo)).toEqual({
      sido: "서울특별시",
      sigungu: "서초구",
    })
  })

  it("경계 근처 모란역은 성남시 중원구이다", () => {
    expect(findSigungu(127.1294, 37.4322, geo)).toEqual({
      sido: "경기도",
      sigungu: "성남시 중원구",
    })
  })

  it("서울시청은 중구이다", () => {
    expect(findSigungu(126.9779, 37.5663, geo)).toEqual({
      sido: "서울특별시",
      sigungu: "중구",
    })
  })

  it("바다·원점은 경계 밖이다", () => {
    expect(findSigungu(126.0, 37.5, geo)).toBeNull()
    expect(findSigungu(0, 0, geo)).toBeNull()
  })
})

describe("카드 주소 → 시·군·구", () => {
  it("서울 관악구를 읽는다", () => {
    expect(parseAddressRegion("서울 관악구", geo)).toEqual({
      sido: "서울특별시",
      sigungu: "관악구",
    })
    expect(parseAddressRegion("서울특별시 관악구 신림동", geo)).toEqual({
      sido: "서울특별시",
      sigungu: "관악구",
    })
  })

  it("경기 성남시 분당구를 읽는다", () => {
    expect(parseAddressRegion("경기 성남시 분당구", geo)).toEqual({
      sido: "경기도",
      sigungu: "성남시 분당구",
    })
    expect(parseAddressRegion("성남시분당구", geo)).toEqual({
      sido: "경기도",
      sigungu: "성남시 분당구",
    })
  })
})
