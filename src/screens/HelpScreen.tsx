// 도움 요청 화면. 상황을 고르면 CallChoice 로 넘어간다.

import { ProtoButton } from "../components/ProtoButton"
import { ProtoRow } from "../components/ProtoRow"
import type { IconName } from "../types"

const situations: [IconName, string][] = [
  ["people", "무서운 사람이 있어요"],
  ["water", "물이 들어와요"],
  ["alert", "다쳤어요"],
  ["home", "갇혔어요"],
  ["sun", "불이 났어요"],
  ["people", "사람이 쓰러졌어요"],
]

export function HelpScreen({ choose }: { choose: (situation: string) => void }) {
  return (
    <main className="proto-page">
      <section className="page-heading">
        <h1>도와주세요</h1>
        <p>무슨 일이 있나요? 문자가 오지 않아도 괜찮아요.</p>
      </section>
      <article className="white-card help-list">
        {situations.map(([icon, title]) => (
          <ProtoRow icon={icon} title={title} onClick={() => choose(title)} key={title} />
        ))}
      </article>
      <ProtoButton text onClick={() => choose("잘 모르겠어요")}>잘 모르겠어요</ProtoButton>
    </main>
  )
}
