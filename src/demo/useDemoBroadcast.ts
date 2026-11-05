// 차차를 열어 둔 관객 폰: 시연 문자 폴링 + 참여 기록.

import { useEffect, useRef } from "react"
import type { Profile } from "../data/profile"
import { showIncomingAlert, type NotificationPayload } from "../notifications"
import { demoNotificationCopy } from "./broadcast"
import {
  fetchDemoCurrent,
  joinDemo,
  loadDemoDeviceId,
  loadSeenDemoId,
  saveSeenDemoId,
} from "./demoClient"

const POLL_MS = 2_000
const JOIN_MS = 30_000
const MAX_AGE_MS = 30 * 60 * 1000

export function useDemoBroadcast({
  enabled,
  profile,
  onIncoming,
}: {
  enabled: boolean
  profile: Profile
  onIncoming: (payload: NotificationPayload) => void
}) {
  const onIncomingRef = useRef(onIncoming)
  onIncomingRef.current = onIncoming

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let lastJoin = 0
    let deviceId = ""

    const tick = async () => {
      try {
        if (!deviceId) deviceId = await loadDemoDeviceId()
        const now = Date.now()
        if (now - lastJoin >= JOIN_MS) {
          await joinDemo(deviceId)
          lastJoin = now
        }
        const current = await fetchDemoCurrent()
        if (cancelled || !current) return
        const sentAt = Date.parse(current.sentAt)
        if (Number.isFinite(sentAt) && now - sentAt > MAX_AGE_MS) return
        const seen = await loadSeenDemoId()
        if (seen === current.id) return
        await saveSeenDemoId(current.id)
        const copy = demoNotificationCopy(current, profile)
        await showIncomingAlert(copy.title, copy.body, copy.payload, profile.soundSensitive)
        if (!cancelled) onIncomingRef.current(copy.payload)
      } catch {
        /* 시연 서버가 없어도 앱은 그대로 쓴다 */
      }
    }

    tick()
    const id = window.setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [enabled, profile])
}
