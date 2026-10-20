// 내 재난 대비 카드. 각 항목에 전화 가능한 사람은 바로 ProtoSheet 로 전화 확인.
// 모든 값은 profile 에서 가져온다. 비어 있는 줄은 "아직 적지 않았어요" 로 표시.

import { Icon } from "../components/Icon"
import { Logo } from "../components/Logo"
import { ProtoButton } from "../components/ProtoButton"
import type { CallTarget } from "../components/ProtoSheet"
import { describeContact, describeInstitution, type Profile } from "../data/profile"

type Row = {
  label: string
  value: string
  callTarget?: CallTarget | null
}

function buildRows(profile: Profile): Row[] {
  const guardianLabel =
    profile.guardian.relation || profile.guardian.name || "도와줄 사람"
  const neighborLabel =
    profile.neighbor.relation || profile.neighbor.name || "또 다른 사람"
  const institutionLabel = profile.institution.name || "기관"

  return [
    { label: "이름", value: profile.name },
    { label: "우리 집 주소", value: profile.address },
    {
      label: "도와줄 사람",
      value: describeContact(profile.guardian),
      callTarget: profile.guardian.phone
        ? {
            label: guardianLabel,
            phone: profile.guardian.phone,
            description: profile.guardian.name
              ? `${profile.guardian.name}에게 전화해요.`
              : "내 카드에 적은 사람이에요.",
          }
        : null,
    },
    {
      label: "또 다른 사람",
      value: describeContact(profile.neighbor),
      callTarget: profile.neighbor.phone
        ? {
            label: neighborLabel,
            phone: profile.neighbor.phone,
            description: profile.neighbor.name
              ? `${profile.neighbor.name}에게 전화해요.`
              : "내 카드에 적은 사람이에요.",
          }
        : null,
    },
    {
      label: "기관",
      value: describeInstitution(profile.institution),
      callTarget: profile.institution.phone
        ? {
            label: institutionLabel,
            phone: profile.institution.phone,
            description: "내 카드에 적은 기관이에요.",
          }
        : null,
    },
    { label: "내가 갈 대피소", value: profile.shelter },
    { label: "소통 방법", value: profile.communication.join(", ") },
    { label: "이동 도움", value: profile.mobility },
    { label: "힘든 것", value: profile.hardThing },
    { label: "챙길 물건", value: profile.bring },
  ]
}

export function ProtoCard({
  openPdf,
  call,
  edit,
  profile,
}: {
  openPdf: () => void
  call: (target: CallTarget) => void
  edit: () => void
  profile: Profile
}) {
  const rows = buildRows(profile)
  return (
    <main className="proto-page card-page">
      <section className="page-heading">
        <h1>나의 재난 대비 카드</h1>
        <p>급할 때 이 카드를 보여 주세요.</p>
      </section>
      <article className="disaster-card">
        <header>
          <Logo />
          <b>차차 재난 대비 카드</b>
          <button onClick={edit}>고치기</button>
        </header>
        {rows.map(({ label, value, callTarget }) => (
          <section key={label}>
            <b>{label}</b>
            <p>
              {value || "아직 적지 않았어요"}
              {callTarget && (
                <button onClick={() => call(callTarget)}>
                  <Icon name="call" />
                </button>
              )}
            </p>
          </section>
        ))}
      </article>
      <div className="split-actions">
        <ProtoButton onClick={openPdf}>PDF로 저장</ProtoButton>
        <ProtoButton secondary onClick={openPdf}>인쇄하기</ProtoButton>
      </div>
    </main>
  )
}
