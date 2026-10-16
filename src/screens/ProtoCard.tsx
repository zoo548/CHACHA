// 내 재난 대비 카드. 각 항목에 전화 가능한 사람은 바로 ProtoSheet 로 전화 확인.

import { cardItems } from "../data/cardItems"
import { Icon } from "../components/Icon"
import { Logo } from "../components/Logo"
import { ProtoButton } from "../components/ProtoButton"

export function ProtoCard({
  openPdf,
  call,
  edit,
}: {
  openPdf: () => void
  call: () => void
  edit: () => void
}) {
  return (
    <main className="proto-page card-page">
      <section className="page-heading">
        <h1>나의 재난 대비 카드</h1>
        <p>급할 때 이 카드를 보여 주세요.</p>
      </section>
      <article className="disaster-card">
        <header>
          <Logo />
          <b>차차 재난 대비 카드</b>
          <button onClick={edit}>고치기</button>
        </header>
        {cardItems.map(([label, value]) => (
          <section key={label}>
            <b>{label}</b>
            <p>
              {value}
              {["도와줄 사람", "또 다른 사람", "기관"].includes(label) && (
                <button onClick={call}>
                  <Icon name="call" />
                </button>
              )}
            </p>
          </section>
        ))}
      </article>
      <div className="split-actions">
        <ProtoButton onClick={openPdf}>PDF로 저장</ProtoButton>
        <ProtoButton secondary onClick={openPdf}>인쇄하기</ProtoButton>
      </div>
    </main>
  )
}
