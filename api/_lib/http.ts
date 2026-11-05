import { timingSafeEqual } from "node:crypto"
import type { DemoRequest, DemoResponse } from "./types"

export function applyDemoHeaders(res: DemoResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-demo-key")
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
}

function presenterKeyFromReq(req: DemoRequest, body: Record<string, unknown>): string {
  const header = req.headers["x-demo-key"]
  if (typeof header === "string" && header) return header
  const auth = req.headers.authorization
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim()
  }
  return typeof body.key === "string" ? body.key : ""
}

function keysMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function readJsonBody(req: DemoRequest): Record<string, unknown> {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      const parsed = JSON.parse(req.body) as unknown
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      return {}
    }
  }
  return {}
}

export function assertPresenter(
  req: DemoRequest,
  res: DemoResponse,
  body: Record<string, unknown> = {},
): boolean {
  const expected = process.env.DEMO_PRESENTER_KEY?.trim() ?? ""
  if (!expected) {
    res.status(503).json({ error: "presenter_key_missing" })
    return false
  }
  if (!keysMatch(presenterKeyFromReq(req, body), expected)) {
    res.status(401).json({ error: "unauthorized" })
    return false
  }
  return true
}

export async function demoHandler(
  req: DemoRequest,
  res: DemoResponse,
  methods: string[],
  fn: () => Promise<void>,
): Promise<void> {
  applyDemoHeaders(res)
  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }
  if (!methods.includes(req.method ?? "")) {
    res.status(405).json({ error: "method_not_allowed" })
    return
  }
  try {
    await fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : "error"
    console.error("[demo]", message)
    if (res.headersSent) return
    if (message === "redis_missing") {
      res.status(503).json({ error: "redis_missing" })
      return
    }
    res.status(500).json({ error: "server_error" })
  }
}
