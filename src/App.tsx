// 차차 앱의 꼭대기. 화면 전환 상태 + 사용자 프로필 + "지금 보여줄 알림" 을 들고 있다.
//
// 바깥 틀 (.prototype-stage > .iphone-frame) 안에
//   - 가짜 StatusBar (노트북 미리보기용)
//   - 지금 화면 (screen-transition 안)
//   - 보여야 하는 화면이면 하단 탭
//   - 가짜 홈 인디케이터 (노트북 미리보기용)
//   - 올라오는 바텀시트 / 시연 패널
// 를 쌓는다.

import { useEffect, useMemo, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"
import {
  StatusBar as NativeStatusBar,
  Style as NativeStatusBarStyle,
} from "@capacitor/status-bar"

import { DemoPanel } from "./components/DemoPanel"
import { ProtoSheet, type CallTarget } from "./components/ProtoSheet"
import { ProtoTabs } from "./components/ProtoTabs"
import { StatusBar } from "./components/StatusBar"
import { CallChoice } from "./screens/CallChoice"
import { HelpScreen } from "./screens/HelpScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { LockScreen } from "./screens/LockScreen"
import { OnboardingFlow } from "./screens/OnboardingFlow"
import { PdfScreen } from "./screens/PdfScreen"
import { PrepScreen } from "./screens/PrepScreen"
import { ProtoAlert } from "./screens/ProtoAlert"
import { ProtoCard } from "./screens/ProtoCard"
import { SafetyCheck } from "./screens/SafetyCheck"
import {
  emptyProfile,
  isProfileReady,
  loadProfile,
  saveProfile,
  type Profile,
} from "./data/profile"
import { getAlertView, rawTextView, type AlertView } from "./data/alertTemplate"
import { useDevice } from "./device/DeviceContext"
import { onNotificationTap, type NotificationPayload } from "./notifications"
import type { ActiveTab, AppScreen, SheetKind } from "./types"

const TAB_SCREENS: AppScreen[] = ["home", "help", "prep", "card"]
const SAFETY_COMPLETE_KEY = "chacha-safety-complete"

/** 지금 열려 있는 알림. null 이면 알림 화면 자체가 안 보임. */
type AlertState =
  | { kind: "preset"; disasterId: string; level: "caution" | "evacuate" }
  | { kind: "practice" }
  | { kind: "raw"; text: string }

/** 승격·무시 규칙용 우선순위.
 *  2 = 대피(H/위험), 1 = 주의(L/caution·raw), 0 = 없음/연습.
 *  규칙: 더 높은 우선순위면 교체, 같거나 낮으면 유지. */
function statePriority(s: AlertState | null): number {
  if (!s) return 0
  if (s.kind === "preset") return s.level === "evacuate" ? 2 : 1
  if (s.kind === "raw") return 1
  return 0 // practice
}
function payloadPriority(p: NotificationPayload): number {
  if (p.kind === "preset") return p.level === "evacuate" ? 2 : 1
  if (p.kind === "raw") return 1
  return 0 // practice
}
function payloadToState(p: NotificationPayload): AlertState {
  if (p.kind === "preset")
    return { kind: "preset", disasterId: p.disasterId, level: p.level }
  if (p.kind === "practice") return { kind: "practice" }
  return { kind: "raw", text: p.text }
}

function App() {
  // 차차등 BLE 연결 상태/조작
  const device = useDevice()

  // 저장된 프로필 로드가 끝날 때까지는 아무 것도 안 그린다 (깜빡임 방지).
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<Profile>(emptyProfile)

  // 지금 화면
  const [screen, setScreen] = useState<AppScreen>("onboarding")
  const [onboardStep, setOnboardStep] = useState(0)
  const [sheet, setSheet] = useState<SheetKind>(null)
  const [tab, setTab] = useState<ActiveTab>("home")

  // 홈 화면 상태
  const [danger, setDanger] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  // 알림 / 도움 상황 / 전화할 대상
  const [alertState, setAlertState] = useState<AlertState | null>(null)
  const [situation, setSituation] = useState("무서운 사람이 있어요")
  const [callTarget, setCallTarget] = useState<CallTarget | null>(null)

  const [safetyComplete, setSafetyComplete] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  // --- 앱 열 때 한 번: 프로필과 안전점검 완료 플래그 복원 ---
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [loaded, safetyFlag] = await Promise.all([
        loadProfile(),
        Preferences.get({ key: SAFETY_COMPLETE_KEY }),
      ])
      if (cancelled) return
      setProfile(loaded)
      setSafetyComplete(safetyFlag.value === "true")
      // 저장된 프로필이 있으면 온보딩 건너뛰고 홈으로.
      if (isProfileReady(loaded)) {
        setScreen("home")
        setTab("home")
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // --- 로컬 알림 탭 처리: OS 알림을 누르면 그 알림 화면으로 이동 ---
  // 승격·무시 규칙:
  //   - 열린 알림이 더 높은(또는 같은) 레벨이면 유지. (예: H 보는 중 L 탭 → 무시)
  //   - 열린 알림보다 새 알림이 더 높으면 교체. (예: L 보는 중 H 탭 → H로 바뀜)
  //   - 열린 알림이 없으면 그냥 새 알림을 연다.
  useEffect(() => {
    let unsub: (() => void) | null = null
    onNotificationTap((payload: NotificationPayload) => {
      let changed = true
      setAlertState((prev) => {
        const cur = statePriority(prev)
        const next = payloadPriority(payload)
        if (cur > 0 && cur >= next) {
          changed = false
          return prev // 유지 (무시)
        }
        return payloadToState(payload) // 교체 (승격 또는 신규)
      })
      // 유지로 결정된 경우: 이미 알림 화면에 있을 테니 아무 것도 바꾸지 않음.
      if (changed) {
        setScreen("alert")
        setDemoOpen(false)
        setSheet(null)
      }
    })
      .then((fn) => {
        unsub = fn
      })
      .catch(() => {})
    return () => {
      unsub?.()
    }
  }, [])

  // 프로필 수정: 로컬 상태 바꾸고 바로 저장.
  const updateProfile = (patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      saveProfile(next)
      return next
    })
  }

  const markSafetyComplete = () => {
    setSafetyComplete(true)
    Preferences.set({ key: SAFETY_COMPLETE_KEY, value: "true" }).catch(() => {})
  }

  // --- 작은 네비게이션 헬퍼 ---
  const goHome = () => {
    setScreen("home")
    setTab("home")
  }
  const openCall = (target: CallTarget) => {
    setCallTarget(target)
    setSheet("call")
  }
  const setActiveTab = (nextTab: ActiveTab) => {
    setTab(nextTab)
    setScreen(nextTab === "home" ? "home" : nextTab === "help" ? "help" : nextTab === "prep" ? "prep" : "card")
  }

  // 기본 전화 대상 (알림 안에서 "전화하기" 눌렀을 때)
  const defaultCallTarget = (): CallTarget =>
    profile.guardian.phone
      ? {
          label: profile.guardian.relation || profile.guardian.name || "도와줄 사람",
          phone: profile.guardian.phone,
          description: profile.guardian.name
            ? `${profile.guardian.name}에게 전화해요.`
            : "내 카드에 적은 사람이에요.",
        }
      : { label: "119", phone: "119", description: "구해 주는 곳이에요." }

  // 지금 alertState → 보여줄 AlertView 로 계산
  const alertView: AlertView | null = useMemo(() => {
    if (!alertState) return null
    if (alertState.kind === "preset") {
      return getAlertView(alertState.disasterId, alertState.level, profile)
    }
    if (alertState.kind === "practice") {
      return getAlertView("practice", "caution", profile)
    }
    return rawTextView(alertState.text)
  }, [alertState, profile])

  // "알았어요" 공통 처리 — 기기에 C 보내고 화면 정리.
  const acknowledgeAlert = () => {
    device.send("C").catch(() => {})
    if (alertState?.kind === "practice") {
      setOnboardStep(12)
      setAlertState(null)
      setScreen("onboarding")
    } else {
      setAcknowledged(true)
      setDanger(false)
      setAlertState(null)
      goHome()
    }
  }

  // 알림 화면이 열릴 때 기기에 신호 보내기: evacuate→H, caution→L, practice→(안 보냄).
  useEffect(() => {
    if (screen !== "alert" || !alertView) return
    if (alertState?.kind === "practice") return
    if (alertView.uiLevel === "danger") device.send("H").catch(() => {})
    else if (alertView.uiLevel === "caution") device.send("L").catch(() => {})
  }, [screen, alertView, alertState, device])

  // 하드웨어 버튼으로 확인했을 때(기기→앱 C): 알림 화면이 열려 있으면 "알았어요" 처리.
  useEffect(() => {
    return device.onButton(() => {
      if (screen === "alert" && alertState) acknowledgeAlert()
    })
    // acknowledgeAlert 는 매 렌더마다 새로 만들어지지만, device.onButton 은 안정적 참조.
    // 리스너 자체는 항상 "최신 state" 를 참조하도록 effect 를 매번 새로 등록한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, alertState, device])

  // --- 화면 선택 ---
  const content =
    screen === "onboarding" ? (
      <OnboardingFlow
        step={onboardStep}
        setStep={setOnboardStep}
        openSheet={setSheet}
        openPdf={() => setScreen("pdf")}
        openPractice={() => {
          setAlertState({ kind: "practice" })
          setScreen("alert")
        }}
        finish={goHome}
        startSafety={() => setScreen("safety")}
        profile={profile}
        updateProfile={updateProfile}
      />
    ) : screen === "safety" ? (
      <SafetyCheck
        back={() => setActiveTab("prep")}
        home={goHome}
        onComplete={markSafetyComplete}
        profile={profile}
      />
    ) : screen === "lock" ? (
      // LockScreen 은 노트북 미리보기용. 메인 네비 어디에서도 열지 않음.
      <LockScreen
        openAlert={() => {
          setAlertState({ kind: "preset", disasterId: "heavy_rain", level: "evacuate" })
          setScreen("alert")
        }}
      />
    ) : screen === "alert" && alertView ? (
      <ProtoAlert
        view={alertView}
        acknowledge={acknowledgeAlert}
        call={() => openCall(defaultCallTarget())}
        source={() => setSheet("source")}
      />
    ) : screen === "help" ? (
      <HelpScreen
        choose={(value) => {
          setSituation(value)
          setScreen("call-choice")
        }}
      />
    ) : screen === "call-choice" ? (
      <CallChoice
        situation={situation}
        back={() => setScreen("help")}
        call={openCall}
        profile={profile}
      />
    ) : screen === "prep" ? (
      <PrepScreen
        goCard={() => setActiveTab("card")}
        startSafety={() => setScreen("safety")}
        safetyComplete={safetyComplete}
      />
    ) : screen === "card" ? (
      <ProtoCard
        openPdf={() => setScreen("pdf")}
        call={openCall}
        edit={() => {
          setOnboardStep(3)
          setScreen("onboarding")
        }}
        profile={profile}
      />
    ) : screen === "pdf" ? (
      <PdfScreen back={() => setActiveTab("card")} profile={profile} />
    ) : (
      <HomeScreen
        danger={danger}
        acknowledged={acknowledged}
        openAlert={() => {
          setAlertState({ kind: "preset", disasterId: "heavy_rain", level: "evacuate" })
          setScreen("alert")
        }}
        goCard={() => setActiveTab("card")}
        goHelp={() => setActiveTab("help")}
        goPrep={() => setActiveTab("prep")}
        profile={profile}
        openDemo={() => setDemoOpen(true)}
      />
    )

  const showTabs = TAB_SCREENS.includes(screen)

  // 잠금화면·빨간 알림 화면은 배경이 어둡다 → 상태바 글자를 흰색으로.
  const lightStatusBar =
    screen === "lock" || (screen === "alert" && (alertView?.uiLevel ?? "caution") === "danger")

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    NativeStatusBar.setStyle({
      style: lightStatusBar ? NativeStatusBarStyle.Dark : NativeStatusBarStyle.Light,
    }).catch(() => {})
  }, [lightStatusBar])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    NativeStatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
  }, [])

  if (!ready) {
    return <div className="prototype-stage" />
  }

  const alertKey =
    alertState?.kind === "preset"
      ? `${alertState.disasterId}-${alertState.level}`
      : alertState?.kind ?? "none"

  return (
    <div className="prototype-stage">
      <div className="iphone-frame">
        <StatusBar light={lightStatusBar} />
        <div className="screen-transition" key={`${screen}-${onboardStep}-${alertKey}`}>
          {content}
        </div>
        {showTabs && <ProtoTabs active={tab} setActive={setActiveTab} />}
        <span className="home-indicator" />
        <ProtoSheet
          kind={sheet}
          close={() => setSheet(null)}
          next={() => {
            setSheet(null)
            setOnboardStep(5)
          }}
          callTarget={callTarget}
        />
        {demoOpen && <DemoPanel profile={profile} close={() => setDemoOpen(false)} />}
      </div>
    </div>
  )
}

export default App
