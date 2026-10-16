// 긴 문장을 한 줄 한 정보로 끊어 보여 주는 유틸. 데이터는 " / " 를 줄바꿈 지점으로 사용한다.
// 예: "책상 밑으로 들어가 / 머리를 가려요."

export function Lines({ text }: { text: string }) {
  return <>{text.split(" / ").map((line) => <span key={line}>{line}</span>)}</>
}
