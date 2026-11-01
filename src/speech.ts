// 화면 문장을 소리로 읽어 주기. 웹 SpeechSynthesis 만 쓴다 (서버 전송 없음).

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
  if (typeof window === "undefined") return
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.value = 0.07
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
    window.setTimeout(() => {
      ctx.close().catch(() => {})
    }, 400)
  } catch {
    /* 소리 재생을 못 해도 화면은 그대로 */
  }
}
