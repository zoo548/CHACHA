// Vercel Node 함수 req/res. @vercel/node 없이 최소 타입만 둔다.

export type DemoRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

export type DemoResponse = {
  headersSent: boolean
  setHeader: (name: string, value: string) => void
  status: (code: number) => DemoResponse
  json: (body: unknown) => void
  end: () => void
}
