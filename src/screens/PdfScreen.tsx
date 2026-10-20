// PDF 미리보기 화면. 아래쪽 저장 버튼은 지금은 그냥 돌아가기만 함.

import { PdfPreview } from "../components/PdfPreview"
import { ProtoButton } from "../components/ProtoButton"
import type { Profile } from "../data/profile"

export function PdfScreen({ back, profile }: { back: () => void; profile: Profile }) {
  return (
    <main className="pdf-preview-screen">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <div>
        <PdfPreview profile={profile} />
      </div>
      <footer>
        <ProtoButton onClick={back}>저장하기</ProtoButton>
      </footer>
    </main>
  )
}
