// 홈 화면. 지금 알림(위험이 있으면 빨간 카드, 없으면 조용한 카드) + 내 카드 바로가기 + 지난 알림.
// 상단 로고를 2초 안에 5번 누르면 시연 패널이 열린다 (openDemo 호출).

import { useState } from "react"
import { Icon } from "../components/Icon"
import { Logo } from "../components/Logo"
import { ProtoButton } from "../components/ProtoButton"
import { ProtoRow } from "../components/ProtoRow"
import { DEMO_INVITE_LABEL } from "../demo/audience"
import type { Profile } from "../data/profile"
import { useDevice } from "../device/DeviceContext"

function HomeDeviceBadge() {
  const { state, connect } = useDevice()
  const busy = state.status === "scanning" || state.status === "connecting"

  const onReconnect = () => {
    if (state.status === "connected" || busy) return
    // requestDevice 는 클릭 안에서 바로 호출해야 브라우저 선택 창이 열린다.
    connect().catch(() => {})
  }

  if (state.status === "connected") {
    return (
      <span className="device-badge connected">
        <i className="device-badge-dot" />
        차차등 연결됨
      </span>
    )
  }
  if (busy) {
    return <span className="device-badge connecting">연결 중…</span>
  }
  return (
    <button type="button" className="device-badge disconnected" onClick={onReconnect}>
      <Icon name="bluetooth" />
      차차등 연결하기
    </button>
  )
}

export function HomeScreen({
  danger,
  acknowledged,
  openAlert,
  goCard,
  goHelp,
  goPrep,
  profile,
  openDemo,
  lastCheckedLabel,
  demoBanner,
  locationLabel,
  openRegionPick,
  onDemoInvite,
}: {
  danger: boolean
  acknowledged: boolean
  openAlert: () => void
  goCard: () => void
  goHelp: () => void
  goPrep: () => void
  profile: Profile
  openDemo: () => void
  lastCheckedLabel: string
  demoBanner?: string
  locationLabel?: string
  openRegionPick?: () => void
  onDemoInvite?: () => Promise<void>
}) {
  const { state: deviceState } = useDevice()
  const deviceHint =
    deviceState.status === "disconnected" || deviceState.status === "unsupported"
      ? deviceState.errorMessage
      : null
  const [inviteBusy, setInviteBusy] = useState(false)
  return (
    <main className="proto-page home-page">
      {onDemoInvite && (
        <button
          type="button"
          className="demo-home-invite"
          disabled={inviteBusy}
          onClick={() => {
            if (inviteBusy) return
            setInviteBusy(true)
            onDemoInvite().finally(() => setInviteBusy(false))
          }}
        >
          {DEMO_INVITE_LABEL}
        </button>
      )}
      <header className="home-head">
        <Logo onSecretTap={openDemo} />
        <HomeDeviceBadge />
      </header>
      {deviceHint && <p className="device-reconnect-hint">{deviceHint}</p>}
      {demoBanner && (
        <p className={`demo-home-banner${demoBanner.includes("끊겼") ? " offline" : ""}`}>
          {demoBanner}
        </p>
      )}
      {locationLabel && (
        <button type="button" className="home-here" onClick={openRegionPick}>
          {locationLabel}
        </button>
      )}
      <section className="page-heading">
        <h1>
          {danger ? (
            <>
              <span>지금 확인할</span>
              <span>알림이 있어요</span>
            </>
          ) : (
            <>
              <span>{profile.name ? `${profile.name}님,` : "안녕하세요,"}</span>
              <span>지금은 괜찮아요</span>
            </>
          )}
        </h1>
        {!danger && <p>관악구 · 오늘</p>}
      </section>
      <div className="card-stack">
        {danger && (
          <article className="danger-card">
            <header>
              <em>●●● 지금 해야 해요</em>
              <Icon name="cloud" />
            </header>
            <h2>비가 아주 많이 와요</h2>
            <p>물이 빨리 차올라서 위험해요.</p>
            <ProtoButton onClick={openAlert}>{acknowledged ? "확인했어요" : "할 일 보기"}</ProtoButton>
          </article>
        )}
        {!danger && (
          <article className="quiet-card">
            <span><Icon name="sun" /></span>
            <div>
              <h2 className="text-lg! font-bold! whitespace-nowrap">지금 온 재난문자가 없어요.</h2>
              <p>문자가 오면 바로 알려줄게요.</p>
            </div>
          </article>
        )}
        <article className="white-card">
          <ProtoRow
            icon="people"
            title="나의 재난 대비 카드"
            description="급할 때 바로 전화할 수 있어요."
            badge="준비됐어요"
            onClick={goCard}
            compactTitle
          />
        </article>
        <article className="white-card">
          <ProtoRow icon="history" title="지난 알림 보기" onClick={openAlert} />
        </article>
      </div>
      <span className="hidden-links">
        <button onClick={goHelp}>도움</button>
        <button onClick={goPrep}>대비</button>
      </span>
      {lastCheckedLabel && <p className="home-last-checked">{lastCheckedLabel}</p>}
    </main>
  )
}
