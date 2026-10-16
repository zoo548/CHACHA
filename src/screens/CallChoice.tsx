// HelpScreen 다음 단계. 상황에 따라 119/112/엄마/선생님 중 누구에게 전화할지 선택.

import { ProtoRow } from "../components/ProtoRow"

export function CallChoice({
  situation,
  back,
  call,
}: {
  situation: string
  back: () => void
  call: (number: string) => void
}) {
  const emergency = situation !== "무서운 사람이 있어요" && situation !== "잘 모르겠어요"
  return (
    <main className="proto-page">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <em className="situation-pill">{situation}</em>
      <section className="page-heading compact">
        <h1>누구에게 전화할까요?</h1>
      </section>
      <article className="white-card help-list">
        <ProtoRow
          icon={emergency ? "alert" : "call"}
          title={`${emergency ? "119" : "112"}에 전화하기`}
          description={emergency ? "구해 주는 곳이에요" : "경찰이 오는 곳이에요"}
          onClick={() => call(emergency ? "119" : "112")}
        />
        <ProtoRow
          icon="people"
          title="엄마에게 전화하기"
          description="김영희"
          onClick={() => call("엄마")}
        />
        <ProtoRow
          icon="building"
          title="선생님에게 전화하기"
          description="관악복지관"
          onClick={() => call("선생님")}
        />
      </article>
      <p className="card-note">내 카드에 적은 사람이에요.</p>
    </main>
  )
}
