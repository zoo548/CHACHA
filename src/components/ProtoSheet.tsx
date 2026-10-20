// 아래에서 올라오는 바텀시트. 종류별로 안내 문구가 다르다.
// - phone-permission: 전화 허락
// - location: 위치 허락
// - call: 실제 통화 확인 (대상 받아 보여줌, "전화하기" = tel: 링크로 진짜 전화 앱 열림)
// - source: 재난문자 원문 보기

import { ProtoButton } from "./ProtoButton"
import { toTelDigits } from "../data/profile"
import type { SheetKind } from "../types"

export type CallTarget = {
  /** 큰 글씨로 보여줄 이름/역할. 예: "엄마", "경찰", "관악복지관" */
  label: string
  /** 번호 그대로 (하이픈 포함 가능) — 없으면 "전화하기" 버튼은 숨긴다. */
  phone: string
  /** 아래 설명 줄. 예: "경찰이 오는 곳이에요." */
  description?: string
}

export function ProtoSheet({
  kind,
  close,
  next,
  callTarget,
}: {
  kind: SheetKind
  close: () => void
  next: () => void
  callTarget: CallTarget | null
}) {
  if (!kind) return null

  if (kind === "call") {
    const target = callTarget
    const digits = target ? toTelDigits(target.phone) : ""
    const title = target?.label ? `${target.label}에 전화할까요?` : "전화할까요?"
    const description =
      target?.description ??
      (target?.phone ? target.phone : "번호가 저장돼 있지 않아요.")
    return (
      <div className="proto-sheet-wrap" onClick={close}>
        <section className="proto-sheet" onClick={(e) => e.stopPropagation()}>
          <i />
          <h2>{title}</h2>
          <p>{description}</p>
          {digits ? (
            // tel: 링크 — iOS/Android 는 전화 앱으로 바로 넘어가고, 데스크톱은 조용히 무시.
            <a className="proto-button" href={`tel:${digits}`} onClick={close}>
              전화하기
            </a>
          ) : (
            <ProtoButton disabled>전화하기</ProtoButton>
          )}
          <ProtoButton secondary onClick={close}>
            그만하기
          </ProtoButton>
        </section>
      </div>
    )
  }

  const content: [string, string, string] =
    kind === "phone-permission"
      ? ["전화를 걸려면 허락이 필요해요.", "도와줄 사람에게 바로 전화할 수 있어요.", "허락하기"]
      : kind === "location"
        ? ["위치를 쓰려면 허락이 필요해요.", "가까운 대피소를 찾아요.", "허락하기"]
        : /* source */ [
            "원문 보기",
            "[기상청] 관악구 호우경보 발효. 하천변, 지하공간 등 위험지역 접근을 자제하고…",
            "닫기",
          ]

  return (
    <div className="proto-sheet-wrap" onClick={close}>
      <section className="proto-sheet" onClick={(e) => e.stopPropagation()}>
        <i />
        <h2>{content[0]}</h2>
        <p>{content[1]}</p>
        <ProtoButton onClick={kind === "phone-permission" ? next : close}>{content[2]}</ProtoButton>
      </section>
    </div>
  )
}
