import { assertPresenter, demoHandler, readJsonBody } from "../_lib/http"
import { clearCurrent } from "../_lib/store"
import type { DemoRequest, DemoResponse } from "../_lib/types"

export default async function handler(req: DemoRequest, res: DemoResponse) {
  await demoHandler(req, res, ["POST"], async () => {
    const body = readJsonBody(req)
    if (!assertPresenter(req, res, body)) return
    await clearCurrent()
    res.status(200).json({ current: null })
  })
}
