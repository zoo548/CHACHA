import { timingSafeEqual } from "node:crypto"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-demo-key",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: CORS })
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS })
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await req.json()
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    return {}
  }
  return {}
}

function presenterKey(req: Request, body: Record<string, unknown>): string {
  const header = req.headers.get("x-demo-key")
  if (header) return header
  const auth = req.headers.get("authorization")
  if (auth && auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim()
  return typeof body.key === "string" ? body.key : ""
}

function keysMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function assertPresenter(req: Request, body: Record<string, unknown> = {}): Response | null {
  const expected = process.env.DEMO_PRESENTER_KEY?.trim() ?? ""
  if (!expected) return json({ error: "presenter_key_missing" }, 503)
  if (!keysMatch(presenterKey(req, body), expected)) return json({ error: "unauthorized" }, 401)
  return null
}

export async function wrap(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : "error"
    console.error("[demo]", message)
    if (message === "redis_missing") return json({ error: "redis_missing" }, 503)
    return json({ error: "server_error" }, 500)
  }
}
