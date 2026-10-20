// 알림 상세 화면. 재난 종류별로 색이 다르다 (danger 빨강, caution 노랑, practice 파랑).
// 전화해야 하는 행동들은 한 그룹으로 묶어서 보여 준다.
// 알림 내용은 상위 App 에서 AlertView 로 미리 만들어 넘겨준다.

import { Icon } from "../components/Icon"
import { Lines } from "../components/Lines"
import { ProtoButton } from "../components/ProtoButton"
import type { AlertView } from "../data/alertTemplate"

export function ProtoAlert({
  view,
  acknowledge,
  call,
  source,
}: {
  view: AlertView
  acknowledge: () => void
  call: () => void
  source: () => void
}) {
  const calls = view.actions.filter((a) => a.phone)
  const first = view.actions.findIndex((a) => a.phone)
  return (
    <article className={`prototype-alert ${view.uiLevel}`}>
      <header>
        <b>
          {view.uiLevel === "danger" ? "▲ 위험" : view.uiLevel === "caution" ? "● 주의" : "● 연습"}
        </b>
        <div>
          <span><Icon name={view.hero} /></span>
          <h1>{view.title}</h1>
        </div>
      </header>
      <main>
        <section className="alert-card">
          <p>{view.situation}</p>
          <h2>이렇게 해요</h2>
          <div className="proto-actions">
            {view.actions.map((action, index) => {
              if (action.phone && index !== first) return null
              if (action.phone) {
                return (
                  <div className="proto-call-group" key="phones">
                    {calls.map((item, n) => (
                      <button disabled={item.disabled} onClick={call} key={item.text}>
                        <i>{first + n + 1}</i>
                        <span><Lines text={item.text} /></span>
                        <Icon name="call" />
                      </button>
                    ))}
                  </div>
                )
              }
              return (
                <div className="proto-action" key={action.text}>
                  <i>{index + 1}</i>
                  <span><Lines text={action.text} /></span>
                  {action.icon && <Icon name={action.icon} />}
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <footer>
        <ProtoButton onClick={acknowledge}>알았어요</ProtoButton>
        {view.uiLevel !== "practice" && (
          <button onClick={source}>행정안전부 · 오후 2:20 · 원문 보기 ⌄</button>
        )}
      </footer>
    </article>
  )
}
