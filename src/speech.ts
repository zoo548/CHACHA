// 화면 문장을 소리로 읽어 주기. 웹 SpeechSynthesis 만 쓴다 (서버 전송 없음).

let audioCtx: AudioContext | null = null

function audioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined
  return window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
}

function getAudioCtx(): AudioContext | null {
  const AudioCtx = audioContextClass()
  if (!AudioCtx) return null
  if (!audioCtx) audioCtx = new AudioCtx()
  return audioCtx
}

/** 버튼 누를 때 한 번. 아이폰 사파리가 이후 차임 소리를 막지 않게 한다. */
export async function unlockAudio(): Promise<void> {
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    if (ctx.state === "suspended") await ctx.resume()
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.start(0)
  } catch {
    /* 소리 잠금 해제를 못 해도 화면은 그대로 */
  }
}

export function speak(text: string) {
  const t = text.trim()
  if (!t || typeof window === "undefined" || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(t)
    u.lang = "ko-KR"
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  } catch {
    /* 기기에서 읽어주기를 못 써도 화면은 그대로 */
  }
}

export function stopSpeak() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

/** 알림이 열릴 때 진동. 소리에 민감해도 진동은 남긴다. */
export function vibrateAlert() {
  try {
    navigator.vibrate?.([160, 80, 160])
  } catch {
    /* 웹이나 권한 없으면 그냥 넘어간다 */
  }
}

/** 기본 알림 소리(짧은 비프). OS 알림이 없을 때 화면이 바로 열린 경우용. */
export function playAlertTone() {
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    if (ctx.state === "suspended") ctx.resume().catch(() => {})
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.value = 0.07
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch {
    /* 소리 재생을 못 해도 화면은 그대로 */
  }
}
