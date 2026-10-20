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

export type NotificationPayload =
  | { kind: "preset"; disasterId: string; level: "caution" | "evacuate" }
  | { kind: "practice" }
  | { kind: "raw"; text: string; broadcastType: "위급" | "긴급" | "안전안내" }

const CHANNEL_ID = "chacha-alert"
const NOTIFICATION_ID = 7000

/** 권한 요청. 이미 허락됐으면 바로 성공. 거절되면 false. */
export async function ensurePermission(): Promise<boolean> {
  try {
    const check = await LocalNotifications.checkPermissions()
    if (check.display === "granted") return true
    const req = await LocalNotifications.requestPermissions()
    return req.display === "granted"
  } catch {
    return false
  }
}

/** 안드로이드용 알림 채널 (iOS 는 무시). 처음 한 번 만들어 두면 재사용. */
async function ensureChannel() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "차차 재난 알림",
      importance: 5, // 최고 우선순위 — 잠금화면 표시
      visibility: 1, // 공개
      sound: "default",
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
): Promise<boolean> {
  const ok = await ensurePermission()
  if (!ok) return false
  await ensureChannel()
  const at = new Date(Date.now() + delaySec * 1000)
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title,
          body,
          schedule: { at },
          channelId: CHANNEL_ID,
          extra: { payload },
          // iOS: 잠금화면 표시 + 소리
          sound: "default",
        },
      ],
    })
    return true
  } catch (err) {
    console.error("[chacha] scheduleDemoAlert 실패", err)
    return false
  }
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
