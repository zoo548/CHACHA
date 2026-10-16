// 아래에서 올라오는 바텀시트. 종류별로 안내 문구가 다르다.
// - phone-permission: 전화 허락
// - location: 위치 허락
// - call: 실제 통화 확인 (전화번호 받아 보여줌)
// - source: 재난문자 원문 보기

import { ProtoButton } from "./ProtoButton"
import type { SheetKind } from "../types"

export function ProtoSheet({
  kind,
  close,
  next,
  callNumber,
}: {
  kind: SheetKind
  close: () => void
  next: () => void
  callNumber: string
}) {
  if (!kind) return null

  const content: [string, string, string] =
    kind === "phone-permission"
      ? ["전화를 걸려면 허락이 필요해요.", "도와줄 사람에게 바로 전화할 수 있어요.", "허락하기"]
      : kind === "location"
        ? ["위치를 쓰려면 허락이 필요해요.", "가까운 대피소를 찾아요.", "허락하기"]
        : kind === "source"
          ? [
              "원문 보기",
              "[기상청] 관악구 호우경보 발효. 하천변, 지하공간 등 위험지역 접근을 자제하고…",
              "닫기",
            ]
          : [
              `${callNumber}에 전화할까요?`,
              callNumber === "112"
                ? "경찰이 오는 곳이에요."
                : callNumber === "119"
                  ? "구해 주는 곳이에요."
                  : "내 카드에 적은 사람이에요.",
              "전화하기",
            ]

  return (
    <div className="proto-sheet-wrap" onClick={close}>
      <section className="proto-sheet" onClick={(e) => e.stopPropagation()}>
        <i />
        <h2>{content[0]}</h2>
        <p>{content[1]}</p>
        <ProtoButton onClick={kind === "phone-permission" ? next : close}>{content[2]}</ProtoButton>
        {kind === "call" && (
          <ProtoButton secondary onClick={close}>
            그만하기
          </ProtoButton>
        )}
      </section>
    </div>
  )
}
