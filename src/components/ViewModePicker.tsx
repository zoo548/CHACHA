// 알림을 어떻게 볼지 / 큰 소리가 싫은지 고르는 칸.
// 온보딩과 설정 화면이 같이 쓴다. 호우 위험 한 가지를 세 방식으로 보여 준다.

import { Icon } from "./Icon"
import { getAlertView, type AlertView } from "../data/alertTemplate"
import type { Profile, ReadingLevel } from "../data/profile"

const LABELS: [ReadingLevel, string][] = [
  [1, "글로 볼래요"],
  [2, "그림과 글로 볼래요"],
  [3, "큰 그림으로 볼래요"],
]

function MiniPreview({ level, view }: { level: ReadingLevel; view: AlertView }) {
  const rows = view.actions.slice(0, 3)
  if (level === 1) {
    return (
      <div className="view-mini level-1">
        <b>{view.title}</b>
        {rows.map((a) => (
          <span key={a.text}>{a.text}</span>
        ))}
      </div>
    )
  }
  if (level === 2) {
    return (
      <div className="view-mini level-2">
        <header>
          <Icon name={view.heroArt} />
          <b>{view.title}</b>
        </header>
        {rows.map((a) => (
          <div key={a.text}>
            <i>{a.art ? <Icon name={a.art} /> : null}</i>
            <span>{a.text}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="view-mini level-3">
      <Icon name={view.heroArt} />
      <b>{view.title}</b>
      <div>
        {rows.map((a) => (
          <em key={a.text}>
            {a.art ? <Icon name={a.art} /> : <i />}
            <span>{a.short ?? a.text}</span>
          </em>
        ))}
      </div>
    </div>
  )
}

export function ReadingLevelPicker({
  profile,
  onChange,
}: {
  profile: Profile
  onChange: (level: ReadingLevel) => void
}) {
  const view =
    getAlertView("heavy_rain", "evacuate", profile) ??
    getAlertView("heavy_rain", "caution", profile)
  if (!view) return null
  return (
    <div className="choice-stack">
      {LABELS.map(([level, label]) => (
        <button
          key={level}
          type="button"
          className={`choice-card ${profile.readingLevel === level ? "active" : ""}`}
          onClick={() => onChange(level)}
        >
          <strong>{label}</strong>
          <MiniPreview level={level} view={view} />
        </button>
      ))}
    </div>
  )
}

export function SoundSensitivePicker({
  value,
  onChange,
}: {
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="choice-stack sound-choice">
      <button
        type="button"
        className={`choice-card ${value ? "active" : ""}`}
        onClick={() => onChange(true)}
      >
        <strong>네, 싫어요</strong>
        <span>알림 소리 없이 진동과 차차등만 켜요.</span>
      </button>
      <button
        type="button"
        className={`choice-card ${!value ? "active" : ""}`}
        onClick={() => onChange(false)}
      >
        <strong>괜찮아요</strong>
        <span>알림 소리가 나고, 제목을 읽어 줘요.</span>
      </button>
    </div>
  )
}
