// 우리 집 안전 점검 질문 목록. 반지하 전용 질문은 lowerFloors: true 로 표시한다.
// 답: 0=긍정, 1=부정(준비할 것), 2=잘 모르겠어요.

import {
  ArrowUpFromLine,
  Backpack,
  BellRing,
  Building2,
  DoorClosed,
  DoorOpen,
  Droplets,
  Fan,
  FileText,
  FireExtinguisher,
  Flashlight,
  GlassWater,
  MapPin,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type SafetyAnswer = 0 | 1 | 2

export type SafetyQuestion = {
  id: number
  category: string
  icon: LucideIcon
  question: string
  description: string
  answers: [string, string]
  tip: string
  lowerFloors?: boolean
}

export const safetyQuestions: SafetyQuestion[] = [
  { id: 1, category: "불이 났을 때", icon: FireExtinguisher, question: "소화기가 있나요?", description: "불이 났을 때 사용할 수 있어요.", answers: ["있어요", "없어요"], tip: "보호자와 함께 소화기를 준비해요." },
  { id: 2, category: "불이 났을 때", icon: MapPin, question: "소화기가 어디 있는지 아나요?", description: "급할 때 바로 찾아야 해요.", answers: ["알아요", "몰라요"], tip: "현관 가까이에 두면 찾기 쉬워요." },
  { id: 3, category: "불이 났을 때", icon: BellRing, question: "집에 화재경보기가 있나요?", description: "연기가 나면 소리로 알려줘요.", answers: ["있어요", "없어요"], tip: "주민센터에 물어봐요." },
  { id: 4, category: "불이 났을 때", icon: DoorOpen, question: "현관까지 가는 길이 비어 있나요?", description: "빨리 나가려면 길이 비어 있어야 해요.", answers: ["비어 있어요", "짐이 있어요"], tip: "현관 앞 짐을 치워요." },
  { id: 5, category: "불이 났을 때", icon: Wrench, question: "가스 밸브가 어디 있는지 아나요?", description: "불이 나면 밸브를 잠가요.", answers: ["알아요", "몰라요"], tip: "보호자와 함께 가스 밸브를 찾아봐요." },
  { id: 6, category: "비가 많이 올 때", icon: Droplets, question: "창문 앞 물 빠지는 곳이 깨끗한가요?", description: "낙엽이 막으면 물이 안 빠져요.", answers: ["깨끗해요", "막혀 있어요"], tip: "낙엽과 쓰레기를 치워요.", lowerFloors: true },
  { id: 7, category: "비가 많이 올 때", icon: Shield, question: "물막이판이 있나요?", description: "물이 집에 들어오는 것을 막아줘요.", answers: ["있어요", "없어요"], tip: "구청에 물어봐요.", lowerFloors: true },
  { id: 8, category: "비가 많이 올 때", icon: DoorClosed, question: "물이 차면 문이 잘 열리나요?", description: "물이 많아지면 문이 안 열릴 수 있어요.", answers: ["열려요", "안 열려요"], tip: "보호자와 함께 확인해요.", lowerFloors: true },
  { id: 9, category: "비가 많이 올 때", icon: ArrowUpFromLine, question: "비가 많이 올 때 갈 높은 곳을 아나요?", description: "미리 정해 두면 좋아요.", answers: ["알아요", "몰라요"], tip: "보호자와 함께 갈 곳을 정해요." },
  { id: 10, category: "비가 많이 올 때", icon: FileText, question: "약이나 서류가 어디 있나요?", description: "물에 젖으면 못 써요.", answers: ["높은 곳에 있어요", "바닥에 있어요"], tip: "약과 서류를 높은 곳에 올려 둬요." },
  { id: 11, category: "아주 덥거나 추울 때", icon: Fan, question: "선풍기나 에어컨이 잘 되나요?", description: "미리 켜서 확인해요.", answers: ["잘 돼요", "안 돼요"], tip: "보호자에게 고쳐 달라고 해요." },
  { id: 12, category: "아주 덥거나 추울 때", icon: Building2, question: "더울 때 갈 시원한 곳을 아나요?", description: "무더위쉼터라고 해요.", answers: ["알아요", "몰라요"], tip: "주민센터에 물어봐요." },
  { id: 13, category: "아주 덥거나 추울 때", icon: GlassWater, question: "마실 물이 집에 있나요?", description: "더울 때 물을 자주 마셔요.", answers: ["있어요", "없어요"], tip: "물을 사 둬요." },
  { id: 14, category: "도움을 받을 때", icon: Flashlight, question: "손전등이 있나요?", description: "불이 꺼지면 사용해요.", answers: ["있어요", "없어요"], tip: "손전등과 건전지를 사 둬요." },
  { id: 16, category: "도움을 받을 때", icon: Backpack, question: "챙길 가방을 만들었나요?", description: "물, 약, 손전등을 넣어 두어요.", answers: ["있어요", "없어요"], tip: "보호자와 함께 가방을 싸요." },
]
