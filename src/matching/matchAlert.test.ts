// matchAlert 의 종합 테스트 (헷갈리는 케이스 중심 35개 이상).
//
// 기대값은 "docs/disaster_templates.json 을 손 안 대고" 지금 매칭 규칙만으로
// 나오는 결과를 적어 두었다. 테스트가 깨지면 코드를 억지로 바꾸지 말고
// 파일 하단의 "JSON 수정 제안" 섹션을 보고 JSON 쪽을 손봐 달라.

import { describe, expect, it } from "vitest"
import { matchAlert, type MatchResult } from "./matchAlert"

/** 테스트 간결화 — id/level 만 확인. */
function expectMatch(result: MatchResult | null, id: string, level: "caution" | "evacuate") {
  expect(result).not.toBeNull()
  expect(result?.id).toBe(id)
  expect(result?.level).toBe(level)
}

describe("matchAlert — 호우", () => {
  it("1. 호우경보 / 안전안내 → 주의", () => {
    expectMatch(matchAlert("[기상청] 서울시 호우경보 발효", "안전안내"), "heavy_rain", "caution")
  })

  it("2. 집중호우 + '대피' / 긴급 → 대피", () => {
    expectMatch(
      matchAlert("[기상청] 집중호우경보. 저지대 주민은 대피하세요", "긴급"),
      "heavy_rain",
      "evacuate",
    )
  })

  it("3. 극한호우 + '범람'(escalate_kw) → 대피", () => {
    expectMatch(
      matchAlert("[기상청] 극한호우. 하천 범람 위험", "긴급"),
      "heavy_rain",
      "evacuate",
    )
  })

  it("4. 폭우/침수 + '긴급재난문자'(escalate_kw) → 대피", () => {
    expectMatch(
      matchAlert("[행안부] 서울 폭우로 침수 피해. 긴급재난문자 발송", "긴급"),
      "heavy_rain",
      "evacuate",
    )
  })

  it("43. 호우 중 하천 통제 — '통제'(traffic)와 '호우'(heavy_rain) 동점 → H변형 있는 heavy_rain 우선", () => {
    // 둘 다 maxLen=2 이고 heavy_rain 만 evacuate 변형이 있어서 heavy_rain 승.
    expectMatch(matchAlert("[재난과] 호우 중 하천 통제", "긴급"), "heavy_rain", "caution")
  })
})

describe("matchAlert — 태풍/강풍/풍랑", () => {
  it("5. 태풍 북상 / 긴급 → 주의 (escalate_kw 없음)", () => {
    expectMatch(matchAlert("[기상청] 태풍 OOO 북상 중", "긴급"), "typhoon", "caution")
  })

  it("6. 태풍 + '대피명령'(escalate_kw) → 대피", () => {
    expectMatch(
      matchAlert("[기상청] 태풍 상륙. 해안가 대피명령 발령", "긴급"),
      "typhoon",
      "evacuate",
    )
  })

  it("7. 풍랑주의보 → typhoon/caution (JSON 수정 제안 1 참고)", () => {
    // 지금 '풍랑'은 typhoon 과 strong_wind 둘 다에 있다 → 동점.
    // typhoon 이 H변형을 가져서 승. "풍랑"만 왔는데 태풍으로 분류되는 건
    // 실무상 어색 — JSON 수정 제안 1 참고.
    expectMatch(matchAlert("[기상청] 풍랑주의보 발효", "안전안내"), "typhoon", "caution")
  })

  it("8. 강풍주의보 → typhoon/caution (JSON 수정 제안 1 참고)", () => {
    // 7과 동일한 이유. '강풍'이 두 재난에 모두 들어 있어서 생기는 모호함.
    expectMatch(matchAlert("[기상청] 강풍주의보 발효", "안전안내"), "typhoon", "caution")
  })
})

