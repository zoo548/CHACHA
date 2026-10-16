// 노트북 미리보기 전용 가짜 상태바(시계, 다이내믹 아일랜드, 신호/와이파이/배터리).
// - 폭 ≤600px(실제 휴대폰, 네이티브 앱) 에서는 CSS 로 숨겨진다 (index.css 참고).
// - 네이티브 앱에서 상태바 글자색은 @capacitor/status-bar 로 App.tsx 에서 따로 바꿔 준다.

export function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div className={`proto-status ${light ? "light" : ""}`}>
      <b>9:41</b>
      <span className="dynamic-island" />
      <div className="status-icons">
        <i className="signal" />
        <i className="wifi" />
        <i className="battery" />
      </div>
    </div>
  )
}
