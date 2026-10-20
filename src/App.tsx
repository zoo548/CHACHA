// 차차 앱의 꼭대기. 화면 전환 상태 + 사용자 프로필을 들고 있고, 각 화면/위젯은 전부 다른 파일.
//
// 바깥 틀 (.prototype-stage > .iphone-frame) 안에
//   - 가짜 StatusBar (노트북 미리보기용)
//   - 지금 화면 (screen-transition 안)
//   - 보여야 하는 화면이면 하단 탭
//   - 가짜 홈 인디케이터 (노트북 미리보기용)
//   - 올라오는 바텀시트
// 를 쌓는다. StatusBar / home-indicator / iphone-frame 테두리는 폭 ≤600px (실제
// 휴대폰 또는 네이티브 앱) 에서 index.css 가 숨긴다 — 거기선 OS 가 진짜 상태바와
// 홈 인디케이터를 그려 주니까.

import { useEffect, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"
import {
  StatusBar as NativeStatusBar,
  Style as NativeStatusBarStyle,
} from "@capacitor/status-bar"

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
import type { ActiveTab, AppScreen, Disaster, SheetKind } from "./types"

const TAB_SCREENS: AppScreen[] = ["home", "help", "prep", "card"]
const SAFETY_COMPLETE_KEY = "chacha-safety-complete"

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

  // 알림 종류 / 도움 상황 / 전화할 대상
  const [alertType, setAlertType] = useState<Disaster>("rain")
  const [situation, setSituation] = useState("무서운 사람이 있어요")
  const [callTarget, setCallTarget] = useState<CallTarget | null>(null)

  const [safetyComplete, setSafetyComplete] = useState(false)

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

  // 프로필 수정: 로컬 상태 바꾸고 바로 저장 (await 하지 않아도 UI 는 즉시 반영).
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

  // 알림 화면 등에서 쓸 "기본 전화 대상" — 보호자가 있으면 보호자, 없으면 119.
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

  // --- 화면 선택 ---
  const content =
    screen === "onboarding" ? (
      <OnboardingFlow
        step={onboardStep}
        setStep={setOnboardStep}
        openSheet={setSheet}
        openPdf={() => setScreen("pdf")}
        openPractice={() => {
          setAlertType("practice")
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
      <LockScreen
        openAlert={() => {
          setAlertType("rain")
          setScreen("alert")
        }}
      />
    ) : screen === "alert" ? (
      <ProtoAlert
        type={alertType}
        acknowledge={() => {
          if (alertType === "practice") {
            setOnboardStep(12)
            setScreen("onboarding")
          } else {
            setAcknowledged(true)
            setDanger(false)
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
          setAlertType("rain")
          setScreen("alert")
        }}
        goCard={() => setActiveTab("card")}
        goHelp={() => setActiveTab("help")}
        goPrep={() => setActiveTab("prep")}
        profile={profile}
      />
    )

  const showTabs = TAB_SCREENS.includes(screen)

  // 잠금화면·빨간 알림 화면은 배경이 어둡다 → 상태바 글자를 흰색으로.
  // 그 외 화면은 밝은 배경 → 상태바 글자를 검은색으로.
  const lightStatusBar = screen === "lock" || (screen === "alert" && alertType !== "heat")

  // 네이티브(iOS/Android) 에서만 진짜 상태바 스타일을 바꾼다. 웹에서는 조용히 무시.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    NativeStatusBar.setStyle({
      style: lightStatusBar ? NativeStatusBarStyle.Dark : NativeStatusBarStyle.Light,
    }).catch(() => {})
  }, [lightStatusBar])

  // 안드로이드에서는 상태바를 WebView 위에 겹치게 둬서 edge-to-edge 유지
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    NativeStatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
  }, [])

  // 프로필 로드 전엔 아무것도 안 그린다.
  if (!ready) {
    return <div className="prototype-stage" />
  }

  return (
    <div className="prototype-stage">
      <div className="iphone-frame">
        {/* 노트북 미리보기 전용 가짜 chrome — 폭 ≤600px 에서는 CSS 로 숨겨진다 */}
        <StatusBar light={lightStatusBar} />
        <div className="screen-transition" key={`${screen}-${onboardStep}-${alertType}`}>
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
      </div>
    </div>
  )
}

export default App
