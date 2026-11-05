// 앱을 열 때와 30분마다만 위치를 본다. 좌표는 기기에만 둔다.

import { Preferences } from "@capacitor/preferences"
import { useCallback, useEffect, useState } from "react"
import {
  GPS_INTERVAL_MS,
  detectSigungu,
  loadSigunguGeo,
  type RegionSource,
  type Sigungu,
  type SigunguCollection,
} from "./region"

const SOURCE_KEY = "chacha-region-source-v1"

async function loadSource(): Promise<RegionSource> {
  try {
    const { value } = await Preferences.get({ key: SOURCE_KEY })
    return value === "card" ? "card" : "gps"
  } catch {
    return "gps"
  }
}

async function saveSource(source: RegionSource): Promise<void> {
  try {
    await Preferences.set({ key: SOURCE_KEY, value: source })
  } catch {
    /* ignore */
  }
}

export function useDeviceRegion(enabled: boolean) {
  const [geo, setGeo] = useState<SigunguCollection | null>(null)
  const [gps, setGps] = useState<Sigungu | null>(null)
  const [source, setSource] = useState<RegionSource>("gps")

  useEffect(() => {
    loadSigunguGeo()
      .then(setGeo)
      .catch(() => setGeo(null))
    loadSource().then(setSource)
  }, [])

  const refreshGps = useCallback(async () => {
    if (!enabled) return
    const found = await detectSigungu()
    setGps(found)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    ;(async () => {
      const found = await detectSigungu()
      if (!cancelled) setGps(found)
    })()
    const id = window.setInterval(() => {
      void refreshGps()
    }, GPS_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [enabled, refreshGps])

  const chooseSource = useCallback((next: RegionSource) => {
    setSource(next)
    void saveSource(next)
    if (next === "gps") void refreshGps()
  }, [refreshGps])

  return { geo, gps, source, chooseSource }
}
