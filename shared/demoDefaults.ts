// 시연 방송 기본 문자. 서버·발표자 페이지가 같이 쓴다.
// 재난문자 API 키·개인정보는 여기 두지 않는다.

export type DemoMessage = {
  id: string
  sentAt: string
  message: string
  sender: string
  govType: string
}

export const DEFAULT_DEMO_MESSAGE =
  "[관악구] 신림동 호우경보 발효. 하천 주변, 계곡, 급경사지, 농수로 등 위험지역 출입 금지, 대피권고를 받으면 즉시 대피하세요."

export const DEFAULT_DEMO_SENDER = "관악구청"

export const DEFAULT_DEMO_GOV_TYPE = "안전안내문자"

export function defaultDemoMessage(): Omit<DemoMessage, "id" | "sentAt"> {
  return {
    message: DEFAULT_DEMO_MESSAGE,
    sender: DEFAULT_DEMO_SENDER,
    govType: DEFAULT_DEMO_GOV_TYPE,
  }
}
