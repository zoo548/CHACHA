// 휴대폰 좌표 → 시·군·구. 좌표는 서버로 보내지 않고 이 파일과 public/geo/sigungu.json 만 쓴다.

import { Capacitor } from "@capacitor/core"
import { Geolocation } from "@capacitor/geolocation"

export type Sigungu = {
  sido: string
  sigungu: string
}

export type RegionSource = "gps" | "card"

type Ring = number[][]
type Polygon = Ring[]
type Geom =
  | { type: "Polygon"; coordinates: Polygon }
  | { type: "MultiPolygon"; coordinates: Polygon[] }

export type SigunguFeature = {
  type: "Feature"
  properties: Sigungu
  geometry: Geom
  bbox?: [number, number, number, number]
}

export type SigunguCollection = {
  type: "FeatureCollection"
  features: SigunguFeature[]
}

const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
}

/** 긴 이름부터. "광주"는 광주광역시·경기도 광주시와 겹쳐서 맨 뒤에 둔다. */
const SIDO_ALIASES: Array<[string, string]> = [
  ["서울특별시", "서울특별시"],
  ["부산광역시", "부산광역시"],
  ["대구광역시", "대구광역시"],
  ["인천광역시", "인천광역시"],
  ["광주광역시", "광주광역시"],
  ["대전광역시", "대전광역시"],
  ["울산광역시", "울산광역시"],
  ["세종특별자치시", "세종특별자치시"],
  ["강원특별자치도", "강원특별자치도"],
  ["전북특별자치도", "전북특별자치도"],
  ["제주특별자치도", "제주특별자치도"],
  ["경기도", "경기도"],
  ["강원도", "강원특별자치도"],
  ["충청북도", "충청북도"],
  ["충청남도", "충청남도"],
  ["전라북도", "전북특별자치도"],
  ["전라남도", "전라남도"],
  ["경상북도", "경상북도"],
  ["경상남도", "경상남도"],
  ["서울시", "서울특별시"],
  ["부산시", "부산광역시"],
  ["대구시", "대구광역시"],
  ["인천시", "인천광역시"],
  ["광주시", "광주광역시"],
  ["대전시", "대전광역시"],
  ["울산시", "울산광역시"],
  ["세종시", "세종특별자치시"],
  ["제주도", "제주특별자치도"],
  ["경기", "경기도"],
  ["강원", "강원특별자치도"],
  ["충북", "충청북도"],
  ["충남", "충청남도"],
  ["전북", "전북특별자치도"],
  ["전남", "전라남도"],
  ["경북", "경상북도"],
  ["경남", "경상남도"],
  ["서울", "서울특별시"],
  ["부산", "부산광역시"],
  ["대구", "대구광역시"],
  ["인천", "인천광역시"],
  ["대전", "대전광역시"],
  ["울산", "울산광역시"],
  ["세종", "세종특별자치시"],
  ["제주", "제주특별자치도"],
  ["광주", "광주광역시"],
]

export const GPS_INTERVAL_MS = 30 * 60 * 1000
const GPS_WAIT_MS = 10_000

let geoCache: SigunguCollection | null = null
let geoLoading: Promise<SigunguCollection> | null = null

function compact(text: string): string {
  return text.replace(/\s+/g, "")
}

function bboxOf(geom: Geom): [number, number, number, number] {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates
  for (const poly of polys) {
    for (const ring of poly) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  return [minX, minY, maxX, maxY]
}

function withBboxes(geo: SigunguCollection): SigunguCollection {
  for (const f of geo.features) {
    if (!f.bbox) f.bbox = bboxOf(f.geometry)
  }
  return geo
}

export async function loadSigunguGeo(): Promise<SigunguCollection> {
  if (geoCache) return geoCache
  if (!geoLoading) {
    const url = `${import.meta.env.BASE_URL}geo/sigungu.json`
    geoLoading = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`geo_${res.status}`)
        return res.json() as Promise<SigunguCollection>
      })
      .then((geo) => {
        geoCache = withBboxes(geo)
        return geoCache
      })
      .catch((err) => {
        geoLoading = null
        throw err
      })
  }
  return geoLoading
}

/** 테스트에서 이미 읽은 GeoJSON 을 쓸 때. */
export function useSigunguGeo(geo: SigunguCollection): SigunguCollection {
  geoCache = withBboxes(geo)
  return geoCache
}

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const hit = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (hit) inside = !inside
  }
  return inside
}

function pointInPolygon(lng: number, lat: number, rings: Polygon): boolean {
  if (rings.length === 0) return false
  if (!pointInRing(lng, lat, rings[0])) return false
  for (let h = 1; h < rings.length; h++) {
    if (pointInRing(lng, lat, rings[h])) return false
  }
  return true
}

