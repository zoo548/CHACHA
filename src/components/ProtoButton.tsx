// 공통 큰 버튼.
// - 기본: 파란 바탕 흰 글자 "메인 버튼"
// - secondary: 밝은 파란 바탕 "서브 버튼"
// - text: 테두리 없는 텍스트 링크 버튼

import type { ReactNode } from "react"

export function ProtoButton({
  children,
  onClick,
  secondary = false,
  text = false,
}: {
  children: ReactNode
  onClick: () => void
  secondary?: boolean
  text?: boolean
}) {
  return (
    <button
      className={text ? "proto-text-button" : secondary ? "proto-button secondary" : "proto-button"}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
