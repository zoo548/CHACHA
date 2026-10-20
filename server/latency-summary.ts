// pnpm latency — latency.csv 요약 (평균 / 가장 빠름 / 가장 늦음 / 건수).

import { readFile } from "node:fs/promises"
import { LATENCY_FILE } from "./alerts-core.ts"

try {
  const raw = await readFile(LATENCY_FILE, "utf8")
  const rows = raw
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",")
      return Number(parts[parts.length - 1])
    })
    .filter((n) => Number.isFinite(n))

  if (rows.length === 0) {
    console.log("기록된 지연이 없어요. 서버가 새 문자를 받은 뒤에 다시 실행하세요.")
    process.exit(0)
  }

  const sum = rows.reduce((a, b) => a + b, 0)
  const avg = sum / rows.length
  const fastest = Math.min(...rows)
  const slowest = Math.max(...rows)
  const fmt = (ms: number) => `${(ms / 1000).toFixed(1)}초 (${Math.round(ms)}ms)`

  console.log(`건수        ${rows.length}`)
  console.log(`평균        ${fmt(avg)}`)
  console.log(`가장 빠름   ${fmt(fastest)}`)
  console.log(`가장 늦음   ${fmt(slowest)}`)
} catch {
  console.log("server/data/latency.csv 가 아직 없어요. 서버를 켜고 새 문자가 올 때까지 기다리세요.")
  process.exit(0)
}
