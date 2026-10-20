// 차차등 BLE 연결 — @capacitor-community/bluetooth-le 를 감싸는 얇은 레이어.
//
// 아이폰/안드로이드/웹(Bluefy 포함) 전부 같은 코드로 동작한다.
// 상태는 subscribeStatus()/subscribeButton() 로 받고,
// 명령은 send("H"|"L"|"C") 로 보낸다.
//
// 저장:
//   - 저장된 deviceId 는 다음 실행 때 자동 재연결에 사용 (Preferences).
//   - 저장 외 서버 전송 없음.
//
// 펌웨어(docs/chachadeung.ino) 의 NUS UUID 와 반드시 일치해야 함.

import { BleClient, numbersToDataView, type BleDevice } from "@capacitor-community/bluetooth-le"
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"

const DEVICE_NAME = "chachadeung"

// Nordic UART Service — 펌웨어와 동일한 UUID (소문자 사용).
const NUS_SVC = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
const NUS_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // app → device (write)
const NUS_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // device → app (notify)

const SAVED_DEVICE_KEY = "chacha-device-id-v1"
const SCAN_TIMEOUT_MS = 10_000

export type DeviceStatus =
  | "disconnected" // 끊김
  | "scanning" // 스캔 중
  | "connecting" // 연결 시도 중
  | "connected" // 연결됨
  | "unsupported" // 플랫폼 미지원 (예: Safari)

export type DeviceState = {
  status: DeviceStatus
  deviceId: string | null
  deviceName: string | null
  /** 마지막 오류 메시지 (사용자에게 보여줄 때). */
  errorMessage: string | null
}

type StatusListener = (state: DeviceState) => void
type ButtonListener = () => void

let state: DeviceState = {
  status: "disconnected",
  deviceId: null,
  deviceName: null,
  errorMessage: null,
}
const statusListeners = new Set<StatusListener>()
const buttonListeners = new Set<ButtonListener>()
let initPromise: Promise<void> | null = null

function setState(patch: Partial<DeviceState>) {
  state = { ...state, ...patch }
  for (const l of statusListeners) l(state)
}

export function getState(): DeviceState {
  return state
}

export function subscribeStatus(listener: StatusListener): () => void {
  statusListeners.add(listener)
  listener(state)
  return () => statusListeners.delete(listener)
}

/** 차차등 하드웨어 버튼이 눌렸을 때(기기→앱 'C') 호출. */
export function subscribeButton(listener: ButtonListener): () => void {
  buttonListeners.add(listener)
  return () => buttonListeners.delete(listener)
}

/** BleClient 초기화. 한 번만 실행. */
async function ensureInitialized(): Promise<boolean> {
  if (initPromise) {
    try {
      await initPromise
      return state.status !== "unsupported"
    } catch {
      return false
    }
  }
  initPromise = (async () => {
    try {
      await BleClient.initialize({ androidNeverForLocation: true })
    } catch (err) {
      // 웹에서 Web Bluetooth 미지원 Safari 같은 경우. 조용히 disconnected 로.
      console.warn("[chachadeung] BleClient.initialize 실패", err)
      setState({ status: "unsupported", errorMessage: null })
      throw err
    }
  })()
  try {
    await initPromise
    return true
  } catch {
    return false
  }
}

async function saveDeviceId(id: string) {
  await Preferences.set({ key: SAVED_DEVICE_KEY, value: id }).catch(() => {})
}
async function loadDeviceId(): Promise<string | null> {
  const r = await Preferences.get({ key: SAVED_DEVICE_KEY }).catch(() => ({ value: null }))
  return r.value || null
}
async function clearDeviceId() {
  await Preferences.remove({ key: SAVED_DEVICE_KEY }).catch(() => {})
}

/** 연결 공통 처리: notify 구독 + 저장 + 상태 갱신. 실패하면 throw. */
async function attachToDevice(device: { deviceId: string; name?: string | null }) {
  const name = device.name ?? DEVICE_NAME

  setState({ status: "connecting", errorMessage: null })

  await BleClient.connect(device.deviceId, () => {
    // 끊김 콜백 — OS 가 원격에서 끊었거나 범위 벗어남.
    setState({ status: "disconnected", errorMessage: null })
  })

  // TX notify 구독: 기기가 "C" 를 보내면 알림을 끈다.
  await BleClient.startNotifications(device.deviceId, NUS_SVC, NUS_TX, (value) => {
    const first = value.getUint8(0)
    const ch = String.fromCharCode(first)
    if (ch === "C" || ch === "c") {
      for (const l of buttonListeners) l()
    }
  })

  await saveDeviceId(device.deviceId)
  setState({
    status: "connected",
    deviceId: device.deviceId,
    deviceName: name,
    errorMessage: null,
  })
}

