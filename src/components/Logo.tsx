// 차차 로고.
// - 작은 버전: 세 점 로고마크 + "차차" 글자
// - large: 큰 로고마크 + "차차" + 작은 영문 라벨 (온보딩 시작 화면 전용)

export function Logo({ large = false }: { large?: boolean }) {
  return (
    <div className={large ? "brand-logo large" : "brand-logo"}>
      <span className="logo-mark"><i /><i /><i /></span>
      <strong>차차</strong>
      {large && <small>CHA-CHA</small>}
    </div>
  )
}
