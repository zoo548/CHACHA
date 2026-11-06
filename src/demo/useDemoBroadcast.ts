// 시연 참여 관객: 3초마다 시연 문자를 확인하고, 화면이 다시 켜지면 바로 한 번 더 본다.

import { useEffect, useRef } from "react"
import { handleIncomingAlert } from "../alerts/handleIncomingAlert"
import { showIncomingAlert, type NotificationPayload } from "../notifications"
import {
  fetchDemoCurrent,
  joinDemo,
  loadDemoDeviceId,
  loadOrStartDemoJoinedAt,
  loadSeenDemoId,
  saveSeenDemoId,
  shouldPresentDemoMessage,
} from "./demoClient"

const POLL_MS = 3_000
const JOIN_MS = 30_000

export function useDemoBroadcast({
  enabled,
  onIncoming,
  onLink,
}: {
  enabled: boolean
  onIncoming: (payload: NotificationPayload) => void
  onLink?: (ok: boolean) => void
}) {
  const onIncomingRef = useRef(onIncoming)
  onIncomingRef.current = onIncoming
  const onLinkRef = useRef(onLink)
  onLinkRef.current = onLink

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let lastJoin = 0
    let deviceId = ""
    let inflight = false

    const tick = async () => {
      if (inflight || cancelled) return
      inflight = true
      try {
        if (!deviceId) deviceId = await loadDemoDeviceId()
        const now = Date.now()
        if (now - lastJoin >= JOIN_MS) {
          await joinDemo(deviceId)
          lastJoin = now
        }
        const current = await fetchDemoCurrent()
        if (cancelled) return
        onLinkRef.current?.(true)
        if (!current) return
        const [seen, joinedAt] = await Promise.all([loadSeenDemoId(), loadOrStartDemoJoinedAt()])
        if (!shouldPresentDemoMessage(current, { seenId: seen, joinedAt })) {
          if (seen !== current.id) await saveSeenDemoId(current.id)
          return
        }
        const payload = handleIncomingAlert(current.message, {
          broadcast: current.govType,
          alertId: current.id,
        })
        if (!payload) return
        await saveSeenDemoId(current.id)
        await showIncomingAlert("재난문자가 왔어요", current.message, payload, false)
        if (!cancelled) onIncomingRef.current(payload)
      } catch {
        if (!cancelled) onLinkRef.current?.(false)
      } finally {
        inflight = false
      }
    }

    const onResume = () => {
      if (document.visibilityState === "hidden") return
      tick()
    }

    tick()
    const id = window.setInterval(tick, POLL_MS)
    document.addEventListener("visibilitychange", onResume)
    window.addEventListener("pageshow", onResume)
    window.addEventListener("focus", onResume)
    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", onResume)
      window.removeEventListener("pageshow", onResume)
      window.removeEventListener("focus", onResume)
    }
  }, [enabled])
}
