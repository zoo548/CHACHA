import { demoHandler } from "../_lib/http"
import { pruneJoins } from "../_lib/store"
import type { DemoRequest, DemoResponse } from "../_lib/types"

export default async function handler(req: DemoRequest, res: DemoResponse) {
  await demoHandler(req, res, ["GET"], async () => {
    const count = await pruneJoins()
    res.status(200).json({ count })
  })
}
