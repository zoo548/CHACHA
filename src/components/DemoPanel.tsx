// 시연 패널 — 홈 로고 5번 누르면 바텀시트처럼 올라옴.
//
// 두 가지 방법으로 알림을 보낼 수 있다:
//   A) "재난 종류" 를 드롭다운에서 고르고 등급(주의/대피) 선택
//   B) 원문을 붙여 넣고 발송유형(위급/긴급/안전안내) 선택
// 아무거나 "10초 뒤 알림 보내기" 하면 10초 뒤에 OS 알림이 뜬다 (앱을 닫아도 OK).
//
// 생성형 AI 쓰지 않음. 매칭은 src/matching/matchAlert, 알림은 @capacitor/local-notifications.

import { useState } from "react"
import { ProtoButton } from "./ProtoButton"
import { getAlertView, listDisasters, rawTextView } from "../data/alertTemplate"
import { matchAlert, type BroadcastType } from "../matching/matchAlert"
import { scheduleDemoAlert, type NotificationPayload } from "../notifications"
import type { Profile } from "../data/profile"

type Mode = "preset" | "raw" | "practice"

const DELAY_SEC = 10

export function DemoPanel({
  profile,
  close,
}: {
  profile: Profile
  close: () => void
}) {
  const disasters = listDisasters()
  const [mode, setMode] = useState<Mode>("preset")
  const [disasterId, setDisasterId] = useState<string>(disasters[0]?.id ?? "")
  const [level, setLevel] = useState<"caution" | "evacuate">("caution")
  const [rawText, setRawText] = useState("")
  const [broadcast, setBroadcast] = useState<BroadcastType>("안전안내")
  const [status, setStatus] = useState<string>("")

  const picked = disasters.find((d) => d.id === disasterId)
  const canEvacuate = picked?.levels.includes("evacuate") ?? false

  async function send() {
    setStatus("보내는 중…")
    let payload: NotificationPayload
    let title = "재난문자가 왔어요"
    let body = ""

    if (mode === "practice") {
      payload = { kind: "practice" }
      title = "연습 알림이에요"
      body = "진짜 재난이 아니에요."
    } else if (mode === "preset") {
      const useLevel = canEvacuate ? level : "caution"
      const view = getAlertView(disasterId, useLevel, profile)
      if (!view) {
        setStatus("재난 정보를 찾을 수 없어요.")
        return
      }
      payload = { kind: "preset", disasterId, level: useLevel }
      title = view.title
      body = view.situation
    } else {
      // mode === "raw"
      const result = matchAlert(rawText, broadcast)
      if (result) {
        const view = getAlertView(result.id, result.level, profile)
        payload = { kind: "preset", disasterId: result.id, level: result.level }
        title = view?.title ?? "재난문자가 왔어요"
        body = view?.situation ?? rawText.slice(0, 60)
      } else {
        const view = rawTextView(rawText)
        payload = { kind: "raw", text: rawText, broadcastType: broadcast }
        title = view.title
        body = view.situation.slice(0, 120)
      }
    }

    const ok = await scheduleDemoAlert(title, body, payload, DELAY_SEC)
    if (!ok) {
      setStatus("알림 권한이 필요해요. 설정에서 '차차'의 알림을 켜 주세요.")
      return
    }
    setStatus(`${DELAY_SEC}초 뒤에 알림이 와요. 앱을 닫아도 돼요.`)
  }

  return (
    <div className="proto-sheet-wrap" onClick={close}>
      <section className="proto-sheet demo-panel" onClick={(e) => e.stopPropagation()}>
        <i />
        <h2>시연 — 테스트 알림 보내기</h2>

        <div className="demo-mode">
          <button className={mode === "preset" ? "active" : ""} onClick={() => setMode("preset")}>
            재난 고르기
          </button>
          <button className={mode === "raw" ? "active" : ""} onClick={() => setMode("raw")}>
            원문 붙여넣기
          </button>
          <button
            className={mode === "practice" ? "active" : ""}
            onClick={() => setMode("practice")}
          >
            연습
          </button>
        </div>

        {mode === "preset" && (
          <>
            <label className="demo-row">
              <b>재난 종류</b>
              <select value={disasterId} onChange={(e) => setDisasterId(e.target.value)}>
                {disasters.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="demo-row">
              <b>등급</b>
              <div className="demo-level">
                <button
                  className={level === "caution" ? "active" : ""}
                  onClick={() => setLevel("caution")}
                >
                  주의 (L)
                </button>
                <button
                  className={level === "evacuate" ? "active" : ""}
                  onClick={() => setLevel("evacuate")}
                  disabled={!canEvacuate}
                >
                  대피 (H)
                </button>
              </div>
              {!canEvacuate && <small>이 재난은 '대피' 등급이 없어요.</small>}
            </label>
          </>
        )}

        {mode === "raw" && (
          <>
            <label className="demo-row">
              <b>원문</b>
              <textarea
                placeholder="예) [기상청] 서울 호우경보 발효. 하천변 통제. 저지대 대피"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={4}
              />
            </label>
            <label className="demo-row">
              <b>발송유형</b>
              <div className="demo-level">
                {(["안전안내", "긴급", "위급"] as const).map((t) => (
                  <button
                    className={broadcast === t ? "active" : ""}
                    onClick={() => setBroadcast(t)}
                    key={t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </label>
          </>
        )}

        {mode === "practice" && (
          <p className="demo-note">연습 알림 1건을 {DELAY_SEC}초 뒤 보냅니다.</p>
        )}

        <ProtoButton onClick={send} disabled={mode === "raw" && rawText.trim().length === 0}>
          {DELAY_SEC}초 뒤 알림 보내기
        </ProtoButton>
        <ProtoButton secondary onClick={close}>
          닫기
        </ProtoButton>
        {status && <p className="demo-status">{status}</p>}
      </section>
    </div>
  )
}
