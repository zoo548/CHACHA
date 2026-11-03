// 실제 알림 화면을 바로 보여 주는 예시. 잠금화면·대기·차차등 전송은 하지 않는다.

import { useEffect, useState } from "react"
import { deviceCommand } from "../alerts/level"
import {
  SAMPLE_ALERTS,
  SAMPLE_VIEW_MODES,
  sampleAlertView,
  type SampleAlertSpec,
} from "../data/sampleAlerts"
import type { Profile, ReadingLevel } from "../data/profile"
import { useDevice } from "../device/DeviceContext"
import { ProtoAlert } from "./ProtoAlert"

export function SampleAlerts({
  back,
  profile,
  source,
}: {
  back: () => void
  profile: Profile
  source: () => void
}) {
  const { send, state } = useDevice()
  const [specId, setSpecId] = useState<SampleAlertSpec["id"]>(SAMPLE_ALERTS[0].id)
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(profile.readingLevel)
  const [sentToDevice, setSentToDevice] = useState(false)

  const spec = SAMPLE_ALERTS.find((item) => item.id === specId) ?? SAMPLE_ALERTS[0]
  const view = sampleAlertView(spec, profile)
  const connected = state.status === "connected"

  const signal =
    view && view.uiLevel !== "practice"
      ? deviceCommand(view.uiLevel, spec.disasterId)
      : null

  useEffect(() => {
    if (!sentToDevice || !signal) return
    send(signal).catch(() => {})
  }, [send, sentToDevice, signal])

  const close = () => {
    if (sentToDevice) send("C").catch(() => {})
    back()
  }

  return (
    <div className="sample-preview">
      <p className="sample-flag">예시 화면</p>
      <div className="sample-grade-tabs" role="tablist" aria-label="등급">
        {SAMPLE_ALERTS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === spec.id}
            className={`${item.id}${item.id === spec.id ? " active" : ""}`}
            onClick={() => setSpecId(item.id)}
          >
            <b>{item.tab}</b>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="sample-view-tabs" role="tablist" aria-label="보기 방식">
        {SAMPLE_VIEW_MODES.map((mode) => (
          <button
            key={mode.level}
            type="button"
            role="tab"
            aria-selected={readingLevel === mode.level}
            className={readingLevel === mode.level ? "active" : ""}
            onClick={() => setReadingLevel(mode.level)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {connected && (
        <button
          className="sample-device-btn"
          type="button"
          onClick={() => setSentToDevice(true)}
        >
          차차등에도 보내기
        </button>
      )}
      {view && (
        <ProtoAlert
          key={`${spec.id}-${readingLevel}`}
          view={view}
          readingLevel={readingLevel}
          soundSensitive={profile.soundSensitive}
          acknowledge={close}
          openEmergency={() => {}}
          source={source}
          hideBanner
        />
      )}
    </div>
  )
}
