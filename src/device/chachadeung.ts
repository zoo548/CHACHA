// 차차등 BLE 연결 — @capacitor-community/bluetooth-le 를 감싸는 얇은 레이어.
//
// 아이폰/안드로이드/웹(Bluefy 포함) 전부 같은 코드로 동작한다.
// 상태는 subscribeStatus()/subscribeButton() 로 받고,
// 명령은 send("H"|"L"|"I"|"R"|"C"|"F"|"M"|"Q"|"N") 로 보낸다.
//
// 저장:
//   - 저장된 deviceId 는 다음 실행 때 자동 재연결에 사용 (Preferences).
//   - 저장 외 서버 전송 없음.
//
// 펌웨어(docs/chachadeung.ino) 의 NUS UUID 와 반드시 일치해야 함.

import { BleClient, numbersToDataView, type BleDevice } from "@capacitor-community/bluetooth-le"
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"
import type { DeviceSignal } from "../alerts/level"

const DEVICE_NAME = "chachadeung"

// Nordic UART Service — 펌웨어와 동일한 UUID (소문자 사용).
const NUS_SVC = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
const NUS_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // app → device (write)
const NUS_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // device → app (notify)

const SAVED_DEVICE_KEY = "chacha-device-id-v1"
const SCAN_TIMEOUT_MS = 10_000
const REMEMBERED_CONNECT_MS = 3_000

const PICKER_OPTIONS = {
  name: DEVICE_NAME,
  services: [NUS_SVC],
  optionalServices: [NUS_SVC],
}

/** 아이폰 사파리처럼 Web Bluetooth 가 없을 때. */
export const BLE_UNSUPPORTED_MESSAGE =
  "이 브라우저에서는 차차등을 연결할 수 없어요. 안드로이드 크롬이나 Bluefy 앱으로 열어 주세요."

/** 연결 실패 때 홈 버튼 아래 짧은 안내. */
export const BLE_RETRY_MESSAGE = "차차등 전원을 켜고 다시 눌러 주세요"

/** 기억한 기기 재연결이 실패한 다음 탭에서는 선택 창을 바로 연다. */
let skipRememberedOnce = false

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
async function attachToDevice(
  device: { deviceId: string; name?: string | null },
  timeoutMs?: number,
) {
  const name = device.name ?? DEVICE_NAME

  setState({ status: "connecting", errorMessage: null })

  await BleClient.connect(
    device.deviceId,
    () => {
      // 끊김 콜백 — OS 가 원격에서 끊었거나 범위 벗어남.
      setState({ status: "disconnected", errorMessage: null })
    },
    timeoutMs ? { timeout: timeoutMs } : undefined,
  )

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
 * 예전에 허용·저장한 차차등. 웹은 getDevices()(Web Bluetooth)로 맵에 올린 뒤에만 연결할 수 있다.
 * getDevices 가 없는 브라우저는 조용히 다음 단계로.
 */
async function findRememberedDevice(): Promise<BleDevice | null> {
  const savedId = await loadDeviceId()
  try {
    if (savedId) {
      const permitted = await BleClient.getDevices([savedId])
      const hit = permitted.find((device) => device.deviceId === savedId)
      if (hit) return hit
    }
  } catch {
    /* getDevices 미지원 */
  }
  try {
    const live = await BleClient.getConnectedDevices([NUS_SVC])
    const hit =
      live.find((device) => device.name === DEVICE_NAME || (savedId && device.deviceId === savedId)) ??
      live[0]
    if (hit) return hit
  } catch {
    /* getConnectedDevices 미지원 */
  }
  if (savedId && Capacitor.getPlatform() !== "web") {
    return { deviceId: savedId, name: DEVICE_NAME }
  }
  return null
}

async function pickNewDevice(): Promise<BleDevice | null> {
  if (Capacitor.getPlatform() === "web") {
    // 클릭 이벤트 안에서 바로 호출해야 브라우저 선택 창이 열린다.
    return BleClient.requestDevice(PICKER_OPTIONS)
  }

  return new Promise<BleDevice | null>((resolve, reject) => {
    let resolved = false
    const timer = setTimeout(async () => {
      if (resolved) return
      resolved = true
      try {
        await BleClient.stopLEScan()
      } catch {
        /* ignore */
      }
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
          } catch {
            /* ignore */
          }
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

function failConnect(err?: unknown): never {
  console.warn("[chachadeung] 연결 실패", err)
  setState({ status: "disconnected", errorMessage: BLE_RETRY_MESSAGE })
  throw new Error("device connect failed")
}

/**
 * 저장된 기기가 있으면 바로 재연결 시도. 없으면 아무것도 안 함.
 * 앱 시작 때 한 번 호출. 실패해도 UX 영향 없게 조용히.
 */
export async function autoReconnect(): Promise<void> {
  if (!(await ensureInitialized())) return
  const remembered = await findRememberedDevice()
  if (!remembered) return
  try {
    await attachToDevice(remembered)
  } catch (err) {
    console.warn("[chachadeung] 자동 재연결 실패", err)
    setState({ status: "disconnected", errorMessage: null })
  }
}

/**
 * 사용자 액션으로 연결. 홈 "차차등 연결하기"와 온보딩에서 쓴다.
 * 선택 창(requestDevice)은 클릭 핸들러가 부른 이 함수 안에서 바로 연다.
 */
export async function connect(): Promise<void> {
  if (state.status === "connected") return
  if (state.status === "scanning" || state.status === "connecting") return

  if (!(await ensureInitialized())) {
    setState({
      status: "unsupported",
      errorMessage: BLE_UNSUPPORTED_MESSAGE,
    })
    return
  }

  const tryRemembered = !skipRememberedOnce
  skipRememberedOnce = false

  if (tryRemembered) {
    const remembered = await findRememberedDevice()
    if (remembered) {
      try {
        await attachToDevice(remembered, REMEMBERED_CONNECT_MS)
        skipRememberedOnce = false
        return
      } catch (err) {
        console.warn("[chachadeung] 기억한 기기 재연결 실패", err)
        skipRememberedOnce = true
        // 같은 클릭에서 선택 창을 이어서 연다. 제스처가 끊기면 다음 탭에서 연다.
      }
    }
  }

  setState({ status: "scanning", errorMessage: null })

  let found: BleDevice | null = null
  try {
    found = await pickNewDevice()
  } catch (err) {
    failConnect(err)
  }

  if (!found) failConnect()

  try {
    await attachToDevice(found)
    skipRememberedOnce = false
  } catch (err) {
    failConnect(err)
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
 * 명령 전송 — "H" / "L" / "I" / "R" / "C" / "F" / "M" / "Q" / "N". 뒤에 "\n" 를 붙여서 펌웨어가 글자 단위로 받기 좋게 함.
 * 연결 안 돼 있으면 조용히 리턴 (예: 사용자가 차차등 없이도 앱을 쓸 수 있음).
 */
export async function send(cmd: DeviceSignal): Promise<void> {
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
