// QR 또는 시연 기간에 처음 들어온 관객이 시연에 참여하는 첫 화면.

import { useState } from "react"
import { DEMO_START_FRESH } from "../demo/audience"

export function DemoJoinScreen({
  onJoin,
  onStartFresh,
}: {
  onJoin: () => Promise<void>
  onStartFresh?: () => void
}) {
  const [busy, setBusy] = useState(false)

  return (
    <main className="proto-page demo-join-page">
      <section className="page-heading">
        <h1>차차 시연에 오신 것을 환영해요</h1>
      </section>
      <button
        type="button"
        className="demo-join-btn"
        disabled={busy}
        onClick={() => {
          if (busy) return
          setBusy(true)
          onJoin().finally(() => setBusy(false))
        }}
      >
        시연 참여하기
      </button>
      {onStartFresh && (
        <button type="button" className="demo-join-fresh" disabled={busy} onClick={onStartFresh}>
          {DEMO_START_FRESH}
        </button>
      )}
    </main>
  )
}