function pointInGeom(lng: number, lat: number, geom: Geom): boolean {
  if (geom.type === "Polygon") return pointInPolygon(lng, lat, geom.coordinates)
  return geom.coordinates.some((poly) => pointInPolygon(lng, lat, poly))
}

export function findSigungu(
  lng: number,
  lat: number,
  geo: SigunguCollection,
): Sigungu | null {
  for (const f of geo.features) {
    const box = f.bbox
    if (box && (lng < box[0] || lng > box[2] || lat < box[1] || lat > box[3])) continue
    if (pointInGeom(lng, lat, f.geometry)) return f.properties
  }
  return null
}

export function formatRegionQuery(region: Sigungu): string {
  return `${region.sido} ${region.sigungu}`.trim()
}

export function formatRegionLabel(region: Sigungu): string {
  const short = SIDO_SHORT[region.sido] ?? region.sido
  if (region.sido === "세종특별자치시") return short
  return `${short} ${region.sigungu}`
}

export function locationBanner(region: Sigungu | null): string {
  if (!region) return ""
  return `지금 위치: ${formatRegionLabel(region)}`
}

function splitSido(address: string): { sido: string | null; rest: string } {
  const trimmed = address.trim()
  for (const [alias, sido] of SIDO_ALIASES) {
    if (trimmed === alias || trimmed.startsWith(`${alias} `) || trimmed.startsWith(alias)) {
      const rest = trimmed.slice(alias.length).trim()
      return { sido, rest }
    }
  }
  return { sido: null, rest: trimmed }
}

function matchSigungu(text: string, candidates: Sigungu[]): Sigungu | null {
  const compactText = compact(text)
  if (!compactText) return null
  const hits = candidates.filter((c) => compactText.includes(compact(c.sigungu)))
  let bestLen = 0
  for (const c of hits) bestLen = Math.max(bestLen, compact(c.sigungu).length)
  const best = hits.filter((c) => compact(c.sigungu).length === bestLen)
  if (best.length === 1) return best[0]
  if (best.length > 1 && new Set(best.map((c) => c.sido)).size === 1) return best[0]
  return null
}

/** 내 카드 주소 문자열에서 시·군·구를 고른다. */
export function parseAddressRegion(address: string, geo: SigunguCollection): Sigungu | null {
  const text = address.trim()
  if (!text) return null
  const { sido, rest } = splitSido(text)
  const pool = sido ? geo.features.filter((f) => f.properties.sido === sido).map((f) => f.properties) : geo.features.map((f) => f.properties)
  const hit = matchSigungu(rest || text, pool)
  if (hit) return hit
  if (sido && !rest) {
    const only = pool.length === 1 ? pool[0] : null
    if (only) return only
    return { sido, sigungu: sido === "세종특별자치시" ? "세종시" : "" }
  }
  return null
}

export async function readDeviceCoords(): Promise<{ lng: number; lat: number } | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await Geolocation.requestPermissions()
      const ok = perm.location === "granted" || perm.coarseLocation === "granted"
      if (!ok) return null
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: GPS_WAIT_MS,
        maximumAge: GPS_INTERVAL_MS,
      })
      return { lng: pos.coords.longitude, lat: pos.coords.latitude }
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) return null
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: GPS_WAIT_MS,
        maximumAge: GPS_INTERVAL_MS,
      })
    })
    return { lng: pos.coords.longitude, lat: pos.coords.latitude }
  } catch {
    return null
  }
}

/** 권한 거부·실패·경계 밖이면 null. 호출하는 쪽에서 카드 주소로 대체한다. */
export async function detectSigungu(): Promise<Sigungu | null> {
  const coords = await readDeviceCoords()
  if (!coords) return null
  try {
    const geo = await loadSigunguGeo()
    return findSigungu(coords.lng, coords.lat, geo)
  } catch {
    return null
  }
}

export function alertRegionQuery(
  source: RegionSource,
  gps: Sigungu | null,
  cardAddress: string,
  geo: SigunguCollection | null,
): string {
  if (source === "gps" && gps) return formatRegionQuery(gps)
  if (geo) {
    const fromCard = parseAddressRegion(cardAddress, geo)
    if (fromCard) return formatRegionQuery(fromCard)
  }
  return cardAddress.trim()
}

export function displayRegion(
  gps: Sigungu | null,
  cardAddress: string,
  geo: SigunguCollection | null,
): Sigungu | null {
  if (gps) return gps
  if (geo) return parseAddressRegion(cardAddress, geo)
  return null
}
