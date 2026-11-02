// 우리 집 사진. 휴대폰 안에만 두고, 서버로 보내지 않는다.

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"
import { Preferences } from "@capacitor/preferences"
import type { SafetyQuestionId } from "../data/safetyQuestions"

const HOME_PHOTO_KEY = "chacha-safety-home-photos"

export type HomePhotos = Partial<Record<SafetyQuestionId, string>>

export async function loadHomePhotos(): Promise<HomePhotos> {
  try {
    const { value } = await Preferences.get({ key: HOME_PHOTO_KEY })
    if (!value) return {}
    const parsed = JSON.parse(value) as HomePhotos
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export async function saveHomePhoto(id: SafetyQuestionId, dataUrl: string): Promise<void> {
  const current = await loadHomePhotos()
  current[id] = dataUrl
  await Preferences.set({ key: HOME_PHOTO_KEY, value: JSON.stringify(current) })
}

export async function takeHomePhoto(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 60,
      width: 1200,
    })
    return photo.dataUrl ?? null
  } catch {
    return null
  }
}
