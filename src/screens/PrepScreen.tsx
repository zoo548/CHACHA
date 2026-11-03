// 미리 준비하기 메인. 카드 보기와 집 안전 점검으로 들어간다.

import { Icon } from "../components/Icon"
import { ProtoButton } from "../components/ProtoButton"

export function PrepScreen({
  goCard,
  startSafety,
  goSettings,
  openSamples,
  safetyComplete,
}: {
  goCard: () => void
  startSafety: () => void
  goSettings: () => void
  openSamples: () => void
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
            {safetyComplete && <em>점검했어요</em>}
          </header>
          <h2>우리 집 안전 점검</h2>
          <p>{safetyComplete ? "점검을 다 했어요." : "집이 안전한지 확인해요."}</p>
          <ProtoButton secondary onClick={startSafety}>
            {safetyComplete ? "결과 보기" : "점검하기"}
          </ProtoButton>
        </article>
        <article className="task-card">
          <span><Icon name="list" /></span>
          <h2>알림 보기 방법</h2>
          <p>글만, 그림과 글, 큰 그림을 골라요.</p>
          <ProtoButton secondary onClick={goSettings}>바꾸기</ProtoButton>
        </article>
        <article className="task-card">
          <span><Icon name="bell" /></span>
          <h2>예시 화면 보기</h2>
          <p>알림 화면을 미리 봐요.</p>
          <ProtoButton secondary onClick={openSamples}>예시 화면 보기</ProtoButton>
        </article>
      </div>
    </main>
  )
}
