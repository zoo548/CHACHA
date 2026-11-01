// 알림 상세 화면. 재난 종류별로 색이 다르다 (danger 빨강, caution 노랑, practice 파랑).
// readingLevel 1 은 예전 글 화면, 2 는 그림+글, 3 은 큰 그림 카드.

import { useEffect, useRef } from "react"
import { Icon } from "../components/Icon"
import { Lines } from "../components/Lines"
import { ProtoButton } from "../components/ProtoButton"
import type { AlertAction, AlertView } from "../data/alertTemplate"
import { toTelDigits } from "../data/profile"
import type { ReadingLevel } from "../data/profile"
import { playAlertTone, speak, stopSpeak, vibrateAlert } from "../speech"

function badge(level: AlertView["uiLevel"]) {
  return level === "danger" ? "▲ 위험" : level === "caution" ? "● 주의" : "● 연습"
}

function speakHeadline(view: AlertView) {
  speak(`${view.title}. ${view.situation}`)
}

function useLongPress(onLong: () => void, ms = 550) {
  const timer = useRef<number | null>(null)
  const fired = useRef(false)
  const clear = () => {
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }
  return {
    onPointerDown: () => {
      fired.current = false
      clear()
      timer.current = window.setTimeout(() => {
        fired.current = true
        onLong()
      }, ms)
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    swallowClick: (event: { preventDefault: () => void; stopPropagation: () => void }) => {
      if (fired.current) {
        event.preventDefault()
        event.stopPropagation()
        fired.current = false
      }
    },
  }
}

function PicCard({
  action,
}: {
  action: AlertAction
}) {
  const longPress = useLongPress(() => speak(action.text))
  const label = action.short ? (
    <b>{action.short}</b>
  ) : (
    <small>{action.text}</small>
  )
  const art = action.art ? <Icon name={action.art} /> : <i className="pic-ph" />
  const inner = (
    <>
      <span className="pic-card-art">{art}</span>
      {label}
    </>
  )
  const digits = action.phoneNumber ? toTelDigits(action.phoneNumber) : ""
  if (action.phone && digits && !action.disabled) {
    return (
      <a
        className="pic-card"
        href={`tel:${digits}`}
        onPointerDown={longPress.onPointerDown}
        onPointerUp={longPress.onPointerUp}
        onPointerCancel={longPress.onPointerCancel}
        onPointerLeave={longPress.onPointerLeave}
        onClick={(event) => {
          longPress.swallowClick(event)
        }}
      >
        {inner}
      </a>
    )
  }
  return (
    <div
      className={`pic-card ${action.disabled ? "disabled" : ""}`}
      onPointerDown={longPress.onPointerDown}
      onPointerUp={longPress.onPointerUp}
      onPointerCancel={longPress.onPointerCancel}
      onPointerLeave={longPress.onPointerLeave}
    >
      {inner}
    </div>
  )
}

function Level1({ view, call }: { view: AlertView; call: () => void }) {
  const calls = view.actions.filter((a) => a.phone)
  const first = view.actions.findIndex((a) => a.phone)
  return (
    <>
      <header>
        <b>{badge(view.uiLevel)}</b>
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
    </>
  )
}

function Level2({ view, call }: { view: AlertView; call: (action: AlertAction) => void }) {
  return (
    <>
      <header className="alert-hero-mid">
        <b>{badge(view.uiLevel)}</b>
        <span><Icon name={view.heroArt} /></span>
        <h1>{view.title}</h1>
      </header>
      <main>
        <section className="alert-card">
          <p>{view.situation}</p>
          <h2>이렇게 해요</h2>
          <div className="proto-actions level-2">
            {view.actions.map((action) => {
              const body = (
                <>
                  <i className="action-art">{action.art ? <Icon name={action.art} /> : null}</i>
                  <span><Lines text={action.text} /></span>
                </>
              )
              if (action.phone) {
                return (
                  <button
                    className="proto-action pictured"
                    disabled={action.disabled}
                    onClick={() => call(action)}
                    key={action.text}
                  >
                    {body}
                  </button>
                )
              }
              return (
                <div className="proto-action pictured" key={action.text}>
                  {body}
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </>
  )
}

function Level3({ view }: { view: AlertView }) {
  return (
    <>
      <header className="alert-hero-big">
        <b>{badge(view.uiLevel)}</b>
        <span><Icon name={view.heroArt} /></span>
        <h1>{view.title}</h1>
      </header>
      <main>
        <section className="alert-card level-3">
          <p>{view.situation}</p>
          <h2>이렇게 해요</h2>
          <div className="pic-cards">
            {view.actions.map((action) => (
              <PicCard action={action} key={action.text} />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export function ProtoAlert({
  view,
  readingLevel,
  soundSensitive,
  acknowledge,
  call,
  source,
}: {
  view: AlertView
  readingLevel: ReadingLevel
  soundSensitive: boolean
  acknowledge: () => void
  call: (action?: AlertAction) => void
  source: () => void
}) {
  useEffect(() => {
    vibrateAlert()
    if (!soundSensitive) {
      playAlertTone()
      speakHeadline(view)
    }
    return () => stopSpeak()
  }, [view, soundSensitive])

  return (
    <article className={`prototype-alert ${view.uiLevel} level-${readingLevel}`}>
      {readingLevel === 2 ? (
        <Level2 view={view} call={(action) => call(action)} />
      ) : readingLevel === 3 ? (
        <Level3 view={view} />
      ) : (
        <Level1 view={view} call={() => call()} />
      )}
      <footer>
        <ProtoButton text onClick={() => speakHeadline(view)}>다시 듣기</ProtoButton>
        <ProtoButton onClick={acknowledge}>알았어요</ProtoButton>
        {view.uiLevel !== "practice" && (
          <button onClick={source}>행정안전부 · 오후 2:20 · 원문 보기 ⌄</button>
        )}
      </footer>
    </article>
  )
}
