// 재난 종류별 알림 데이터.
// - 표시 레벨(위험/주의/연습), 제목, 상황 설명, 큰 아이콘, 행동 리스트.
// - 생성형 AI 로 만들지 않는다. 템플릿은 docs/disaster_templates.json 과
//   docs/쉬운정보_변환_가이드.md 를 보고 손으로 다듬어야 한다.
// - 문장 안의 " / " 는 Lines 컴포넌트가 줄바꿈 지점으로 쓴다.

import type { Disaster, IconName } from "../types"

export type AlertAction = {
  text: string
  icon?: IconName
  phone?: boolean
  disabled?: boolean
}

export type AlertData = {
  level: "danger" | "caution" | "practice"
  title: string
  situation: string
  hero: IconName
  actions: AlertAction[]
}

export const alertData: Record<Disaster, AlertData> = {
  rain: {
    level: "danger",
    title: "비가 아주 많이 와요",
    situation: "물이 빨리 차올라서 위험해요.",
    hero: "cloud",
    actions: [
      { text: "지하에 있으면 / 바로 밖으로 나와요.", icon: "stairs" },
      { text: "지금 바로 김영희에게 / 전화해요.", phone: true },
      { text: "전화를 안 받으면 / 박민수에게 전화해요.", phone: true },
      { text: "아무도 안 받으면 / 119에 전화해요.", phone: true },
      { text: "물이 흐르는 길을 / 건너지 마세요." },
    ],
  },
  earthquake: {
    level: "danger",
    title: "땅이 크게 흔들려요",
    situation: "물건이 떨어질 수 있어서 위험해요.",
    hero: "building",
    actions: [
      { text: "책상 밑으로 들어가 / 머리를 가려요.", icon: "desk" },
      { text: "흔들림이 멈추면 / 김영희에게 전화해요.", phone: true },
      { text: "전화를 안 받으면 / 박민수에게 전화해요.", phone: true },
      { text: "아무도 안 받으면 / 119에 전화해요.", phone: true },
      { text: "엘리베이터 말고 / 계단으로 나가요." },
      { text: "밖에서는 건물에서 / 멀리 떨어져요." },
    ],
  },
  heat: {
    level: "caution",
    title: "오늘은 아주 더워요",
    situation: "더우면 몸이 아플 수 있어요.",
    hero: "sun",
    actions: [
      { text: "물을 자주 마셔요.", icon: "water" },
      { text: "시원한 곳에 있어요.", icon: "shade" },
      { text: "낮에는 밖에 / 오래 있지 마세요." },
      { text: "몸이 아프면 / 김영희나 119에 전화해요.", phone: true },
    ],
  },
  practice: {
    level: "practice",
    title: "연습 알림이에요",
    situation: "진짜 재난이 아니에요.",
    hero: "bell",
    actions: [
      { text: "이 화면을 끝까지 읽어요." },
      { text: "김영희에게 전화해요.", phone: true, disabled: true },
      { text: "아래 \"알았어요\"를 눌러요." },
    ],
  },
}
