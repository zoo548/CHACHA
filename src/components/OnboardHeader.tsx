// 온보딩 공통 상단: 뒤로 / 진행 막대 / 나중에 할게요.

export function OnboardHeader({
  step,
  back,
  skip,
}: {
  step: number
  back?: () => void
  skip?: () => void
}) {
  return (
    <header className="onboard-header">
      <button onClick={back} disabled={!back}>‹ 뒤로</button>
      <div>
        <i style={{ width: `${Math.min(100, ((step + 1) / 12) * 100)}%` }} />
      </div>
      {skip ? <button onClick={skip}>나중에 할게요</button> : <span />}
    </header>
  )
}
