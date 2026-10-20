// 인쇄용 PDF 미리보기. 지갑에 넣을 수 있는 아래쪽 카드까지 포함.
// 지금은 보여주기용(저장/인쇄 로직은 없음) — PDF 저장은 나중에 Capacitor 쪽 플러그인으로.
// 모든 내용은 profile 에서 가져온다.

import { Logo } from "./Logo"
import { describeContact, describeInstitution, type Profile } from "../data/profile"

const EMPTY = "아직 적지 않았어요"

function buildRows(profile: Profile): [string, string][] {
  return [
    ["이름", profile.name || EMPTY],
    ["우리 집 주소", profile.address || EMPTY],
    ["도와줄 사람", describeContact(profile.guardian) || EMPTY],
    ["또 다른 사람", describeContact(profile.neighbor) || EMPTY],
    ["기관", describeInstitution(profile.institution) || EMPTY],
    ["내가 갈 대피소", profile.shelter || EMPTY],
    ["소통 방법", profile.communication.join(", ") || EMPTY],
    ["이동 도움", profile.mobility || EMPTY],
    ["힘든 것", profile.hardThing || EMPTY],
    ["챙길 물건", profile.bring || EMPTY],
  ]
}

function todayLabel(): string {
  const now = new Date()
  return `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}.`
}

export function PdfPreview({ profile }: { profile: Profile }) {
  const rows = buildRows(profile)
  const walletName = profile.name || "이름"
  const walletContact = describeContact(profile.guardian) || "도와줄 사람 전화번호"
  const walletCommunication = profile.communication[0] || "짧은 문장으로 말해 주세요"
  return (
    <div className="pdf">
      <header>
        <h1>나의 재난 대비 카드</h1>
        <span>작성한 날짜 {todayLabel()}</span>
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
        <h2>{walletName}</h2>
        <b>저는 도움이 필요해요.</b>
        <p>이 번호로 전화해 주세요.</p>
        <strong>{walletContact}</strong>
        <small>{walletCommunication}</small>
      </section>
    </div>
  )
}
