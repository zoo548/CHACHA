// 차차 로고.
// - 작은 버전: 세 점 로고마크 + "차차" 글자
// - large: 큰 로고마크 + "차차" + 작은 영문 라벨 (온보딩 시작 화면 전용)
// - onSecretTap: 2초 안에 지정 횟수(기본 5번)만큼 누르면 호출 — 시연 패널 숨은 입구.

import { useRef } from "react"

export function Logo({
  large = false,
  onSecretTap,
  secretCount = 5,
}: {
  large?: boolean
  onSecretTap?: () => void
  secretCount?: number
}) {
  const taps = useRef<number[]>([])

  const handleClick = () => {
    if (!onSecretTap) return
    const now = Date.now()
    // 2초보다 오래된 탭은 버린다.
    taps.current = taps.current.filter((t) => now - t < 2000)
    taps.current.push(now)
    if (taps.current.length >= secretCount) {
      taps.current = []
      onSecretTap()
    }
  }

  // onSecretTap 이 있을 때만 클릭 가능한 div 로. 평소에는 평범한 div.
  const className = large ? "brand-logo large" : "brand-logo"
  const interactive = Boolean(onSecretTap)
  return (
    <div
      className={className}
      onClick={interactive ? handleClick : undefined}
      style={interactive ? { cursor: "default" } : undefined}
    >
      <span className="logo-mark"><i /><i /><i /></span>
      <strong>차차</strong>
      {large && <small>CHA-CHA</small>}
    </div>
  )
}
