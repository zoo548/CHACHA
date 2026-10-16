// 아이폰 잠금화면 데모. 재난문자 알림이 두 개 쌓인 모습 (차차 알림 + 원문 알림).
// 차차 알림을 누르면 알림 상세로 들어간다.

import { Logo } from "../components/Logo"

export function LockScreen({ openAlert }: { openAlert: () => void }) {
  return (
    <main className="lock-screen">
      <div className="lock-time">
        <b>오후 2:20</b>
        <span>8월 15일 토요일</span>
      </div>
      <button className="lock-notification primary" onClick={openAlert}>
        <header>
          <Logo />
          <span>· 지금</span>
        </header>
        <em>▲ 위험</em>
        <b>비가 아주 많이 와요</b>
        <p>물이 빨리 차올라서 위험해요.</p>
      </button>
      <article className="lock-notification">
        <b>위급재난문자</b>
        <p>[기상청] 관악구 호우경보 발효. 하천변, 지하공간 등 위험지역 접근을 자제하고…</p>
      </article>
    </main>
  )
}
