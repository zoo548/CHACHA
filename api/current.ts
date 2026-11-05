import { json, OPTIONS, wrap } from "./_lib/http"
import { getCurrent } from "./_lib/store"

export { OPTIONS }

export function GET() {
  return wrap(async () => json({ current: await getCurrent() }))
}
