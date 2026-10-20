// 내 카드를 이미지로 찍어서 A4 PDF 로 만든다.
// 한글은 jsPDF 에 직접 쓰지 않는다 — html2canvas 가 화면을 그린 그대로 넣는다.

import { Capacitor } from "@capacitor/core"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { Share } from "@capacitor/share"

const A4_CSS_W = 595
const A4_CSS_H = 842

export function cardPdfFilename(name: string): string {
  const safe = (name || "이름").replace(/[\\/:*?"<>|]+/g, "").trim() || "이름"
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `내카드_${safe}_${y}${m}${d}.pdf`
}

function sheetElement(): HTMLElement {
  const el = document.querySelector(".pdf-print-sheet .pdf")
  if (!(el instanceof HTMLElement)) throw new Error("pdf sheet missing")
  return el
}

function isShareCanceled(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err).toLowerCase()
  return msg.includes("cancel") || msg.includes("dismiss") || msg.includes("abort")
}

export async function buildCardPdf(name: string): Promise<{
  filename: string
  blob: Blob
  base64: string
}> {
  const el = sheetElement()
  el.style.width = `${A4_CSS_W}px`
  el.style.height = `${A4_CSS_H}px`
  if (document.fonts?.ready) await document.fonts.ready
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])
  const canvas = await html2canvas(el, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    width: A4_CSS_W,
    height: A4_CSS_H,
    windowWidth: A4_CSS_W,
    windowHeight: A4_CSS_H,
  })
  const png = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  const w = pdf.internal.pageSize.getWidth()
  const h = pdf.internal.pageSize.getHeight()
  pdf.addImage(png, "PNG", 0, 0, w, h)
  const blob = pdf.output("blob")
  const dataUri = pdf.output("datauristring")
  const base64 = dataUri.split(",")[1] ?? ""
  if (!base64) throw new Error("empty pdf")
  return { filename: cardPdfFilename(name), blob, base64 }
}

async function sharePdf(filename: string, base64: string) {
  const written = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  })
  try {
    await Share.share({
      title: filename,
      files: [written.uri],
      dialogTitle: "카드 보내기",
    })
  } catch (err) {
    if (isShareCanceled(err)) return
    throw err
  }
}

function downloadPdf(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 웹: 파일 내려받기. 앱: 공유 창(저장·인쇄·메시지). */
export async function saveCardPdf(name: string): Promise<void> {
  const { filename, blob, base64 } = await buildCardPdf(name)
  if (Capacitor.isNativePlatform()) await sharePdf(filename, base64)
  else downloadPdf(filename, blob)
}

/** 웹: 카드만 인쇄. 앱: 같은 공유 창. */
export async function printCardPdf(name: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await saveCardPdf(name)
    return
  }
  if (document.fonts?.ready) await document.fonts.ready
  await new Promise<void>((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      window.removeEventListener("afterprint", done)
      resolve()
    }
    window.addEventListener("afterprint", done)
    window.print()
    window.setTimeout(done, 1500)
  })
}
