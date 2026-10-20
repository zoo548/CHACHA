// PDF 미리보기 화면. 아래 저장 버튼은 웹에서 내려받기, 앱에서 공유 창.

import { PdfPreview } from "../components/PdfPreview"
import { ProtoButton } from "../components/ProtoButton"
import { useCardPdf } from "../card/useCardPdf"
import type { Profile } from "../data/profile"

export function PdfScreen({ back, profile }: { back: () => void; profile: Profile }) {
  const pdf = useCardPdf(profile.name)
  return (
    <main className="pdf-preview-screen">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <div>
        <PdfPreview profile={profile} />
      </div>
      <footer>
        <ProtoButton onClick={pdf.save} disabled={pdf.busy !== null}>
          {pdf.busy === "save" ? "만드는 중이에요" : "저장하기"}
        </ProtoButton>
        {pdf.failed && <p className="card-export-hint">다시 눌러 주세요</p>}
      </footer>
    </main>
  )
}
