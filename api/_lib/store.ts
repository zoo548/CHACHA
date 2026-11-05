import { Redis } from "@upstash/redis"
import type { DemoMessage } from "../../shared/demoDefaults"

const CURRENT_KEY = "chacha:demo:current"
const JOINS_KEY = "chacha:demo:joins"
const JOIN_MS = 10 * 60 * 1000

let redis: Redis | null = null

export function getRedis(): Redis {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error("redis_missing")
  redis = Redis.fromEnv()
  return redis
}

export async function getCurrent(): Promise<DemoMessage | null> {
  const value = await getRedis().get<DemoMessage>(CURRENT_KEY)
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

export async function setCurrent(message: DemoMessage): Promise<void> {
  await getRedis().set(CURRENT_KEY, message)
}

export async function clearCurrent(): Promise<void> {
  await getRedis().del(CURRENT_KEY)
}

function isDeviceId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,80}$/.test(value)
}

export async function joinDevice(deviceId: string): Promise<number> {
  if (!isDeviceId(deviceId)) throw new Error("bad_device_id")
  const client = getRedis()
  await client.hset(JOINS_KEY, { [deviceId]: String(Date.now() + JOIN_MS) })
  return pruneJoins()
}

export async function pruneJoins(): Promise<number> {
  const client = getRedis()
  const all = await client.hgetall<Record<string, string>>(JOINS_KEY)
  if (!all) return 0
  const now = Date.now()
  const expired: string[] = []
  let live = 0
  for (const [id, exp] of Object.entries(all)) {
    if (Number(exp) <= now) expired.push(id)
    else live += 1
  }
  if (expired.length > 0) await client.hdel(JOINS_KEY, ...expired)
  return live
}
