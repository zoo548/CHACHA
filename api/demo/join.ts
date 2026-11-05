import { demoHandler, readJsonBody } from "../_lib/http"
import { joinDevice } from "../_lib/store"
import type { DemoRequest, DemoResponse } from "../_lib/types"

export default async function handler(req: DemoRequest, res: DemoResponse) {
  await demoHandler(req, res, ["POST"], async () => {
    const body = readJsonBody(req)
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : ""
    try {
      const count = await joinDevice(deviceId)
      res.status(200).json({ ok: true, count })
    } catch (err) {
      if (err instanceof Error && err.message === "bad_device_id") {
        res.status(400).json({ error: "bad_device_id" })
        return
      }
      throw err
    }
  })
}
