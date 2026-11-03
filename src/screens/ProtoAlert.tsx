// 알림 상세 화면. 색은 정부 3단계 (critical 빨강, emergency 주황, safety 파랑).
// readingLevel 1 은 글 화면, 2 는 그림+글, 3 은 큰 그림 카드.
// 위 색 띠와 아래 버튼은 고정, 가운데만 한 덩어리로 스크롤한다.

import { useEffect, useRef, useState } from "react"
import { gradeDots, gradeEasyName, gradeOfficialName } from "../alerts/level"
import { CallActionButton, CallMark, CallMissing, FingerHint } from "../components/CallAction"
import { hasAssetIcon, Icon } from "../components/Icon"
import { Lines } from "../components/Lines"
import { ProtoButton } from "../components/ProtoButton"
import type { AlertAction, AlertView, PhoneKind } from "../data/alertTemplate"
import { toTelDigits } from "../data/profile"
import type { ReadingLevel } from "../data/profile"
import { playAlertTone, speak, stopSpeak, vibrateAlert } from "../speech"

function headerDots(level: AlertView["uiLevel"]) {
  return level === "practice" ? "●" : gradeDots(level)
}

function headerEasy(level: AlertView["uiLevel"], title: string) {
  return level === "practice" ? title : gradeEasyName(level)
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

function picCardClass(action: AlertAction, extra = "") {
  const hasArt = hasAssetIcon(action.art)
  return [
    "pic-card",
    hasArt ? "" : "text-only",
    action.disabled ? "disabled" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ")
}

function PicCardBody({ action }: { action: AlertAction }) {
  const art = action.art
  const hasArt = hasAssetIcon(art)
  const label = hasArt && action.short ? (
    <b>{action.short}</b>
  ) : hasArt ? (
    <small>{action.text}</small>
  ) : (
    <b>{action.text}</b>
  )
  return (
    <>
      {hasArt && art && (
        <span className="pic-card-art">
          <Icon name={art} />
        </span>
      )}
      {label}
    </>
  )
}

function PicCard({
  action,
  practice,
  practiced,
  sample,
  onPractice,
  onEmergency,
}: {
  action: AlertAction
  practice?: boolean
  practiced?: boolean
  sample?: boolean
  onPractice?: () => void
  onEmergency?: (kind: Extract<PhoneKind, "119" | "112">) => void
}) {
  const longPress = useLongPress(() => speak(action.text))
  const [sampleTapped, setSampleTapped] = useState(false)

  if (action.phoneKind) {
    if (action.disabled || !action.phoneNumber) {
      return (
        <div className={picCardClass(action)}>
          <PicCardBody action={action} />
          <CallMissing />
        </div>
      )
    }

    const inner = (
      <>
        <CallMark className="call-badge" />
        <PicCardBody action={action} />
        <em className="call-card-hint">누르면 전화해요</em>
      </>
    )

    const onClick = (event: { preventDefault: () => void }) => {
      if (sample || practice) {
        event.preventDefault()
        if (sample) setSampleTapped(true)
        onPractice?.()
      } else if (action.phoneKind === "119" || action.phoneKind === "112") {
        event.preventDefault()
        onEmergency?.(action.phoneKind)
      }
    }

    const digits = toTelDigits(action.phoneNumber)
    const clickable =
      sample || practice || action.phoneKind === "119" || action.phoneKind === "112"
    return (
      <div className="call-wrap">
        {clickable ? (
          <button className={picCardClass(action, "call-card")} type="button" onClick={onClick}>
            {inner}
          </button>
        ) : (
          <a className={picCardClass(action, "call-card")} href={`tel:${digits}`}>
            {inner}
          </a>
        )}
        {practice && !practiced && <FingerHint />}
        {practice && practiced && (
          <p className="call-practice-ok">
            <span>잘했어요!</span>
            <span>진짜 알림에서는 전화가 걸려요.</span>
          </p>
        )}
        {sample && sampleTapped && (
          <p className="call-practice-ok">예시에서는 전화가 걸리지 않아요</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={picCardClass(action)}
      onPointerDown={longPress.onPointerDown}
      onPointerUp={longPress.onPointerUp}
      onPointerCancel={longPress.onPointerCancel}
      onPointerLeave={longPress.onPointerLeave}
    >
      <PicCardBody action={action} />
    </div>
  )
}

type PhoneHandlers = {
  practice?: boolean
  practiced?: boolean
  sample?: boolean
  onPractice?: () => void
  onEmergency?: (kind: Extract<PhoneKind, "119" | "112">) => void
}

function Level1Actions({
  view,
  ...phone
}: {
  view: AlertView
} & PhoneHandlers) {
  return (
    <div className="proto-actions">
      {(() => {
        let step = 0
        return view.actions.map((action) => {
          if (action.phoneKind) {
            return (
              <CallActionButton
                action={action}
                key={action.text}
                practice={phone.practice}
                practiced={phone.practiced}
                sample={phone.sample}
                onPractice={phone.onPractice}
                onEmergency={phone.onEmergency}
              />
            )
          }
          step += 1
          return (
            <div className="proto-action" key={action.text}>
              <i>{step}</i>
              <span><Lines text={action.text} /></span>
              {action.icon && <Icon name={action.icon} />}
            </div>
          )
        })
      })()}
    </div>
  )
}

function Level2Actions({
  view,
  ...phone
}: {
  view: AlertView
} & PhoneHandlers) {
  return (
    <div className="proto-actions level-2">
      {view.actions.map((action) => {
        if (action.phoneKind) {
          return (
            <CallActionButton
              action={action}
              key={action.text}
              practice={phone.practice}
              practiced={phone.practiced}
              sample={phone.sample}
              onPractice={phone.onPractice}
              onEmergency={phone.onEmergency}
            />
          )
        }
        return (
          <div className="proto-action pictured" key={action.text}>
            <i className="action-art">
              {hasAssetIcon(action.art) ? <Icon name={action.art} /> : null}
            </i>
            <span><Lines text={action.text} /></span>
          </div>
        )
      })}
    </div>
  )
}

function Level3Actions({
  view,
  ...phone
}: {
  view: AlertView
} & PhoneHandlers) {
  return (
    <div className="pic-cards">
      {view.actions.map((action) => (
        <PicCard
          action={action}
          key={action.text}
          practice={phone.practice}
          practiced={phone.practiced}
          sample={phone.sample}
          onPractice={phone.onPractice}
          onEmergency={phone.onEmergency}
        />
      ))}
    </div>
  )
}

export function ProtoAlert({
  view,
  readingLevel,
  soundSensitive,
  acknowledge,
  openEmergency,
  source,
}: {
  view: AlertView
  readingLevel: ReadingLevel
  soundSensitive: boolean
  acknowledge: () => void
  openEmergency: (kind: Extract<PhoneKind, "119" | "112">) => void
  source: () => void
}) {
  const mainRef = useRef<HTMLElement>(null)
  const [compact, setCompact] = useState(false)
  const [practiced, setPracticed] = useState(false)
  const practice = view.uiLevel === "practice"
  const sample = Boolean(view.sample)
  const phone: PhoneHandlers = {
    practice,
    sample,
    practiced,
    onPractice: () => setPracticed(true),
    onEmergency: sample ? () => setPracticed(true) : openEmergency,
  }

  useEffect(() => {
    vibrateAlert()
    if (!soundSensitive) {
      playAlertTone()
      speakHeadline(view)
    }
    return () => stopSpeak()
  }, [view, soundSensitive])

  useEffect(() => {
    setCompact(false)
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [view, readingLevel])

  return (
    <article className={`prototype-alert ${view.uiLevel} level-${readingLevel}${compact ? " compact" : ""}${sample ? " sample" : ""}`}>
      {sample && <p className="sample-flag">예시 알림이에요</p>}
      <header>
        <b>{headerDots(view.uiLevel)}</b>
        <h1>{headerEasy(view.uiLevel, view.title)}</h1>
        {view.uiLevel !== "practice" && (
          <p className="alert-official">{gradeOfficialName(view.uiLevel)}</p>
        )}
      </header>
      <main
        ref={mainRef}
        onScroll={(event) => {
          setCompact(event.currentTarget.scrollTop > 4)
        }}
      >
        {readingLevel >= 2 && (
          <div className="alert-hero-inline" aria-hidden="true">
            <Icon name={view.heroArt} />
          </div>
        )}
        {view.uiLevel !== "practice" && <p className="alert-disaster">{view.title}</p>}
        <p>{view.situation}</p>
        <h2>이렇게 해요</h2>
        {readingLevel === 2 ? (
          <Level2Actions view={view} {...phone} />
        ) : readingLevel === 3 ? (
          <Level3Actions view={view} {...phone} />
        ) : (
          <Level1Actions view={view} {...phone} />
        )}
      </main>
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