describe("matchAlert — 폭염/한파/대설", () => {
  it("9. 폭염경보", () => {
    expectMatch(matchAlert("[기상청] 폭염경보. 외출 자제", "안전안내"), "heatwave", "caution")
  })

  it("10. 무더위/온열질환 — 긴 키워드 매칭", () => {
    expectMatch(
      matchAlert("[기상청] 무더위 지속. 온열질환 주의", "안전안내"),
      "heatwave",
      "caution",
    )
  })

  it("14. 한파/저체온", () => {
    expectMatch(
      matchAlert("[기상청] 한파주의보 발효. 저체온 유의", "안전안내"),
      "cold_wave",
      "caution",
    )
  })

  it("15. 대설 + 폭설 둘 다 매칭 → 대설(heavy_snow)", () => {
    expectMatch(
      matchAlert("[기상청] 대설경보 발효. 폭설 예상", "안전안내"),
      "heavy_snow",
      "caution",
    )
  })
})

describe("matchAlert — 한 글자 '눈' 경계 규칙", () => {
  it("16. '오늘 눈 많이 와요' — 눈 앞뒤가 공백 → 매칭", () => {
    expectMatch(matchAlert("오늘 눈 많이 와요", "안전안내"), "heavy_snow", "caution")
  })

  it("17. '눈병' — 눈 뒤에 글자 → 매칭 안 됨 → null", () => {
    expect(matchAlert("눈병에 걸리지 않게 조심하세요", "안전안내")).toBeNull()
  })

  it("18. '오늘 눈이 와요' — 눈 뒤에 '이'(글자) → 매칭 안 됨 → null", () => {
    // 한국어에서 '눈이' 는 자연스럽지만, 조사 '이' 도 글자라서 엄격 규칙으로 걸러낸다.
    // 실제 기상청 문자는 '대설'/'폭설'이 거의 같이 있으니 큰 문제는 아니다.
    expect(matchAlert("오늘 눈이 와요", "안전안내")).toBeNull()
  })

  it("19. '폭설과 함께 눈이 쌓입니다' — '폭설' 로 매칭", () => {
    expectMatch(matchAlert("폭설과 함께 눈이 쌓입니다", "안전안내"), "heavy_snow", "caution")
  })
})

describe("matchAlert — 지진/지진해일", () => {
  it("20. 지진 규모만 → 주의 (escalate_kw 본문에 없음)", () => {
    expectMatch(matchAlert("[기상청] 지진 규모 5.0 발생", "긴급"), "earthquake", "caution")
  })

  it("21. '강한 흔들림'(earthquake escalate_kw) → 대피", () => {
    expectMatch(
      matchAlert("[기상청] 강한 흔들림 감지. 지진 발생", "위급"),
      "earthquake",
      "evacuate",
    )
  })

  it("22. 지진해일 — 가장 긴 키워드로 tsunami 승", () => {
    // earthquake 의 '지진'(2) vs tsunami 의 '지진해일'(4) → tsunami 승.
    // tsunami 는 evacuate 변형만 있고 '지진해일'은 esc_kw 라서 evacuate.
    expectMatch(matchAlert("[기상청] 지진해일 특보 발효", "긴급"), "tsunami", "evacuate")
  })
})

describe("matchAlert — 산불/화재/산사태", () => {
  it("11. 산불 + 입산 — wildfire 승 (traffic 통제와 동점이면 H가진 wildfire 승)", () => {
    expectMatch(
      matchAlert("[산림청] 산불 발생. 입산통제", "안전안내"),
      "wildfire",
      "caution",
    )
  })

  it("12. 산불 + 주민 대피 → 대피", () => {
    expectMatch(
      matchAlert("[산림청] 산불 확산. 마을 주민 대피 시작", "긴급"),
      "wildfire",
      "evacuate",
    )
  })

  it("13. 화재 + 대피 — fire 는 evacuate 변형 없음 → 주의로 유지", () => {
    expectMatch(
      matchAlert("[소방청] OO빌딩 화재. 유독가스 발생. 대피 시작", "긴급"),
      "fire",
      "caution",
    )
  })

  it("23. 산사태 경보(escalate_kw) + 대피 → 대피", () => {
    expectMatch(
      matchAlert("[기상청] 산사태 경보 발령. 대피하세요", "긴급"),
      "landslide",
      "evacuate",
    )
  })
})

