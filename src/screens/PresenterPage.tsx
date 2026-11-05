// 발표자용 시연 방송 페이지. /presenter 에서만 연다.

import { useEffect, useState } from "react"
import { ProtoButton } from "../components/ProtoButton"
import {
  defaultDemoFields,
  demoDeviceCommand,
  formatDemoSentAt,
} from "../demo/broadcast"
import {
  clearPresenterKey,
  fetchDemoCount,
  fetchDemoCurrent,
  loadPresenterKey,
  resetDemo,
  savePresenterKey,
  sendDemo,
} from "../demo/demoClient"
import { useDevice } from "../device/DeviceContext"

const COUNT_MS = 5_000

export function PresenterPage() {
  const device = useDevice()
  const savedKey = loadPresenterKey()
  const [keyInput, setKeyInput] = useState("")
  const [key, setKey] = useState(savedKey)
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState(defaultDemoFields.message)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [sentLabel, setSentLabel] = useState("")
  const sender = defaultDemoFields.sender
  const govType = defaultDemoFields.govType

  useEffect(() => {
    if (!key) return
    let cancelled = false
    const tick = async () => {
      try {
        const next = await fetchDemoCount()
        if (!cancelled) setCount(next)
      } catch {
        /* 숫자는 마지막 값을 유지 */
      }
    }
    tick()
    const id = window.setInterval(tick, COUNT_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [key])

  useEffect(() => {
    if (!key) return
    fetchDemoCurrent()
      .then((current) => {
        if (current) setSentLabel(formatDemoSentAt(current.sentAt))
      })
      .catch(() => {})
  }, [key])

  const unlock = () => {
    const next = keyInput.trim()
    if (!next) {
      setError("비밀번호를 입력해 주세요.")
      return
    }
    savePresenterKey(next)
    setKey(next)
    setError("")
  }

  const lockOut = () => {
    clearPresenterKey()
    setKey("")
    setKeyInput("")
  }

  const onSend = async () => {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      const current = await sendDemo(key, { message, sender, govType })
      setSentLabel(formatDemoSentAt(current.sentAt))
      if (device.state.status === "connected") {
        await device.send(demoDeviceCommand(current)).catch(() => {})
      }
    } catch (err) {
      if (err instanceof Error && err.message === "unauthorized") {
        lockOut()
        setError("비밀번호가 달라요.")
      } else {
        setError("보내지 못했어요. 다시 눌러 주세요.")
      }
    } finally {
      setBusy(false)
    }
  }

  const onReset = async () => {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await resetDemo(key)
      setSentLabel("")
      if (device.state.status === "connected") {
        await device.send("C").catch(() => {})
      }
    } catch (err) {
      if (err instanceof Error && err.message === "unauthorized") {
        lockOut()
        setError("비밀번호가 달라요.")
      } else {
        setError("지우지 못했어요. 다시 눌러 주세요.")
      }
    } finally {
      setBusy(false)
    }
  }

  const deviceLabel =
    device.state.status === "connected"
      ? "차차등 연결됨"
      : device.state.status === "scanning"
        ? "찾는 중"
        : device.state.status === "connecting"
          ? "연결 중"
          : device.state.status === "unsupported"
            ? "이 브라우저에서는 차차등을 연결할 수 없어요."
            : "차차등 연결 끊김"

  return (
    <main className="presenter-page">
      <header className="presenter-head">
        <p>차차 시연 방송</p>
        <h1>발표자</h1>
      </header>

      {!key ? (
        <section className="presenter-card">
          <label className="proto-field">
            <b>비밀번호</b>
            <span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="발표자 비밀번호"
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") unlock()
                }}
              />
            </span>
          </label>
          {error && <p className="presenter-error">{error}</p>}
          <ProtoButton onClick={unlock}>들어가기</ProtoButton>
        </section>
      ) : (
        <>
          <section className="presenter-count" aria-live="polite">
            <b>{count}</b>
            <span>지금 참여 중인 관객 폰 수</span>
          </section>

          <section className="presenter-card">
            <h2>보낼 문자 미리보기</h2>
            <textarea
              className="presenter-preview"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
            />
            <p className="presenter-meta">발송 유형: {govType}</p>
            <p className="presenter-meta">발송: {sender}</p>
          </section>

          <button className="presenter-send" type="button" onClick={onSend} disabled={busy}>
            재난문자 보내기
          </button>
          <ProtoButton secondary onClick={onReset} disabled={busy}>
            초기화
          </ProtoButton>
          {sentLabel && <p className="presenter-sent">{sentLabel}</p>}
          {error && <p className="presenter-error">{error}</p>}

          <section className="presenter-card">
            <h2>차차등</h2>
            <p>{deviceLabel}</p>
            {device.state.errorMessage && <p className="presenter-error">{device.state.errorMessage}</p>}
            {device.state.status !== "connected" && (
              <ProtoButton
                onClick={() => {
                  device.connect().catch(() => {})
                }}
                disabled={
                  device.state.status === "scanning" ||
                  device.state.status === "connecting" ||
                  device.state.status === "unsupported"
                }
              >
                {device.state.status === "scanning"
                  ? "찾는 중"
                  : device.state.status === "connecting"
                    ? "연결 중"
                    : "차차등 찾기"}
              </ProtoButton>
            )}
          </section>
        </>
      )}
    </main>
  )
}
