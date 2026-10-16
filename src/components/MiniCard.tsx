// 온보딩이 끝나고 보여주는 미니 카드 요약 (이름, 도와줄 사람, 집 주소).

import { Logo } from "./Logo"

export function MiniCard() {
  return (
    <div className="mini-card">
      <Logo />
      <hr />
      <b>김민수</b>
      <span>도와줄 사람</span>
      <strong>김영희 (엄마)</strong>
      <span>우리 집 주소</span>
      <strong>관악구 신림동</strong>
    </div>
  )
}
