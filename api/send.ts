import { randomUUID } from "node:crypto"
import {
  DEFAULT_DEMO_GOV_TYPE,
  DEFAULT_DEMO_MESSAGE,
  DEFAULT_DEMO_SENDER,
  type DemoMessage,
} from "../shared/demoDefaults"
import { assertPresenter, json, OPTIONS, readJson, wrap } from "./_lib/http"
import { setCurrent } from "./_lib/store"

export { OPTIONS }

function clip(value: unknown, fallback: string, max: number): string {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text) return fallback
  return text.slice(0, max)
}

export function POST(req: Request) {
  return wrap(async () => {
    const body = await readJson(req)
    const denied = assertPresenter(req, body)
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
  })
}
