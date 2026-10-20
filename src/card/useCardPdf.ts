import { useState } from "react"
import { printCardPdf, saveCardPdf } from "./exportCardPdf"

export function useCardPdf(name: string) {
  const [busy, setBusy] = useState<"save" | "print" | null>(null)
  const [failed, setFailed] = useState(false)

  const run = async (kind: "save" | "print", fn: () => Promise<void>) => {
    if (busy) return
    setBusy(kind)
    setFailed(false)
    try {
      await fn()
    } catch {
      setFailed(true)
    } finally {
      setBusy(null)
    }
  }

  return {
    busy,
    failed,
    save: () => run("save", () => saveCardPdf(name)),
    print: () => run("print", () => printCardPdf(name)),
    saveLabel: busy === "save" ? "만드는 중이에요" : "PDF로 저장",
    printLabel: busy === "print" ? "만드는 중이에요" : "인쇄하기",
  }
}
