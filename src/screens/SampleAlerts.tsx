// 누구나 눌러 보는 3색 예시 알림. 대비하기·설정에서 들어온다.

import { SAMPLE_ALERTS, type SampleAlertSpec } from "../data/sampleAlerts"

export function SampleAlerts({
  back,
  sendSample,
  waiting,
}: {
  back: () => void
  sendSample: (spec: SampleAlertSpec) => void
  waiting: boolean
}) {
  return (
    <main className="proto-page sample-page">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <section className="page-heading compact">
        <h1>예시 알림 보기</h1>
        <p>세 가지 색 알림을 미리 봐요.</p>
      </section>
      <div className="sample-alert-list">
        {SAMPLE_ALERTS.map((spec) => (
          <button
            key={spec.id}
            className={`sample-alert-btn ${spec.id}`}
            type="button"
            disabled={waiting}
            onClick={() => sendSample(spec)}
          >
            <b>{spec.button}</b>
            <span>{spec.name}</span>
          </button>
        ))}
      </div>
      {waiting ? (
        <p className="sample-wait">5초 뒤에 알림이 와요.</p>
      ) : (
        <p className="sample-wait muted">버튼을 누르면 잠시 뒤에 알림이 와요.</p>
      )}
    </main>
  )
}
