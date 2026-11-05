import { json, OPTIONS, wrap } from "./_lib/http"
import { pruneJoins } from "./_lib/store"

export { OPTIONS }

export function GET() {
  return wrap(async () => json({ count: await pruneJoins() }))
}
