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
import { onNotificationTap, type NotificationPayload } from "./notifications"
import type { ActiveTab, AppScreen, SheetKind } from "./types"

const TAB_SCREENS: AppScreen[] = ["home", "help", "prep", "card"]
const SAFETY_COMPLETE_KEY = "chacha-safety-complete"

/** 지금 열려 있는 알림. null 이면 알림 화면 자체가 안 보임. */
type AlertState =
  | { kind: "preset"; disasterId: string; level: "caution" | "evacuate" }
  | { kind: "practice" }
  | { kind: "raw"; text: string }

function App() {
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

  // --- 로컬 알림 탭 처리: OS 알림을 누르면 그 알림 화면으로 바로 이동 ---
  useEffect(() => {
    let unsub: (() => void) | null = null
    onNotificationTap((payload: NotificationPayload) => {
      // 알림을 눌렀을 때. 알림 종류에 따라 화면 전환.
      if (payload.kind === "preset") {
        setAlertState({ kind: "preset", disasterId: payload.disasterId, level: payload.level })
      } else if (payload.kind === "practice") {
        setAlertState({ kind: "practice" })
      } else {
        setAlertState({ kind: "raw", text: payload.text })
      }
      setScreen("alert")
      setDemoOpen(false)
      setSheet(null)
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
        acknowledge={() => {
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
        }}
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
