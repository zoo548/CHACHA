// 알림 보기 방법과 소리를 나중에 바꾸는 화면.

import { ProtoButton } from "../components/ProtoButton"
import { ReadingLevelPicker, SoundSensitivePicker } from "../components/ViewModePicker"
import type { DeviceVoice } from "../alerts/level"
import { soundCommand } from "../alerts/tier"
import type { Profile, ReadingLevel } from "../data/profile"
import { useDevice } from "../device/DeviceContext"

export function SettingsScreen({
  back,
  openCredits,
  openSamples,
  profile,
  updateProfile,
}: {
  back: () => void
  openCredits: () => void
  openSamples: () => void
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
}) {
  const device = useDevice()

  const setVoice = (chachaVoice: DeviceVoice) => {
    updateProfile({ chachaVoice })
    device.send(chachaVoice).catch(() => {})
  }

  const setSoundSensitive = (soundSensitive: boolean) => {
    updateProfile({ soundSensitive })
    device.send(soundCommand(soundSensitive)).catch(() => {})
  }

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
          onChange={setSoundSensitive}
        />
      </section>
      <section className="settings-block">
        <h2>차차등 목소리</h2>
        <p>차차등이 말하는 목소리를 골라요.</p>
        <div className="voice-pick">
          <button
            type="button"
            className={profile.chachaVoice === "F" ? "active" : ""}
            onClick={() => setVoice("F")}
          >
            여성
          </button>
          <button
            type="button"
            className={profile.chachaVoice === "M" ? "active" : ""}
            onClick={() => setVoice("M")}
          >
            남성
          </button>
        </div>
      </section>
      <section className="settings-block">
        <h2>예시 화면 보기</h2>
        <p>알림 화면을 미리 봐요.</p>
        <ProtoButton secondary onClick={openSamples}>예시 화면 보기</ProtoButton>
      </section>
      <button className="credits-link" type="button" onClick={openCredits}>
        그림 일부: Mulberry Symbols © Steve Lee, CC BY-SA 4.0
      </button>
    </main>
  )
}