describe("matchAlert — 황사/미세먼지/낙뢰/댐/결빙/파도", () => {
  it("24. 황사경보", () => {
    expectMatch(matchAlert("[기상청] 황사경보. 외출 자제", "안전안내"), "yellow_dust", "caution")
  })

  it("25. 미세먼지 비상저감조치 — 긴 kw 매칭", () => {
    expectMatch(
      matchAlert("[환경부] 미세먼지 비상저감조치 시행", "안전안내"),
      "fine_dust",
      "caution",
    )
  })

  it("26. 낙뢰 주의", () => {
    expectMatch(
      matchAlert("[기상청] 낙뢰 주의. 야외활동 자제", "안전안내"),
      "lightning",
      "caution",
    )
  })

  it("27. 댐 방류 + 하천 수위 상승", () => {
    // 'OOO댐'의 '댐'은 앞이 글자(O)라 single-char 규칙에서 걸림.
    // '댐 방류'의 '댐'은 앞이 글자('OOO'의 O 아님) — 사실 "OOO댐 방류" 에선
    // 댐 바로 뒤가 공백이지만 앞은 O(글자) → single-char 매칭 안됨.
    // 다행히 '방류'(2) '하천 수위'(5) '수위 상승'(5) 로도 매칭된다.
    expectMatch(
      matchAlert("[댐관리단] OOO댐 방류 예정. 하천 수위 상승", "긴급"),
      "dam_release",
      "caution",
    )
  })

  it("28. 도로 결빙/블랙아이스", () => {
    expectMatch(
      matchAlert("[기상청] 도로 결빙 예상. 블랙아이스 주의", "안전안내"),
      "road_ice",
      "caution",
    )
  })

  it("29. 너울/높은 파도/갯바위", () => {
    expectMatch(
      matchAlert("[해경] 너울과 높은 파도. 갯바위 접근 금지", "안전안내"),
      "high_wave",
      "caution",
    )
  })
})

describe("matchAlert — 화학/가스/정전/단수/감염병", () => {
  it("30. 유해물질 누출 + 실내 대피 → 대피", () => {
    expectMatch(
      matchAlert("[환경부] OO공장 유해물질 누출. 실내 대피하세요", "긴급"),
      "chemical",
      "evacuate",
    )
  })

  it("31. 도시가스 누출 — gas_leak 이 chemical 보다 긴 키워드로 승", () => {
    // '도시가스'(4) > chemical 의 '누출'(2) 이라 gas_leak 승. evacuate 없음 → 주의.
    expectMatch(
      matchAlert("[가스안전공사] 도시가스 누출 신고", "긴급"),
      "gas_leak",
      "caution",
    )
  })

  it("32. 정전", () => {
    expectMatch(matchAlert("[한전] OO지역 정전. 복구 중", "안전안내"), "blackout", "caution")
  })

  it("33. 수돗물 단수", () => {
    expectMatch(
      matchAlert("[상수도] 수돗물 단수 안내", "안전안내"),
      "water_outage",
      "caution",
    )
  })

  it("34. 독감 유행 — 감염병", () => {
    expectMatch(
      matchAlert("[질병청] 독감 유행. 손 씻기 생활화", "안전안내"),
      "epidemic",
      "caution",
    )
  })
})

