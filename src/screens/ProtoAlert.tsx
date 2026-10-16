// 알림 상세 화면. 재난 종류별로 색이 다르다 (danger 빨강, caution 노랑, practice 파랑).
// 전화해야 하는 행동들은 한 그룹으로 묶어서 보여 준다.

import { alertData } from "../data/alerts"
import { Icon } from "../components/Icon"
import { Lines } from "../components/Lines"
import { ProtoButton } from "../components/ProtoButton"
import type { Disaster } from "../types"

export function ProtoAlert({
  type,
  acknowledge,
  call,
  source,
}: {
  type: Disaster
  acknowledge: () => void
  call: () => void
  source: () => void
}) {
  const data = alertData[type]
  const calls = data.actions.filter((a) => a.phone)
  const first = data.actions.findIndex((a) => a.phone)
  return (
    <article className={`prototype-alert ${data.level}`}>
      <header>
        <b>
          {data.level === "danger" ? "▲ 위험" : data.level === "caution" ? "● 주의" : "● 연습"}
        </b>
        <div>
          <span><Icon name={data.hero} /></span>
          <h1>{data.title}</h1>
        </div>
      </header>
      <main>
        <section className="alert-card">
          <p>{data.situation}</p>
          <h2>이렇게 해요</h2>
          <div className="proto-actions">
            {data.actions.map((action, index) => {
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
        {type !== "practice" && (
          <button onClick={source}>행정안전부 · 오후 2:20 · 원문 보기 ⌄</button>
        )}
      </footer>
    </article>
  )
}
