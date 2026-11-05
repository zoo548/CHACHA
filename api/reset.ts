import { assertPresenter, json, OPTIONS, readJson, wrap } from "./_lib/http"
import { clearCurrent } from "./_lib/store"

export { OPTIONS }

export function POST(req: Request) {
  return wrap(async () => {
    const body = await readJson(req)
    const denied = assertPresenter(req, body)
    if (denied) return denied
    await clearCurrent()
    return json({ current: null })
  })
}
