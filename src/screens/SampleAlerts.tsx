// 예시 화면: 먼저 고르고, 그다음 실제 알림 화면과 같이 본다.

import { useEffect, useState } from "react"
import { deviceCommand } from "../alerts/level"
import { ProtoButton } from "../components/ProtoButton"
import {
  SAMPLE_ALERTS,
  SAMPLE_VIEW_MODES,
  loadSamplePicker,
  sampleAlertView,
  saveSamplePicker,
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
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<"pick" | "view">("pick")
  const [specId, setSpecId] = useState<SampleAlertSpec["id"]>("critical")
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(profile.readingLevel)
  const [hideMark, setHideMark] = useState(false)
  const [sentToDevice, setSentToDevice] = useState(false)

  const spec = SAMPLE_ALERTS.find((item) => item.id === specId) ?? SAMPLE_ALERTS[0]
  const view = sampleAlertView(spec, profile)
  const connected = state.status === "connected"

  const signal =
    view && view.uiLevel !== "practice"
      ? deviceCommand(view.uiLevel, spec.disasterId)
      : null

  useEffect(() => {
    let cancelled = false
    loadSamplePicker(profile.readingLevel).then((saved) => {
      if (cancelled) return
      setSpecId(saved.specId)
      setReadingLevel(saved.readingLevel)
      setHideMark(saved.hideMark)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [profile.readingLevel])

  useEffect(() => {
    if (!ready) return
    saveSamplePicker({ specId, readingLevel, hideMark }).catch(() => {})
  }, [ready, specId, readingLevel, hideMark])

  useEffect(() => {
    if (phase !== "view" || !sentToDevice || !signal) return
    send(signal).catch(() => {})
  }, [phase, send, sentToDevice, signal])

  const stopDevice = () => {
    if (!sentToDevice) return
    send("C").catch(() => {})
    setSentToDevice(false)
  }

  useEffect(() => {
    if (phase !== "view") return
    window.history.pushState({ chachaSampleView: 1 }, "")
    const onPop = () => {
      stopDevice()
      setPhase("pick")
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [phase])

  const leaveView = () => {
    stopDevice()
    setPhase("pick")
    if (window.history.state?.chachaSampleView) window.history.back()
  }

  if (!ready) return <div className="proto-page" />

  if (phase === "view" && view) {
    return (
      <ProtoAlert
        key={`${spec.id}-${readingLevel}`}
        view={view}
        readingLevel={readingLevel}
        soundSensitive={profile.soundSensitive}
        acknowledge={leaveView}
        openEmergency={() => {}}
        source={source}
        hideBanner
        showSampleMark={!hideMark}
      />
    )
  }

  return (
    <main className="proto-page sample-pick-page">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <section className="page-heading compact">
        <h1>예시 화면 보기</h1>
        <p>보고 싶은 알림을 고르세요.</p>
      </section>
      <section className="settings-block">
        <h2>어떤 알림을 볼까요?</h2>
        <div className="sample-pick-grades">
          {SAMPLE_ALERTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${item.id}${item.id === spec.id ? " active" : ""}`}
              onClick={() => setSpecId(item.id)}
            >
              <b>{item.tab}</b>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="settings-block">
        <h2>어떻게 볼까요?</h2>
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
      </section>
      <section className="settings-block">
        <button
          type="button"
          className={`sample-hide-switch${hideMark ? " active" : ""}`}
          aria-pressed={hideMark}
          onClick={() => setHideMark((prev) => !prev)}
        >
          캡처용: 예시 표시 숨기기
        </button>
      </section>
      {connected && (
        <button
          className="sample-device-btn"
          type="button"
          onClick={() => setSentToDevice(true)}
        >
          차차등에도 보내기
        </button>
      )}
      <ProtoButton onClick={() => setPhase("view")}>이 화면 보기</ProtoButton>
    </main>
  )
}
