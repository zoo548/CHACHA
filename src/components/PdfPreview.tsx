// 인쇄용 PDF 미리보기. 지갑에 넣을 수 있는 아래쪽 카드까지 포함.
// 지금은 보여주기용(저장/인쇄 로직은 없음) — PDF 저장은 나중에 Capacitor 쪽 플러그인으로.

import { Logo } from "./Logo"

const rows: [string, string][] = [
  ["이름", "김민수"],
  ["우리 집 주소", "관악구 신림동 00-00 101호"],
  ["도와줄 사람", "김영희 (엄마) 010-1234-5678"],
  ["또 다른 사람", "박민수 (이웃) 010-9876-5432"],
  ["기관", "관악복지관 02-000-0000"],
  ["내가 갈 대피소", "신림초등학교"],
  ["소통 방법", "짧은 문장으로 말해 주세요"],
  ["이동 도움", "같이 걸어 주세요"],
  ["힘든 것", "큰 소리를 무서워해요"],
  ["챙길 물건", "약, 물, 휴대폰"],
]

export function PdfPreview() {
  return (
    <div className="pdf">
      <header>
        <h1>나의 재난 대비 카드</h1>
        <span>작성한 날짜 2025. 10. 10.</span>
      </header>
      <p>잘라서 현관문 안쪽에 붙여 주세요.</p>
      <table>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a}>
              <th>{a}</th>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cut-line">✂</div>
      <section className="wallet-card">
        <Logo />
        <h2>김민수</h2>
        <b>저는 도움이 필요해요.</b>
        <p>이 번호로 전화해 주세요.</p>
        <strong>김영희 (엄마) 010-1234-5678</strong>
        <small>짧은 문장으로 말해 주세요</small>
      </section>
    </div>
  )
}