describe("matchAlert — 공습경보/경계경보/방사능/붕괴/인파/실종/가뭄", () => {
  it("35. 공습경보 + 대피 → 대피", () => {
    expectMatch(
      matchAlert("[민방위] 공습경보 발령. 지하 대피소로 이동", "위급"),
      "air_raid",
      "evacuate",
    )
  })

  it("36. 경계경보만 — evacuate 변형 없음 → 주의", () => {
    expectMatch(matchAlert("[민방위] 경계경보 발령", "긴급"), "alert_warning", "caution")
  })

  it("37. 원전/방사능 + 주민 대피 → 대피", () => {
    expectMatch(
      matchAlert("[원안위] OO원전 사고. 방사능 누출. 주민 대피", "위급"),
      "radiation",
      "evacuate",
    )
  })

  it("38. 싱크홀 — collapse", () => {
    expectMatch(
      matchAlert("[강남구] OO로 싱크홀 발생. 통행 금지", "긴급"),
      "collapse",
      "caution",
    )
  })

  it("39. 인파 밀집 혼잡 — crowd", () => {
    expectMatch(
      matchAlert("[서울시] 이태원 인파 밀집 혼잡", "안전안내"),
      "crowd",
      "caution",
    )
  })

  it("40. 교통사고 우회 — traffic", () => {
    expectMatch(
      matchAlert("[경찰청] OO로 교통사고 우회 안내", "안전안내"),
      "traffic",
      "caution",
    )
  })

  it("41. 실종 — missing_person", () => {
    expectMatch(
      matchAlert("[경찰청] OO어르신 실종. 발견시 신고 바람", "안전안내"),
      "missing_person",
      "caution",
    )
  })

  it("44. 가뭄 + 제한급수", () => {
    expectMatch(
      matchAlert("[기상청] 가뭄 지속. 제한급수 시행", "안전안내"),
      "drought",
      "caution",
    )
  })
})

describe("matchAlert — 매칭 실패/엣지", () => {
  it("42. 재난과 무관한 문장 → null", () => {
    expect(matchAlert("오늘 저녁 뭐 먹을까요?", "안전안내")).toBeNull()
  })

  it("45. 빈 문자열 → null", () => {
    expect(matchAlert("", "안전안내")).toBeNull()
  })

  it("46. 'OO통제소' — '통제'(traffic) 부분일치가 발동 (JSON 수정 제안 2 참고)", () => {
    // 다자 키워드엔 경계 체크가 없으니 '통제소'의 '통제'도 매칭된다.
    // 실무상 통제소=traffic 은 틀렸지만, 기본 규칙상 이렇게 나온다.
    expectMatch(matchAlert("OO통제소 안내 전화", "안전안내"), "traffic", "caution")
  })

  it("47. broadcastType 은 출력에 그대로 담김 (레벨 계산엔 쓰지 않음)", () => {
    // '위급재난문자' 발송유형이지만 본문에 escalate_kw/대피 없으면 주의 유지.
    const r = matchAlert("[기상청] 호우경보", "위급")
    expect(r?.id).toBe("heavy_rain")
    expect(r?.level).toBe("caution")
    expect(r?.broadcastType).toBe("위급")
  })

  it("48. 매칭 성공 시 matchedKeywords 에 매칭된 키워드 전부 담김", () => {
    // '집중호우' 는 '호우'도 함께 포함 → 둘 다 matched 에 들어감.
    const r = matchAlert("집중호우 집중호우 집중호우", "긴급")
    expect(r?.id).toBe("heavy_rain")
    expect(r?.matchedKeywords).toEqual(expect.arrayContaining(["호우", "집중호우"]))
  })
})

// ---------------------------------------------------------------------------
// JSON 수정 제안 (코드는 그대로 두고 docs/disaster_templates.json 손보기 권장)
// ---------------------------------------------------------------------------
// 1) typhoon 과 strong_wind 사이 중복 키워드
//    typhoon.matching.keywords 에서 ["강풍", "풍랑"] 를 빼고
//    typhoon 은 ["태풍"] 만 두는 게 자연스럽다.
//    근거: 테스트 7, 8 — 강풍/풍랑만 들어온 메시지가 '태풍'으로 잡힘.
//
// 2) traffic 의 '통제' 가 너무 짧고 흔한 글자
//    "통제" 를 "교통 통제" 또는 "통행 통제" 같이 2음절 이상 조합으로 바꾸면
//    '통제소/통제탑' 같은 포함어 오탐을 줄일 수 있다.
//    근거: 테스트 46.
//
// 3) dam_release 의 '댐' 한 글자 매칭이 잘 안 걸림
//    보도상 'OOO댐' 처럼 숫자/영문·한글 바로 뒤에 붙는 경우가 많아
//    single-char 경계 규칙에 걸려 매칭 실패.
//    "댐 방류", "댐 수위" 같이 2단어 키워드로 바꾸면 안정적.
//
// 이것들은 전부 "코드로 대충 맞추지 말고" JSON 에서 손보는 게 깔끔하다.
