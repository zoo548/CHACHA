// 119·112 연락 화면. 전화와 문자 중 고른다.
// 문장 대본은 쉬운 말로 고정한다. 생성형 AI 를 쓰지 않는다.

import { Capacitor } from "@capacitor/core"
import { Icon } from "../components/Icon"

const SCRIPT = "도움이 필요해요. 지금 와 주세요."

function smsHref(number: "119" | "112"): string {
  const body = encodeURIComponent(SCRIPT)
  return Capacitor.getPlatform() === "ios"
    ? `sms:${number}&body=${body}`
    : `sms:${number}?body=${body}`
}

export function EmergencyScript({
  number,
  back,
}: {
  number: "119" | "112"
  back: () => void
}) {
  return (
    <main className="proto-page emergency-script">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <section className="page-heading compact">
        <h1>{number}에 연락해요</h1>
        <p>전화하거나 문자를 보내요.</p>
      </section>
      <a className="call-btn" href={`tel:${number}`}>
        <i aria-hidden="true" className="call-mark">
          <Icon name="call" />
        </i>
        <span>
          <b>전화해요</b>
          <small>누르면 전화해요 · {number}</small>
        </span>
      </a>
      <a className="sms-btn" href={smsHref(number)}>
        <span>
          <b>문자해요</b>
          <small>{SCRIPT}</small>
        </span>
      </a>
    </main>
  )
}
