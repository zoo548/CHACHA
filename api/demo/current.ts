import { demoHandler } from "../_lib/http"
import { getCurrent } from "../_lib/store"
import type { DemoRequest, DemoResponse } from "../_lib/types"

export default async function handler(req: DemoRequest, res: DemoResponse) {
  await demoHandler(req, res, ["GET"], async () => {
    const current = await getCurrent()
    res.status(200).json({ current })
  })
}
