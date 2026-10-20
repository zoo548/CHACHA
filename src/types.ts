// 앱 전체에서 공유하는 타입
// - 이 파일은 데이터/UI 를 가리지 않는 "뼈대" 타입만 모은다.
// - UI 전용 props 는 각 컴포넌트 파일 안에 둔다.

/** 하단 탭. 홈 / 대비 / 도움 / 내 카드. */
export type ActiveTab = "home" | "prep" | "help" | "card"

/** 지금 보여지는 큰 화면 단위. */
export type AppScreen =
  | "onboarding"
  | "home"
  | "help"
  | "call-choice"
  | "prep"
  | "card"
  | "pdf"
  | "lock"
  | "alert"
  | "safety"

/** 올라오는 바텀시트 종류. null 이면 안 올라옴. */
export type SheetKind = "phone-permission" | "location" | "call" | "source" | null

/** 자체 SVG 아이콘 세트의 이름 모음. 새 아이콘 추가하려면 Icon.tsx 의 paths 와 함께 늘려야 한다. */
export type IconName =
  | "alert"
  | "arrow-down"
  | "bell"
  | "building"
  | "call"
  | "check"
  | "cloud"
  | "desk"
  | "home"
  | "history"
  | "light"
  | "list"
  | "lock"
  | "map"
  | "people"
  | "phone"
  | "print"
  | "shade"
  | "stairs"
  | "sun"
  | "water"