/**
 * 저장된 기기가 있으면 바로 재연결 시도. 없으면 아무것도 안 함.
 * 앱 시작 때 한 번 호출. 실패해도 UX 영향 없게 조용히.
 */
export async function autoReconnect(): Promise<void> {
  if (!(await ensureInitialized())) return
  const savedId = await loadDeviceId()
  if (!savedId) return
  try {
    await attachToDevice({ deviceId: savedId, name: DEVICE_NAME })
  } catch (err) {
    console.warn("[chachadeung] 자동 재연결 실패", err)
    setState({ status: "disconnected", errorMessage: null })
  }
}

/**
 * 사용자 액션으로 스캔→연결. 온보딩 10단계와 "다시 연결" 버튼에서 쓴다.
 * 성공하면 자동으로 상태가 'connected' 가 되고 다음 실행 때 자동 재연결됨.
 */
export async function connect(): Promise<void> {
  if (!(await ensureInitialized())) {
    setState({
      status: "unsupported",
      errorMessage: "이 기기에선 블루투스를 쓸 수 없어요.",
    })
    throw new Error("BLE unsupported")
  }

  // 이미 연결돼 있으면 다시 시도 안 함.
  if (state.status === "connected") return

  setState({ status: "scanning", errorMessage: null })

  let found: BleDevice | null = null
  try {
    if (Capacitor.getPlatform() === "web") {
      // 웹(Chrome/Bluefy)은 requestDevice 로 OS 선택기를 띄움 — 사용자가 직접 고름.
      found = await BleClient.requestDevice({
        name: DEVICE_NAME,
        services: [NUS_SVC],
        optionalServices: [NUS_SVC],
      })
    } else {
      // iOS/Android 네이티브: 자동 스캔으로 chachadeung 를 찾는다.
      found = await new Promise<BleDevice | null>((resolve, reject) => {
        let resolved = false
        const timer = setTimeout(async () => {
          if (resolved) return
          resolved = true
          try {
            await BleClient.stopLEScan()
          } catch {}
          resolve(null)
        }, SCAN_TIMEOUT_MS)

        BleClient.requestLEScan(
          { services: [NUS_SVC], name: DEVICE_NAME, allowDuplicates: false },
          async (result) => {
            if (resolved) return
            if (result.device.name === DEVICE_NAME || result.localName === DEVICE_NAME) {
              resolved = true
              clearTimeout(timer)
              try {
                await BleClient.stopLEScan()
              } catch {}
              resolve(result.device)
            }
          },
        ).catch((err) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timer)
            reject(err)
          }
        })
      })
    }
  } catch (err) {
    const message = (err as Error)?.message ?? "스캔 중 오류"
    setState({ status: "disconnected", errorMessage: message })
    throw err
  }

  if (!found) {
    setState({ status: "disconnected", errorMessage: "차차등을 찾지 못했어요." })
    throw new Error("device not found")
  }

  try {
    await attachToDevice(found)
  } catch (err) {
    const message = (err as Error)?.message ?? "연결 실패"
    setState({ status: "disconnected", errorMessage: message })
    throw err
  }
}

/** 끊고 저장된 기기 id 지우기 (사용자가 "연결 끊기" 눌렀을 때). */
export async function disconnect(): Promise<void> {
  const id = state.deviceId
  if (!id) {
    setState({ status: "disconnected" })
    return
  }
  try {
    await BleClient.stopNotifications(id, NUS_SVC, NUS_TX).catch(() => {})
    await BleClient.disconnect(id)
  } catch {
    /* ignore */
  }
  await clearDeviceId()
  setState({ status: "disconnected", deviceId: null, deviceName: null })
}

/**
 * 명령 전송 — "H" / "L" / "C". 뒤에 "\n" 를 붙여서 펌웨어가 글자 단위로 받기 좋게 함.
 * 연결 안 돼 있으면 조용히 리턴 (예: 사용자가 차차등 없이도 앱을 쓸 수 있음).
 */
export async function send(cmd: "H" | "L" | "C"): Promise<void> {
  if (state.status !== "connected" || !state.deviceId) return
  try {
    const bytes = [cmd.charCodeAt(0), "\n".charCodeAt(0)]
    await BleClient.writeWithoutResponse(
      state.deviceId,
      NUS_SVC,
      NUS_RX,
      numbersToDataView(bytes),
    )
  } catch (err) {
    console.warn("[chachadeung] send 실패", cmd, err)
  }
}
