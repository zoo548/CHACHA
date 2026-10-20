// 재난문자 원문 → 재난 id / 레벨 매칭.
//
// 입력:
//   - text: 재난문자 원문 (예: "[기상청] 호우경보 발효. 저지대 대피하세요")
//   - broadcastType: 발송유형 (위급/긴급/안전안내). 지금 레벨 계산에는 쓰지 않고
//     결과에 그대로 담아 UI/알림 쪽에서 참고하게 한다 (예: 위급은 iOS 긴급 알림 채널).
//
// 출력:
//   - 매칭 성공: { id, level: 'caution' | 'evacuate', matchedKeywords, broadcastType }
//   - 매칭 실패: null  → 호출 쪽에서 원문을 그대로 보여주고 주의(caution)로 처리.
//
// 매칭 규칙(docs/disaster_templates.json 를 그대로 사용, 생성형 AI 없음):
//   1) 각 재난의 keywords 중 하나라도 본문에 있으면 후보.
//   2) 승자 뽑기:
//        a. 가장 긴 '매칭된' 키워드를 가진 재난 우선.
//        b. 동점이면 evacuate(H) 변형이 있는 재난 우선.
//        c. 그래도 동점이면 JSON 등장 순서(앞선 것).
//   3) 레벨 올림(evacuate):
//        - 본문에 승자의 escalate_keywords 가 있거나 "대피" 가 있으면 올림.
//        - 승자에게 evacuate 변형이 없으면 그대로 caution.
//   4) 한 글자 키워드(예: '눈', '댐')는 앞뒤 글자(한글/영문/숫자/한자)가
//      아닐 때만 매칭. "눈병", "댐관리단"같은 포함어로 오탐되는 걸 막는다.
//
// JSON 문구/키워드는 코드에서 고치지 않는다 — 매칭이 틀리면 JSON 쪽 수정안으로 제안.

import templates from "../../docs/disaster_templates.json"

export type BroadcastType = "위급" | "긴급" | "안전안내"
export type MatchLevel = "caution" | "evacuate"

export type MatchResult = {
  id: string
  level: MatchLevel
  matchedKeywords: string[]
  broadcastType: BroadcastType
}

type JsonDisaster = {
  id: string
  matching: {
    keywords: string[]
    escalate_keywords?: string[]
  }
  variants: { level: string }[]
}

const disasters = templates.disasters as JsonDisaster[]

/** 한글/영문/숫자/한자 — 전부 "글자"로 본다. */
const LETTER = /[\p{L}\p{N}]/u

/** 한 글자 키워드가 본문에 "단독으로" 나오는지. 앞뒤가 글자가 아니어야 함. */
function singleCharMatches(text: string, ch: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ch) continue
    const before = i === 0 ? "" : text[i - 1]
    const after = i === text.length - 1 ? "" : text[i + 1]
    if (before && LETTER.test(before)) continue
    if (after && LETTER.test(after)) continue
    return true
  }
  return false
}

/** 키워드가 본문에 있는지. 한 글자면 경계 체크, 아니면 그냥 포함. */
function keywordMatches(text: string, keyword: string): boolean {
  if (keyword.length === 1) return singleCharMatches(text, keyword)
  return text.includes(keyword)
}

export function matchAlert(text: string, broadcastType: BroadcastType): MatchResult | null {
  if (!text) return null

  type Candidate = {
    id: string
    jsonIndex: number
    maxLen: number
    matched: string[]
    hasEvacuate: boolean
    escalated: boolean
  }
  const candidates: Candidate[] = []

  disasters.forEach((disaster, jsonIndex) => {
    const matched: string[] = []
    let maxLen = 0
    for (const kw of disaster.matching.keywords) {
      if (keywordMatches(text, kw)) {
        matched.push(kw)
        if (kw.length > maxLen) maxLen = kw.length
      }
    }
    if (matched.length === 0) return

    const hasEvacuate = disaster.variants.some((v) => v.level === "evacuate")

    // escalate: 그 재난의 escalate_keywords 중 하나라도 본문에 있거나, 본문에 "대피" 가 있으면.
    const escList = disaster.matching.escalate_keywords ?? []
    let escalated = text.includes("대피")
    if (!escalated) {
      for (const esc of escList) {
        if (text.includes(esc)) {
          escalated = true
          break
        }
      }
    }

    candidates.push({ id: disaster.id, jsonIndex, maxLen, matched, hasEvacuate, escalated })
  })

  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    if (b.maxLen !== a.maxLen) return b.maxLen - a.maxLen
    if (a.hasEvacuate !== b.hasEvacuate) return a.hasEvacuate ? -1 : 1
    return a.jsonIndex - b.jsonIndex
  })

  const winner = candidates[0]
  const level: MatchLevel = winner.escalated && winner.hasEvacuate ? "evacuate" : "caution"

  return {
    id: winner.id,
    level,
    matchedKeywords: winner.matched,
    broadcastType,
  }
}
