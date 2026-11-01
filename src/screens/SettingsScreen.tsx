// 알림 보기 방법과 소리를 나중에 바꾸는 화면.

import { ReadingLevelPicker, SoundSensitivePicker } from "../components/ViewModePicker"
import type { Profile, ReadingLevel } from "../data/profile"

export function SettingsScreen({
  back,
  profile,
  updateProfile,
}: {
  back: () => void
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
}) {
  return (
    <main className="proto-page settings-page">
      <button className="proto-back" onClick={back}>‹ 뒤로</button>
      <section className="page-heading compact">
        <h1>알림 보기 방법</h1>
        <p>언제든 바꿀 수 있어요.</p>
      </section>
      <section className="settings-block">
        <h2>어떻게 볼래요?</h2>
        <ReadingLevelPicker
          profile={profile}
          onChange={(readingLevel: ReadingLevel) => updateProfile({ readingLevel })}
        />
      </section>
      <section className="settings-block">
        <h2>큰 소리가 싫어요?</h2>
        <SoundSensitivePicker
          value={profile.soundSensitive}
          onChange={(soundSensitive) => updateProfile({ soundSensitive })}
        />
      </section>
    </main>
  )
}
