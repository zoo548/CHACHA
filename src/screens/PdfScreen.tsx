// PDF 미리보기 화면. 아래쪽 저장 버튼은 지금은 그냥 돌아가기만 함.

import { PdfPreview } from "../components/PdfPreview"
import { ProtoButton } from "../components/ProtoButton"

export function PdfScreen({ back }: { back: () => void }) {
  return (
    <main className="pdf-preview-screen">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <div>
        <PdfPreview />
      </div>
      <footer>
        <ProtoButton onClick={back}>저장하기</ProtoButton>
      </footer>
    </main>
  )
}
