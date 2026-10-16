// 미리 준비하기 메인. 카드 보기와 집 안전 점검으로 들어간다.

import { Icon } from "../components/Icon"
import { ProtoButton } from "../components/ProtoButton"

export function PrepScreen({
  goCard,
  startSafety,
  safetyComplete,
}: {
  goCard: () => void
  startSafety: () => void
  safetyComplete: boolean
}) {
  return (
    <main className="proto-page">
      <section className="page-heading">
        <h1>재난을 미리 준비해요</h1>
        <p>천천히 하나씩 하면 돼요.</p>
      </section>
      <div className="card-stack">
        <article className="task-card">
          <span><Icon name="people" /></span>
          <h2>나의 재난 대비 카드</h2>
          <p>급할 때 도와줄 사람을 적어요.</p>
          <ProtoButton onClick={goCard}>카드 보기</ProtoButton>
        </article>
        <article className="task-card">
          <header>
            <span><Icon name="home" /></span>
            {safetyComplete && <em>10월 9일 점검</em>}
          </header>
          <h2>우리 집 안전 점검</h2>
          <p>{safetyComplete ? "준비할 것이 4개 있어요." : "집이 안전한지 확인해요."}</p>
          <ProtoButton secondary onClick={startSafety}>
            {safetyComplete ? "결과 보기" : "점검하기"}
          </ProtoButton>
        </article>
      </div>
    </main>
  )
}
