// 차차등 연결 상태를 React 트리에 공유.
// - App 가장 바깥에서 <DeviceProvider> 로 감싸면
// - 아무 컴포넌트에서나 useDevice() 로 상태 + 조작 함수 사용 가능.
//
// 자동 재연결은 Provider 마운트 때 한 번 시도 (저장된 deviceId 있을 때만).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  autoReconnect,
  connect as deviceConnect,
  disconnect as deviceDisconnect,
  getState,
  send as deviceSend,
  subscribeButton,
  subscribeStatus,
  type DeviceState,
} from "./chachadeung"

type DeviceContextValue = {
  state: DeviceState
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  send: (cmd: "H" | "L" | "C") => Promise<void>
  /** 하드웨어 버튼이 눌렸을 때 호출될 콜백 등록. 반환값으로 해지. */
  onButton: (callback: () => void) => () => void
}

const DeviceContext = createContext<DeviceContextValue | null>(null)

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeviceState>(getState())
  const buttonHandlersRef = useRef<Set<() => void>>(new Set())

  useEffect(() => {
    const unsub = subscribeStatus(setState)
    // 저장된 기기가 있으면 자동 재연결. 없으면 조용히 리턴.
    autoReconnect().catch(() => {})
    return unsub
  }, [])

  // 하드웨어 버튼 이벤트를 현재 등록된 모든 리스너에게 전달.
  useEffect(() => {
    return subscribeButton(() => {
      for (const h of buttonHandlersRef.current) h()
    })
  }, [])

  const onButton = useCallback((callback: () => void) => {
    buttonHandlersRef.current.add(callback)
    return () => {
      buttonHandlersRef.current.delete(callback)
    }
  }, [])

  // state 가 바뀔 때만 새 value 를 만든다 → 소비자 useEffect 가 불필요하게 재실행되지 않음.
  const value = useMemo<DeviceContextValue>(
    () => ({
      state,
      connect: deviceConnect,
      disconnect: deviceDisconnect,
      send: deviceSend,
      onButton,
    }),
    [state, onButton],
  )

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext)
  if (!ctx) throw new Error("useDevice must be used inside <DeviceProvider>")
  return ctx
}
