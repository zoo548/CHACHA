import { randomUUID } from "node:crypto"
import {
  DEFAULT_DEMO_GOV_TYPE,
  DEFAULT_DEMO_MESSAGE,
  DEFAULT_DEMO_SENDER,
  type DemoMessage,
} from "../../shared/demoDefaults"
import { assertPresenter, demoHandler, readJsonBody } from "../_lib/http"
import { setCurrent } from "../_lib/store"
import type { DemoRequest, DemoResponse } from "../_lib/types"

function clip(value: unknown, fallback: string, max: number): string {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text) return fallback
  return text.slice(0, max)
}

export default async function handler(req: DemoRequest, res: DemoResponse) {
  await demoHandler(req, res, ["POST"], async () => {
    const body = readJsonBody(req)
    if (!assertPresenter(req, res, body)) return
    const current: DemoMessage = {
      id: randomUUID(),
      sentAt: new Date().toISOString(),
      message: clip(body.message, DEFAULT_DEMO_MESSAGE, 1000),
      sender: clip(body.sender, DEFAULT_DEMO_SENDER, 40),
      govType: clip(body.govType, DEFAULT_DEMO_GOV_TYPE, 40),
    }
    await setCurrent(current)
    res.status(200).json({ current })
  })
}
