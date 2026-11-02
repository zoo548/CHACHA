// 우리 집 안전 점검 — 지금 화면에 나오는 필수 5개.
// 예전 항목은 safetyQuestions.extra.ts 에 두었다.

export { safetyQuestionsExtra } from "./safetyQuestions.extra"
// 답: 0=네(안전한 쪽), 1=아니요, 2=몰라요. 1·2 는 할 일로 모은다.

import {
  Backpack,
  BellRing,
  DoorOpen,
  FireExtinguisher,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type SafetyAnswer = 0 | 1 | 2

export type SafetyQuestionId =
  | "fire_extinguisher"
  | "smoke_alarm"
  | "gas_valve"
  | "clear_exit"
  | "emergency_kit"

export const SAFETY_QUESTION_IDS: SafetyQuestionId[] = [
  "fire_extinguisher",
  "smoke_alarm",
  "gas_valve",
  "clear_exit",
  "emergency_kit",
]

export function isSafetyQuestionId(id: string): id is SafetyQuestionId {
  return (SAFETY_QUESTION_IDS as string[]).includes(id)
}

export type SafetyQuestion = {
  id: SafetyQuestionId
  category: string
  icon: LucideIcon
  question: string
  todo: string
  capturePhoto?: boolean
}

export const safetyQuestions: SafetyQuestion[] = [
  {
    id: "fire_extinguisher",
    category: "불이 났을 때",
    icon: FireExtinguisher,
    question: "집에 소화기가 있어요?",
    todo: "보호자와 같이 소화기를 사요.",
    capturePhoto: true,
  },
  {
    id: "smoke_alarm",
    category: "불이 났을 때",
    icon: BellRing,
    question: "천장에 화재경보기가 있어요?",
    todo: "보호자에게 달아 달라고 해요.",
  },
  {
    id: "gas_valve",
    category: "불이 났을 때",
    icon: Wrench,
    question: "가스 밸브가 어디 있는지 알아요?",
    todo: "보호자와 같이 찾아봐요.",
    capturePhoto: true,
  },
  {
    id: "clear_exit",
    category: "불이 났을 때",
    icon: DoorOpen,
    question: "현관 가는 길에 물건이 없어요?",
    todo: "길에 있는 물건을 치워요.",
    capturePhoto: true,
  },
  {
    id: "emergency_kit",
    category: "도움을 받을 때",
    icon: Backpack,
    question: "손전등과 약을 한곳에 챙겨 뒀어요?",
    todo: "가방 하나에 같이 넣어 둬요.",
  },
]

export function checkGuidePhotoSrc(id: SafetyQuestionId): string {
  return `${import.meta.env.BASE_URL}photos/check/${id}.jpg`
}

export function todosFromAnswers(answers: Record<string, SafetyAnswer>): string[] {
  return safetyQuestions
    .filter((question) => (answers[question.id] ?? 0) > 0)
    .map((question) => question.todo)
}
