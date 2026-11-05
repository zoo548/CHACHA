import { json, OPTIONS, readJson, wrap } from "./_lib/http"
import { joinDevice } from "./_lib/store"

export { OPTIONS }

export function POST(req: Request) {
  return wrap(async () => {
    const body = await readJson(req)
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
  })
}
