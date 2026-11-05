// 알림 화면의 전화 줄. 초록 버튼만 전화라는 뜻을 가진다.

import { useState, type ReactNode } from "react"
import type { AlertAction, PhoneKind } from "../data/alertTemplate"
import { DEMO_NO_CALL } from "../demo/audience"
import { SAMPLE_NO_CALL } from "../data/sampleAlerts"
import { toTelDigits } from "../data/profile"
import { Icon } from "./Icon"
import { Lines } from "./Lines"

export function CallMark({ className = "" }: { className?: string }) {
  return (
    <i aria-hidden="true" className={`call-mark ${className}`.trim()}>
      <Icon name="call" />
    </i>
  )
}

export function CallMissing() {
  return (
    <p className="call-missing">
      <span>번호가 없어요.</span>
      <span>설정에서 넣어요.</span>
    </p>
  )
}

function hintFor(action: AlertAction): string {
  if (action.phoneKind === "119" || action.phoneKind === "112") {
    return `누르면 전화해요 · ${action.maskedNumber ?? action.phoneKind}`
  }
  const who = action.who ?? ""
  const num = action.maskedNumber ?? ""
  return num ? `누르면 전화해요 · ${who} ${num}` : "누르면 전화해요"
}

export function FingerHint() {
  return (
    <p className="call-practice-hint">
      <svg aria-hidden="true" className="call-finger" viewBox="0 0 32 32" fill="none">
        <path
          d="M14 4v10M14 4a2.2 2.2 0 0 1 4.4 0v8.5M18.4 6.2a2.2 2.2 0 0 1 4.4 0V15M10 14V9.2A2.2 2.2 0 0 1 14 9v5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10 14.5c-2.4 1.2-4 3.8-4 6.7C6 25.5 9 29 14.8 29c5.6 0 9.2-2.8 9.2-7.2V15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      이 초록 버튼을 눌러 보세요
    </p>
  )
}

export function CallActionButton({
  action,
  practice,
  practiced,
  sample,
  demo,
  onPractice,
  onEmergency,
}: {
  action: AlertAction
  practice?: boolean
  practiced?: boolean
  sample?: boolean
  demo?: boolean
  onPractice?: () => void
  onEmergency?: (kind: Extract<PhoneKind, "119" | "112">) => void
}) {
  const noCall = Boolean(sample || demo)
  const [sampleTapped, setSampleTapped] = useState(false)
  if (!action.phoneKind) return null
  if (!noCall && (action.disabled || !action.phoneNumber)) return <CallMissing />

  const inner = (
    <>
      <CallMark />
      <span>
        <b><Lines text={action.text} /></b>
        <small>{hintFor(action)}</small>
      </span>
    </>
  )

  let control: ReactNode
  if (noCall || practice) {
    control = (
      <button
        className="call-btn"
        type="button"
        onClick={() => {
          if (noCall) setSampleTapped(true)
          onPractice?.()
        }}
      >
        {inner}
      </button>
    )
  } else if (action.phoneKind === "119" || action.phoneKind === "112") {
    const kind = action.phoneKind
    control = (
      <button className="call-btn" type="button" onClick={() => onEmergency?.(kind)}>
        {inner}
      </button>
    )
  } else {
    const digits = toTelDigits(action.phoneNumber ?? "")
    control = (
      <a className="call-btn" href={`tel:${digits}`}>
        {inner}
      </a>
    )
  }

  return (
    <div className="call-wrap">
      {control}
      {practice && !practiced && <FingerHint />}
      {practice && practiced && (
        <p className="call-practice-ok">
          <span>잘했어요!</span>
          <span>진짜 알림에서는 전화가 걸려요.</span>
        </p>
      )}
      {noCall && sampleTapped && (
        <p className="call-practice-ok">{demo ? DEMO_NO_CALL : SAMPLE_NO_CALL}</p>
      )}
    </div>
  )
}
