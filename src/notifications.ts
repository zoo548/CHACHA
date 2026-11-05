// 로컬 알림 (iOS/Android: @capacitor/local-notifications, 웹: Web Notifications API 폴백).
//
// 흐름:
//   1) 앱 처음 실행 또는 온보딩 "알림 켜기" 에서 ensurePermission() 호출 → 권한 받기.
//   2) 시연 패널에서 scheduleDemoAlert() 호출 → 10초 뒤 알림이 뜨게 예약.
//   3) 사용자가 알림을 누르면 'localNotificationActionPerformed' 리스너가 extras.payload 를
//      꺼내 App 에 넘겨 그 알림 화면을 열어 준다 (앱이 꺼져 있다 깨어나도 마찬가지).
//
// 서버 전송 없음. 모든 데이터는 알림 payload 로 OS 가 보관.

import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import type { BroadcastType, TemplateVariant } from "./alerts/level"

export type NotificationPayload =
  | {
      kind: "preset"
      disasterId: string
      level: TemplateVariant
      broadcastType?: BroadcastType
      rawText?: string
      sample?: boolean
      alertId?: string
    }
  | { kind: "practice" }
  | { kind: "raw"; text: string; broadcastType: BroadcastType; sample?: boolean; alertId?: string }

const CHANNEL_ID = "chacha-alert"
const CHANNEL_SILENT_ID = "chacha-alert-silent"
const NOTIFICATION_ID = 7000

/** 권한 요청. 이미 허락됐으면 바로 성공. 거절되면 false. 웹은 브라우저 알림. */
export async function ensurePermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await LocalNotifications.checkPermissions()
      if (check.display === "granted") return true
      const req = await LocalNotifications.requestPermissions()
      return req.display === "granted"
    } catch {
      return false
    }
  }
  if (typeof Notification === "undefined") return false
  try {
    if (Notification.permission === "granted") return true
    if (Notification.permission === "denied") return false
    const result = await Notification.requestPermission()
    return result === "granted"
  } catch {
    return false
  }
}

/** 안드로이드용 알림 채널 (iOS 는 무시). 소리 있는 채널과 진동만 있는 채널. */
async function ensureChannels() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "차차 재난 알림",
      importance: 5,
      visibility: 1,
      sound: "default",
      vibration: true,
    })
    await LocalNotifications.createChannel({
      id: CHANNEL_SILENT_ID,
      name: "차차 재난 알림 (소리 없음)",
      importance: 5,
      visibility: 1,
      sound: undefined,
      vibration: true,
    })
  } catch {
    /* iOS 또는 이미 존재 */
  }
}

/**
 * 10초(기본) 뒤 로컬 알림을 예약한다.
 * payload 는 그대로 extra 에 담겨, 사용자가 알림을 눌렀을 때 App 이 꺼내 쓴다.
 */
export async function scheduleDemoAlert(
  title: string,
  body: string,
  payload: NotificationPayload,
  delaySec = 10,
  silent = false,
): Promise<boolean> {
  const ok = await ensurePermission()
  if (!ok) return false
  await ensureChannels()
  const at = new Date(Date.now() + delaySec * 1000)
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title,
          body,
          schedule: { at },
          channelId: silent ? CHANNEL_SILENT_ID : CHANNEL_ID,
          extra: { payload },
          sound: silent ? undefined : "default",
        },
      ],
    })
    return true
  } catch (err) {
    console.error("[chacha] scheduleDemoAlert 실패", err)
    return false
  }
}

/** 지금 바로 알림을 띄운다. 시연 방송처럼 앱을 열어 둔 폰에 쓴다. */
export async function showIncomingAlert(
  title: string,
  body: string,
  payload: NotificationPayload,
  silent = false,
): Promise<boolean> {
  const ok = await ensurePermission()
  if (ok) {
    await ensureChannels()
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: NOTIFICATION_ID,
            title,
            body,
            channelId: silent ? CHANNEL_SILENT_ID : CHANNEL_ID,
            extra: { payload },
            sound: silent ? undefined : "default",
          },
        ],
      })
      return true
    } catch (err) {
      console.error("[chacha] showIncomingAlert 실패", err)
    }
  }
  if (typeof Notification !== "undefined") {
    try {
      let permission = Notification.permission
      if (permission === "default") permission = await Notification.requestPermission()
      if (permission === "granted") {
        new Notification(title, { body, silent })
        return true
      }
    } catch {
      /* 웹 알림을 막은 환경 */
    }
  }
  return false
}

/**
 * 사용자가 알림을 눌렀을 때 (앱이 열려 있든 꺼져 있든) 콜백 호출.
 * App 마운트 때 한 번 등록. unsubscribe 함수를 돌려 준다.
 */
export async function onNotificationTap(
  callback: (payload: NotificationPayload) => void,
): Promise<() => void> {
  const handle = await LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (event) => {
      const payload = (event.notification.extra as { payload?: NotificationPayload } | undefined)
        ?.payload
      if (payload) callback(payload)
    },
  )
  return () => {
    handle.remove().catch(() => {})
  }
}
