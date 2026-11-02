// 그림·사진 출처 목록. CREDITS.md 내용을 그대로 보여 준다.

import iconCredits from "../../docs/icons/CREDITS.md?raw"
import photoCredits from "../../docs/photos/CREDITS.md?raw"

export function CreditsScreen({ back }: { back: () => void }) {
  const credits = `${iconCredits.trim()}\n\n${photoCredits.trim()}`
  return (
    <main className="proto-page credits-page">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <section className="page-heading compact">
        <h1>그림 출처</h1>
        <p>그림 일부는 Mulberry Symbols예요.</p>
      </section>
      <pre className="credits-body">{credits}</pre>
    </main>
  )
}
