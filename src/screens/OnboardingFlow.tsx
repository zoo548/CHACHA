// 처음 쓰는 사람 안내 (13단계).
// 0: 시작 / 1: 소개 / 2: 보호자와 함께 /
// 3~7: 내 카드 만들기 5단계 / 8: 카드 완성 /
// 9: 알림 켜기 / 10: 차차등 연결 / 11: 연습 알림 / 12: 끝
//
// 3~7단계의 입력칸·칩은 전부 profile 값과 연결돼 있다.
// 저장은 OnboardingFlow 가 아니라 바깥 App 에서 updateProfile() 로 내려준다.

import { useState } from "react"
import { Icon } from "../components/Icon"
import { Logo } from "../components/Logo"
import { MiniCard } from "../components/MiniCard"
import { OnboardHeader } from "../components/OnboardHeader"
import { ProtoButton } from "../components/ProtoButton"
import { ProtoChips } from "../components/ProtoChips"
import { ProtoField } from "../components/ProtoField"
import { ProtoGuardian } from "../components/ProtoGuardian"
import { TogetherIllustration } from "../components/TogetherIllustration"
import type { Contact, Institution, Profile } from "../data/profile"
import type { IconName, SheetKind } from "../types"

const titles = [
  "",
  "차차는 이런 일을 해요",
  "보호자와 함께 해요",
  "내 이름을 적어요",
  "도와줄 사람",
  "또 다른 사람",
  "기관",
  "나에 대해",
  "카드를 만들었어요",
  "알림을 켜요",
  "차차등을 연결해요",
  "연습해 봐요",
  "준비가 끝났어요",
]

const introRows: [IconName, string][] = [
  ["bell", "재난문자를 쉬운 말로 바꿔 줘요."],
  ["list", "지금 할 일을 순서대로 알려줘요."],
  ["call", "도와줄 사람에게 바로 전화해요."],
]

const arrivalOptions = ["30분 안에", "1시간 안에", "더 걸려요"]

