// HelpScreen 다음 단계. 상황에 따라 119/112 + 내 카드에 적어 둔 사람들 중 선택.
// 사람 목록은 전부 profile 에서 가져오고, 번호가 없는 사람은 보여주지 않는다.

import { ProtoRow } from "../components/ProtoRow"
import type { CallTarget } from "../components/ProtoSheet"
import type { Profile } from "../data/profile"
import type { IconName } from "../types"

export function CallChoice({
  situation,
  back,
  call,
  profile,
}: {
  situation: string
  back: () => void
  call: (target: CallTarget) => void
  profile: Profile
}) {
  const emergency = situation !== "무서운 사람이 있어요" && situation !== "잘 모르겠어요"
  const emergencyNumber = emergency ? "119" : "112"
  const emergencyDescription = emergency ? "구해 주는 곳이에요" : "경찰이 오는 곳이에요"

  // profile 에서 "번호가 있는" 사람만 모은다. 번호가 없으면 전화를 못 거니까 숨긴다.
  type Row = {
    icon: IconName
    title: string
    description?: string
    target: CallTarget
  }
  const rows: Row[] = []

  if (profile.guardian.phone) {
    const label = profile.guardian.relation || profile.guardian.name || "도와줄 사람"
    rows.push({
      icon: "people",
      title: `${label}에게 전화하기`,
      description: profile.guardian.name,
      target: {
        label,
        phone: profile.guardian.phone,
        description: profile.guardian.name
          ? `${profile.guardian.name}에게 전화해요.`
          : "내 카드에 적은 사람이에요.",
      },
    })
  }
  if (profile.neighbor.phone) {
    const label = profile.neighbor.relation || profile.neighbor.name || "또 다른 사람"
    rows.push({
      icon: "people",
      title: `${label}에게 전화하기`,
      description: profile.neighbor.name,
      target: {
        label,
        phone: profile.neighbor.phone,
        description: profile.neighbor.name
          ? `${profile.neighbor.name}에게 전화해요.`
          : "내 카드에 적은 사람이에요.",
      },
    })
  }
  if (profile.institution.phone) {
    const label = profile.institution.name || "기관"
    rows.push({
      icon: "building",
      title: `${label}에 전화하기`,
      target: {
        label,
        phone: profile.institution.phone,
        description: "내 카드에 적은 기관이에요.",
      },
    })
  }

  return (
    <main className="proto-page">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <em className="situation-pill">{situation}</em>
      <section className="page-heading compact">
        <h1>누구에게 전화할까요?</h1>
      </section>
      <article className="white-card help-list">
        <ProtoRow
          icon={emergency ? "alert" : "call"}
          title={`${emergencyNumber}에 전화하기`}
          description={emergencyDescription}
          onClick={() =>
            call({ label: emergencyNumber, phone: emergencyNumber, description: emergencyDescription })
          }
        />
        {rows.map((row) => (
          <ProtoRow
            key={row.title}
            icon={row.icon}
            title={row.title}
            description={row.description}
            onClick={() => call(row.target)}
          />
        ))}
      </article>
      <p className="card-note">
        {rows.length > 0 ? "내 카드에 적은 사람이에요." : "내 카드에 전화번호를 적으면 여기 보여요."}
      </p>
    </main>
  )
}
