import { randomUUID } from "node:crypto"
import {
  DEFAULT_DEMO_GOV_TYPE,
  DEFAULT_DEMO_MESSAGE,
  DEFAULT_DEMO_SENDER,
  type DemoMessage,
} from "../shared/demoDefaults"
import { assertPresenter, json, OPTIONS, readJson, wrap } from "./_lib/http"
import { clearCurrent, getCurrent, joinDevice, pruneJoins, setCurrent } from "./_lib/store"

function clip(value: unknown, fallback: string, max: number): string {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text) return fallback
  return text.slice(0, max)
}

function opOf(request: Request): string {
  const url = new URL(request.url)
  const fromQuery = url.searchParams.get("op")
  if (fromQuery) return fromQuery
  const parts = url.pathname.split("/").filter(Boolean)
  return parts[parts.length - 1] ?? ""
}

async function route(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return OPTIONS()
  const op = opOf(request)
  const method = request.method ?? "GET"

  if ((op === "current" || op === "api" || op === "") && method === "GET") {
    return json({ current: await getCurrent() })
  }
  if (op === "count" && method === "GET") {
    return json({ count: await pruneJoins() })
  }
  if (op === "join" && method === "POST") {
    const body = await readJson(request)
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : ""
    try {
      const count = await joinDevice(deviceId)
      return json({ ok: true, count })
    } catch (err) {
      if (err instanceof Error && err.message === "bad_device_id") {
        return json({ error: "bad_device_id" }, 400)
      }
      throw err
    }
  }
  if (op === "send" && method === "POST") {
    const body = await readJson(request)
    const denied = assertPresenter(request, body)
    if (denied) return denied
    const current: DemoMessage = {
      id: randomUUID(),
      sentAt: new Date().toISOString(),
      message: clip(body.message, DEFAULT_DEMO_MESSAGE, 1000),
      sender: clip(body.sender, DEFAULT_DEMO_SENDER, 40),
      govType: clip(body.govType, DEFAULT_DEMO_GOV_TYPE, 40),
    }
    await setCurrent(current)
    return json({ current })
  }
  if (op === "reset" && method === "POST") {
    const body = await readJson(request)
    const denied = assertPresenter(request, body)
    if (denied) return denied
    await clearCurrent()
    return json({ current: null })
  }
  return json({ error: "not_found", op, method }, 404)
}

export const config = { runtime: "nodejs" }
export const runtime = "nodejs"

export function GET(request: Request) {
  return wrap(() => route(request))
}

export function POST(request: Request) {
  return wrap(() => route(request))
}

export { OPTIONS }