export function OnboardingFlow({
  step,
  setStep,
  openSheet,
  openPdf,
  openPractice,
  finish,
  startSafety,
  profile,
  updateProfile,
}: {
  step: number
  setStep: (step: number) => void
  openSheet: (sheet: SheetKind) => void
  openPdf: () => void
  openPractice: () => void
  finish: () => void
  startSafety: () => void
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
}) {
  const [lightState, setLightState] = useState(0)
  const back = step > 0 ? () => setStep(step - 1) : undefined
  const skip = [0, 1, 2, 9, 10, 11, 12].includes(step) ? finish : undefined
  const next = () => setStep(step + 1)

  // 짧은 이름 — 보호자/이웃 중첩 필드 업데이트 헬퍼
  const setGuardian = (patch: Partial<Contact>) =>
    updateProfile({ guardian: { ...profile.guardian, ...patch } })
  const setNeighbor = (patch: Partial<Contact>) =>
    updateProfile({ neighbor: { ...profile.neighbor, ...patch } })
  const setInstitution = (patch: Partial<Institution>) =>
    updateProfile({ institution: { ...profile.institution, ...patch } })

  // 다음 버튼이 켜져야 하는 조건 (필수 입력)
  const canNext =
    step !== 3 && step !== 4 && step !== 7
      ? true
      : step === 3
        ? profile.name.trim().length > 0
        : step === 4
          ? profile.guardian.name.trim().length > 0 &&
            profile.guardian.relation.trim().length > 0 &&
            profile.guardian.phone.trim().length > 0
          : /* step 7 */ profile.address.trim().length > 0

  return (
    <section className="onboard-screen">
      <OnboardHeader step={step} back={back} skip={skip} />
      <main className={`onboard-body ${step === 7 ? "scrolling" : ""}`}>
        {step === 0 && (
          <div className="onboard-start">
            <Logo large />
            <p>
              <span className="text-center">차분하게, 차근차근</span>
              <span className="text-center">재난 때 해야 할 일을 알려줘요.</span>
            </p>
          </div>
        )}
        {step > 0 && step < 8 && (
          <>
            {step >= 3 && <b className="card-progress">내 카드 {step - 2}/5</b>}
            <h1>{titles[step]}</h1>
          </>
        )}
        {step === 1 && (
          <div className="proto-list plain">
            {introRows.map(([icon, text]) => (
              <div key={text}>
                <span><Icon name={icon} /></span>
                <b>{text}</b>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <>
            <TogetherIllustration />
            <p className="onboard-description">
              <span>도와줄 사람을 같이 적어요.</span>
              <span>10분이면 돼요.</span>
            </p>
            <ProtoGuardian>사용자 옆에서 함께 읽고 입력해 주세요.</ProtoGuardian>
          </>
        )}
        {step === 3 && (
          <div className="proto-fields">
            <ProtoField
              label="이름"
              placeholder="예) 김민수"
              required
              value={profile.name}
              onChange={(name) => updateProfile({ name })}
            />
            <ProtoGuardian>인쇄용 카드에 들어가요.</ProtoGuardian>
          </div>
        )}
        {step === 4 && (
          <>
            <p className="onboard-description">급할 때 가장 먼저 전화할 사람이에요.</p>
            <div className="proto-fields">
              <ProtoField
                label="이름"
                placeholder="예) 김영희"
                required
                value={profile.guardian.name}
                onChange={(name) => setGuardian({ name })}
              />
              <ProtoField
                label="나와의 관계"
                placeholder="예) 엄마"
                required
                value={profile.guardian.relation}
                onChange={(relation) => setGuardian({ relation })}
              />
              <ProtoField
                label="전화번호"
                placeholder="010-0000-0000"
                required
                kind="tel"
                value={profile.guardian.phone}
                onChange={(phone) => setGuardian({ phone })}
              />
              <ProtoChips
                title="우리 집까지 오는 시간"
                items={arrivalOptions}
                value={profile.guardian.arrival}
                onChange={(arrival) => setGuardian({ arrival })}
              />
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <p className="onboard-description">첫 번째 사람이 전화를 안 받을 때 걸어요.</p>
            <div className="proto-fields">
              <ProtoField
                label="이름"
                placeholder="예) 박민수"
                value={profile.neighbor.name}
                onChange={(name) => setNeighbor({ name })}
              />
              <ProtoField
                label="나와의 관계"
                placeholder="예) 이웃"
                value={profile.neighbor.relation}
                onChange={(relation) => setNeighbor({ relation })}
              />
              <ProtoField
                label="전화번호"
                placeholder="010-0000-0000"
                kind="tel"
                value={profile.neighbor.phone}
                onChange={(phone) => setNeighbor({ phone })}
              />
              <ProtoChips
                title="우리 집까지 오는 시간"
                items={arrivalOptions}
                value={profile.neighbor.arrival}
                onChange={(arrival) => setNeighbor({ arrival })}
              />
              <ProtoGuardian>적지 않으면 알림에서 이 사람에게 전화하는 줄이 없어요.</ProtoGuardian>
            </div>
          </>
        )}
        {step === 6 && (
          <>
            <p className="onboard-description">복지관이나 센터를 적어요.</p>
            <div className="proto-fields">
              <ProtoField
                label="기관 이름"
                placeholder="예) 관악복지관"
                value={profile.institution.name}
                onChange={(name) => setInstitution({ name })}
              />
              <ProtoField
                label="전화번호"
                placeholder="02-000-0000"
                kind="tel"
                value={profile.institution.phone}
                onChange={(phone) => setInstitution({ phone })}
              />
            </div>
          </>
        )}
        {step === 7 && (
          <div className="proto-fields">
            <ProtoField
              label="우리 집 주소"
              placeholder="예) 관악구 신림동 00-00 101호"
              required
              value={profile.address}
              onChange={(address) => updateProfile({ address })}
            />
            <ProtoGuardian>층과 호수까지 적어 주세요. 이 동네에 오는 재난문자를 알려줘요.</ProtoGuardian>
            <ProtoField
              label="내가 갈 대피소"
              placeholder="예) 신림초등학교"
              action="찾기"
              onAction={() => openSheet("location")}
              value={profile.shelter}
              onChange={(shelter) => updateProfile({ shelter })}
            />
            <ProtoChips
              title="나에게 편한 소통 방법(여러 개)"
              items={["짧은 문장으로 말해 주세요", "천천히 말해 주세요", "글로 써 주세요", "그림으로 보여 주세요", "직접 적기"]}
              multi
              value={profile.communication}
              onChange={(communication) => updateProfile({ communication })}
            />
            <ProtoChips
              title="이동할 때 필요한 도움"
              items={["혼자 갈 수 있어요", "같이 걸어 주세요", "직접 적기"]}
              value={profile.mobility}
              onChange={(mobility) => updateProfile({ mobility })}
            />
            <ProtoField
              label="힘든 것"
              placeholder="예) 큰 소리를 무서워해요"
              value={profile.hardThing}
              onChange={(hardThing) => updateProfile({ hardThing })}
            />
            <ProtoField
              label="꼭 챙길 물건"
              placeholder="예) 약, 물, 휴대폰"
              value={profile.bring}
              onChange={(bring) => updateProfile({ bring })}
            />
          </div>
        )}
        {step === 8 && (
          <>
            <MiniCard />
            <h1>{titles[step]}</h1>
            <p className="onboard-description">이제 휴대폰을 준비해요.</p>
          </>
        )}
        {step === 9 && (
          <>
            <div className="phone-drawing">
              <Icon name="phone" />
              <span>
                <Logo />
                <b>재난문자가 왔어요</b>
              </span>
            </div>
            <h1>{titles[step]}</h1>
            <p className="onboard-description">재난문자가 오면 바로 알려줘요.</p>
          </>
        )}
        {step === 10 && (
          <>
            <div className={`proto-light ${lightState === 3 ? "lit" : ""}`}>
              <span><Icon name="light" /></span>
              <i />
              <Icon name="phone" />
            </div>
            <h1>{titles[step]}</h1>
            <p className="onboard-description">차차등의 손바닥 버튼을 3초 눌러요.</p>
            {lightState > 0 && (
              <section className="device-result">
                {lightState === 1 && <b>찾는 중 · · ·</b>}
                {lightState === 2 && (
                  <>
                    <b>chachadeung</b>
                    <button onClick={() => setLightState(3)}>연결하기</button>
                  </>
                )}
                {lightState === 3 && (
                  <>
                    <b>차차등에 노란불이 켜졌나요?</b>
                    <div>
                      <button onClick={next}>네</button>
                      <button onClick={next}>아니요</button>
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}
        {step === 11 && (
          <>
            <span className="practice-icon"><Icon name="bell" /></span>
            <h1>{titles[step]}</h1>
            <p className="onboard-description">
              <span>연습 알림을 보낼게요.</span>
              <span>다 읽고 "알았어요"를 눌러요.</span>
            </p>
          </>
        )}
        {step === 12 && (
          <>
            <span className="done-check"><Icon name="check" /></span>
            <h1>{titles[step]}</h1>
            <p className="onboard-description">재난문자가 오면 차차가 알려줄게요.</p>
            <button className="proto-row safety-row" onClick={startSafety}>
              <span><Icon name="home" /></span>
              <b>우리 집 안전 점검<small>5분이면 돼요.</small></b>
              <i>›</i>
            </button>
          </>
        )}
      </main>
      <footer className="proto-fixed">
        {step === 7 && (
          <p className="privacy">
            <Icon name="lock" />
            적은 내용은 내 휴대폰에만 저장돼요.
          </p>
        )}
        {step === 0 && <ProtoButton onClick={next}>시작하기</ProtoButton>}
        {step === 1 && <ProtoButton onClick={next}>다음</ProtoButton>}
        {step === 2 && <ProtoButton onClick={next}>카드 만들기 시작</ProtoButton>}
        {step === 3 && (
          <ProtoButton onClick={canNext ? next : undefined} disabled={!canNext}>
            다음
          </ProtoButton>
        )}
        {step === 4 && (
          <ProtoButton
            onClick={canNext ? () => openSheet("phone-permission") : undefined}
            disabled={!canNext}
          >
            다음
          </ProtoButton>
        )}
        {step === 5 && (
          <>
            <ProtoButton onClick={next}>다음</ProtoButton>
            <ProtoButton text onClick={next}>지금은 건너뛸게요</ProtoButton>
          </>
        )}
        {step === 6 && (
          <>
            <ProtoButton onClick={next}>다음</ProtoButton>
            <ProtoButton text onClick={next}>지금은 건너뛸게요</ProtoButton>
          </>
        )}
        {step === 7 && (
          <ProtoButton onClick={canNext ? next : undefined} disabled={!canNext}>
            카드 저장하기
          </ProtoButton>
        )}
        {step === 8 && (
          <>
            <ProtoButton onClick={next}>다음</ProtoButton>
            <ProtoButton text onClick={openPdf}>카드 PDF로 저장하기</ProtoButton>
          </>
        )}
        {step === 9 && <ProtoButton onClick={next}>알림 켜기</ProtoButton>}
        {step === 10 && (
          <>
            <ProtoButton
              onClick={() =>
                lightState === 0 ? setLightState(1) : lightState === 1 ? setLightState(2) : setLightState(3)
              }
            >
              {lightState === 0 ? "찾기" : lightState === 1 ? "찾는 중" : lightState === 2 ? "연결하기" : "다음"}
            </ProtoButton>
            <ProtoButton text onClick={next}>차차등이 없어요</ProtoButton>
          </>
        )}
        {step === 11 && <ProtoButton onClick={openPractice}>연습 알림 보내기</ProtoButton>}
        {step === 12 && <ProtoButton onClick={finish}>홈으로</ProtoButton>}
      </footer>
    </section>
  )
}
