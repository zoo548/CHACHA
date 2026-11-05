import { randomUUID, timingSafeEqual } from "node:crypto"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-demo-key",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

const CURRENT_KEY = "chacha:demo:current"
const JOINS_KEY = "chacha:demo:joins"
const JOIN_MS = 10 * 60 * 1000

const DEFAULT_DEMO_MESSAGE =
  "[관악구] 신림동 호우경보 발효. 하천 주변, 계곡, 급경사지, 농수로 등 위험지역 출입 금지, 대피권고를 받으면 즉시 대피하세요."
const DEFAULT_DEMO_SENDER = "관악구청"
const DEFAULT_DEMO_GOV_TYPE = "안전안내문자"

let redis = null

async function getRedis() {
  if (redis) return redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("redis_missing")
  }
  const { Redis } = await import("@upstash/redis")
  redis = Redis.fromEnv()
  return redis
}

function setCors(res) {
  for (const [key, value] of Object.entries(CORS)) res.setHeader(key, value)
}

function clip(value, fallback, max) {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text) return fallback
  return text.slice(0, max)
}

function opOf(req) {
  const queryOp = req.query && typeof req.query.op === "string" ? req.query.op : ""
  if (queryOp) return queryOp
  const url = typeof req.url === "string" ? req.url : ""
  const path = url.split("?")[0]
  const parts = path.split("/").filter(Boolean)
  return parts[parts.length - 1] ?? ""
}

function readBody(req) {
  const body = req.body
  if (body && typeof body === "object" && !Array.isArray(body)) return body
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
    } catch {
      return {}
    }
  }
  return {}
}

function presenterKey(req, body) {
  const header = req.headers["x-demo-key"]
  if (typeof header === "string" && header) return header
  const auth = req.headers.authorization
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim()
  }
  return typeof body.key === "string" ? body.key : ""
}

function keysMatch(given, expected) {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function assertPresenter(req, body) {
  const expected = process.env.DEMO_PRESENTER_KEY?.trim() ?? ""
  if (!expected) return { status: 503, body: { error: "presenter_key_missing" } }
  if (!keysMatch(presenterKey(req, body), expected)) {
    return { status: 401, body: { error: "unauthorized" } }
  }
  return null
}

async function getCurrent() {
  const value = await getRedis().then((client) => client.get(CURRENT_KEY))
  if (!value || typeof value !== "object") return null
  if (typeof value.id !== "string" || typeof value.message !== "string") return null
  return {
    id: value.id,
    sentAt: typeof value.sentAt === "string" ? value.sentAt : "",
    message: value.message,
    sender: typeof value.sender === "string" ? value.sender : "",
    govType: typeof value.govType === "string" ? value.govType : "",
  }
}

async function pruneJoins() {
  const client = await getRedis()
  const all = await client.hgetall(JOINS_KEY)
  if (!all) return 0
  const now = Date.now()
  const expired = []
  let live = 0
  for (const [id, exp] of Object.entries(all)) {
    if (Number(exp) <= now) expired.push(id)
    else live += 1
  }
  if (expired.length > 0) await client.hdel(JOINS_KEY, ...expired)
  return live
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  try {
    const op = opOf(req)
    const method = req.method ?? "GET"
    const body = readBody(req)

    if ((op === "current" || op === "api" || op === "") && method === "GET") {
      res.status(200).json({ current: await getCurrent() })
      return
    }
    if (op === "count" && method === "GET") {
      res.status(200).json({ count: await pruneJoins() })
      return
    }
    if (op === "join" && method === "POST") {
      const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : ""
      if (!/^[A-Za-z0-9_-]{8,80}$/.test(deviceId)) {
        res.status(400).json({ error: "bad_device_id" })
        return
      }
      const client = await getRedis()
      await client.hset(JOINS_KEY, { [deviceId]: String(Date.now() + JOIN_MS) })
      res.status(200).json({ ok: true, count: await pruneJoins() })
      return
    }
    if (op === "send" && method === "POST") {
      const denied = assertPresenter(req, body)
      if (denied) {
        res.status(denied.status).json(denied.body)
        return
      }
      const current = {
        id: randomUUID(),
        sentAt: new Date().toISOString(),
        message: clip(body.message, DEFAULT_DEMO_MESSAGE, 1000),
        sender: clip(body.sender, DEFAULT_DEMO_SENDER, 40),
        govType: clip(body.govType, DEFAULT_DEMO_GOV_TYPE, 40),
      }
      await getRedis().then((client) => client.set(CURRENT_KEY, current))
      res.status(200).json({ current })
      return
    }
    if (op === "reset" && method === "POST") {
      const denied = assertPresenter(req, body)
      if (denied) {
        res.status(denied.status).json(denied.body)
        return
      }
      await getRedis().then((client) => client.del(CURRENT_KEY))
      res.status(200).json({ current: null })
      return
    }

    res.status(404).json({ error: "not_found", op, method })
  } catch (err) {
    const message = err instanceof Error ? err.message : "error"
    console.error("[demo]", message)
    if (message === "redis_missing") {
      res.status(503).json({ error: "redis_missing" })
      return
    }
    res.status(500).json({ error: "server_error", message })
  }
}
