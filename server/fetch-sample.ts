// 업스트림 1페이지를 그대로 받아 server/data/sample.json 에 저장.
// 키는 로그에 남기지 않는다.

import { config } from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { writeFile, mkdir } from "node:fs/promises"
import { API_URL, DATA_DIR, seoulYmd } from "./alerts-core.ts"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(here, ".env.local") })

const key = (process.env.SAFETYDATA_KEY || "").trim()
if (!key) {
  console.error("SAFETYDATA_KEY 가 비어 있어요. .env.local 을 확인하세요.")
  process.exit(1)
}

const url = new URL(API_URL)
url.searchParams.set("serviceKey", key)
url.searchParams.set("returnType", "json")
url.searchParams.set("pageNo", "1")
url.searchParams.set("numOfRows", "5")
url.searchParams.set("crtDt", seoulYmd())

const res = await fetch(url, { headers: { Accept: "application/json" } })
const text = await res.text()
await mkdir(DATA_DIR, { recursive: true })
const out = resolve(DATA_DIR, "sample.json")
await writeFile(out, text, "utf8")
console.log(`HTTP ${res.status} → ${out}`)
console.log(text.slice(0, 800))
