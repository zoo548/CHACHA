// 우리 집 안전 점검 플로우.
// 1) SafetyStart: 집 유형 선택 (반지하/1층/2층 이상 — 반지하면 추가 질문)
// 2) SafetyQuestionScreen: 질문별 선택 + 해설
// 3) SafetyResult: 결과 요약 + 도움 보내기 + 다시 점검
//
// 저장소: @capacitor/preferences (아이폰 UserDefaults, 안드로이드 SharedPreferences, 웹 localStorage).
// 중간에 나갔다 와도 이어서 할 수 있고, 서버 전송은 하지 않는다.

import { useEffect, useState } from "react"
import { Preferences } from "@capacitor/preferences"
import {
  Backpack,
  Building2,
  DoorClosed,
  FireExtinguisher,
  House,
  Info,
  Shield,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react"

import { Icon } from "../components/Icon"
import { ProtoButton } from "../components/ProtoButton"
import { ProtoGuardian } from "../components/ProtoGuardian"
import { safetyQuestions, type SafetyAnswer, type SafetyQuestion } from "../data/safetyQuestions"
import type { Contact, Profile } from "../data/profile"

const SAFETY_STATE_KEY = "chacha-safety-check"
const SAFETY_COMPLETE_KEY = "chacha-safety-complete"

type SafetyState = {
  home: string
  index: number
  answers: Record<number, SafetyAnswer>
  complete: boolean
  prepared: boolean
}

// --- 공통 작은 조각 -----------------------------------------------------

function SafetyTop({
  current,
  total,
  back,
}: {
  current: number
  total: number
  back: () => void
}) {
  return (
    <header className="safety-top">
      <div>
        <button onClick={back}>‹ 뒤로</button>
        <b>{current} / {total}</b>
      </div>
      <span>
        <i style={{ width: `${(current / total) * 100}%` }} />
      </span>
    </header>
  )
}

function SafetyIconTile({ icon: SafetyIcon }: { icon: LucideIcon }) {
  return (
    <div className="safety-icon-tile">
      <SafetyIcon aria-hidden="true" size={56} strokeWidth={2} />
    </div>
  )
}

// --- 1단계: 집 유형 고르기 -----------------------------------------------

function SafetyStart({
  onStart,
  back,
}: {
  onStart: (home: string) => void
  back: () => void
}) {
  const [home, setHome] = useState("")
  const homes: [LucideIcon, string][] = [
    [Warehouse, "반지하"],
    [House, "1층"],
    [Building2, "2층 이상"],
  ]
  return (
    <section className="safety-screen">
      <SafetyTop current={1} total={15} back={back} />
      <main className="safety-start">
        <h1>우리 집 안전 점검</h1>
        <p>우리 집에 맞는 것만 물어볼게요. 5분이면 돼요.</p>
        <ProtoGuardian>사용자와 함께 집을 둘러보며 답해 주세요.</ProtoGuardian>
        <h2>우리 집은 어떤 곳인가요?</h2>
        <div className="home-options">
          {homes.map(([HomeIcon, label]) => (
            <button
              className={home === label ? "selected" : ""}
              onClick={() => setHome(label)}
              key={label}
            >
              <span><HomeIcon size={26} strokeWidth={2} /></span>
              <b>{label}</b>
              {home === label && <Icon name="check" />}
            </button>
          ))}
        </div>
      </main>
      <footer className="safety-fixed">
        <button className="proto-button" disabled={!home} onClick={() => onStart(home)}>
          시작하기
        </button>
      </footer>
    </section>
  )
}

// --- 2단계: 질문 ---------------------------------------------------------

function SafetyQuestionScreen({
  question,
  current,
  total,
  answer,
  choose,
  next,
  back,
}: {
  question: SafetyQuestion
  current: number
  total: number
  answer?: SafetyAnswer
  choose: (answer: SafetyAnswer) => void
  next: () => void
  back: () => void
}) {
  const options = [...question.answers, "잘 모르겠어요"]
  return (
    <section className="safety-screen">
      <SafetyTop current={current} total={total} back={back} />
      <main className="safety-question">
        <em>{question.category}</em>
        <SafetyIconTile icon={question.icon} />
        <h1>{question.question}</h1>
        <p>{question.description}</p>
        <div className="answer-options">
          {options.map((option, index) => (
            <button
              className={answer === index ? "selected" : ""}
              onClick={() => choose(index as SafetyAnswer)}
              key={option}
            >
              <b>{option}</b>
              {answer === index && <Icon name="check" />}
            </button>
          ))}
        </div>
        {answer !== undefined && answer > 0 && (
          <aside className="safety-tip">
            <Info size={24} strokeWidth={2} />
            <div>
              <b>이렇게 해요</b>
              <p>{question.tip}</p>
            </div>
          </aside>
        )}
      </main>
      <footer className="safety-fixed">
        <button className="proto-button" disabled={answer === undefined} onClick={next}>
          다음
        </button>
      </footer>
    </section>
  )
}

// --- 결과 상세/보내기 바텀시트 ------------------------------------------

function SafetyDetailSheet({
  complete,
  close,
}: {
  complete: () => void
  close: () => void
}) {
  return (
    <div className="proto-sheet-wrap" onClick={close}>
      <section className="proto-sheet safety-detail" onClick={(event) => event.stopPropagation()}>
        <i />
        <SafetyIconTile icon={FireExtinguisher} />
        <h2>소화기 준비하기</h2>
        <ol>
          <li><i>1</i><span>보호자와 함께 소화기를 사요.</span></li>
          <li><i>2</i><span>현관 가까이에 둬요.</span></li>
          <li><i>3</i><span>다 하면 아래 버튼을 눌러요.</span></li>
        </ol>
        <ProtoButton onClick={complete}>준비했어요</ProtoButton>
      </section>
    </div>
  )
}

/** 보호자/이웃 중 번호가 있는 사람만 "{관계} ({이름})" 형식으로. */
function peopleToSend(profile: Profile): { key: string; label: string; contact: Contact }[] {
  const list: { key: string; label: string; contact: Contact }[] = []
  const label = (c: Contact) => {
    const relation = c.relation || "도와줄 사람"
    return c.name ? `${c.name} (${relation})` : relation
  }
  if (profile.guardian.phone) list.push({ key: "guardian", label: label(profile.guardian), contact: profile.guardian })
  if (profile.neighbor.phone) list.push({ key: "neighbor", label: label(profile.neighbor), contact: profile.neighbor })
  return list
}

function SafetySendSheet({
  sent,
  close,
  profile,
}: {
  sent: (person: string) => void
  close: () => void
  profile: Profile
}) {
  const people = peopleToSend(profile)
  const [selected, setSelected] = useState<string>(people[0]?.label ?? "")
  const userName = profile.name || "저"
  return (
    <div className="proto-sheet-wrap" onClick={close}>
      <section className="proto-sheet safety-send" onClick={(event) => event.stopPropagation()}>
        <i />
        <h2>누구에게 보낼까요?</h2>
        {people.length === 0 ? (
          <p>내 카드에 보호자 전화번호를 적으면 여기서 보낼 수 있어요.</p>
        ) : (
          <>
            <div className="send-people">
              {people.map(({ key, label }) => (
                <button
                  className={selected === label ? "selected" : ""}
                  onClick={() => setSelected(label)}
                  key={key}
                >
                  <span><Users size={24} strokeWidth={2} /></span>
                  <b>{label}</b>
                  {selected === label && <Icon name="check" />}
                </button>
              ))}
            </div>
            <div className="send-preview">
              <span>{userName}님의 우리 집 안전 점검 결과예요.</span>
              <span>준비된 것 11개, 준비할 것 4개, 같이 확인할 것 1개</span>
              <span>준비할 것: 소화기, 물막이판, 무더위쉼터, 챙길 가방</span>
              <span>같이 확인: 물이 차면 문이 잘 열리는지</span>
            </div>
            <ProtoButton onClick={() => sent(selected)} disabled={!selected}>
              문자로 보내기
            </ProtoButton>
          </>
        )}
      </section>
    </div>
  )
}

// --- 3단계: 결과 요약 ---------------------------------------------------

function SafetyResult({
  prepared,
  completeItem,
  restart,
  home,
  send,
}: {
  prepared: boolean
  completeItem: () => void
  restart: () => void
  home: () => void
  send: () => void
}) {
  const [detail, setDetail] = useState(false)
  const prepareItems: [LucideIcon, string][] = [
    [FireExtinguisher, "소화기 준비하기"],
    [Shield, "물막이판 물어보기"],
    [Building2, "무더위쉼터 알아보기"],
    [Backpack, "챙길 가방 만들기"],
  ]
  return (
    <section className="safety-screen result-screen">
      <header className="result-close">
        <button onClick={home}>×</button>
      </header>
      <main>
        <span className="result-check"><Icon name="check" /></span>
        <h1>안전 점검을 다 했어요</h1>
        <p>2026년 10월 9일 · 반지하</p>
        <div className="result-counts">
          <section><b>준비된 것</b><strong>{prepared ? 12 : 11}개</strong></section>
          <section><b>준비할 것</b><strong>{prepared ? 3 : 4}개</strong></section>
          <section><b>같이 확인</b><strong>1개</strong></section>
        </div>
        <article className="result-card">
          <h2>준비할 것</h2>
          {prepareItems
            .filter(([, title]) => !prepared || title !== "소화기 준비하기")
            .map(([ItemIcon, title]) => (
              <button onClick={() => setDetail(true)} key={title}>
                <span><ItemIcon size={24} strokeWidth={2} /></span>
                <b>{title}</b>
                <i>›</i>
              </button>
            ))}
        </article>
        <article className="result-card">
          <h2>같이 확인해요</h2>
          <button onClick={() => setDetail(true)}>
            <span><DoorClosed size={24} strokeWidth={2} /></span>
            <b>물이 차면 문이 잘 열리는지</b>
            <i>›</i>
          </button>
        </article>
      </main>
      <footer className="safety-fixed">
        <ProtoButton onClick={send}>도와주는 사람에게 보내기</ProtoButton>
        <ProtoButton secondary onClick={restart}>다시 점검하기</ProtoButton>
      </footer>
      {detail && (
        <SafetyDetailSheet
          close={() => setDetail(false)}
          complete={() => {
            completeItem()
            setDetail(false)
          }}
        />
      )}
    </section>
  )
}

// --- 최상위 플로우 컴포넌트 ---------------------------------------------

export function SafetyCheck({
  back,
  home,
  onComplete,
  profile,
}: {
  back: () => void
  home: () => void
  onComplete: () => void
  profile: Profile
}) {
  // Preferences 는 비동기 → 로드 전까진 기본값으로 그렸다가 값이 오면 교체.
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<"start" | "question" | "result">("start")
  const [homeType, setHomeType] = useState<string>("")
  const [index, setIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, SafetyAnswer>>({})
  const [prepared, setPrepared] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [toast, setToast] = useState("")

  // 마운트 때 한 번: 저장된 진행 상태 복원
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { value } = await Preferences.get({ key: SAFETY_STATE_KEY })
        if (cancelled) return
        if (value) {
          const saved = JSON.parse(value) as Partial<SafetyState>
          setHomeType(saved.home ?? "")
          setIndex(saved.index ?? 0)
          setAnswers(saved.answers ?? {})
          setPrepared(Boolean(saved.prepared))
          setView(saved.complete ? "result" : saved.home ? "question" : "start")
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const questions = safetyQuestions.filter((question) => !question.lowerFloors || homeType !== "2층 이상")
  const question = questions[Math.min(index, questions.length - 1)]

  // 상태가 바뀌면 Preferences 에 저장. 아직 로드되지 않았으면 쓰지 않는다 (덮어쓰기 방지).
  useEffect(() => {
    if (!loaded) return
    const state: SafetyState = {
      home: homeType,
      index,
      answers,
      complete: view === "result",
      prepared,
    }
    Preferences.set({ key: SAFETY_STATE_KEY, value: JSON.stringify(state) }).catch(() => {})
  }, [loaded, homeType, index, answers, view, prepared])

  const start = (selectedHome: string) => {
    setHomeType(selectedHome)
    setIndex(0)
    setAnswers({})
    setView("question")
  }
  const next = () => {
    if (index >= questions.length - 1) {
      setView("result")
      Preferences.set({ key: SAFETY_COMPLETE_KEY, value: "true" }).catch(() => {})
      onComplete()
    } else setIndex(index + 1)
  }

  if (view === "start") return <SafetyStart onStart={start} back={back} />
  if (view === "question")
    return (
      <SafetyQuestionScreen
        question={question}
        current={index + 1}
        total={questions.length}
        answer={answers[question.id]}
        choose={(answer) => setAnswers({ ...answers, [question.id]: answer })}
        next={next}
        back={() => (index === 0 ? setView("start") : setIndex(index - 1))}
      />
    )
  return (
    <>
      <SafetyResult
        prepared={prepared}
        completeItem={() => setPrepared(true)}
        restart={() => {
          setView("start")
          setHomeType("")
          setIndex(0)
          setAnswers({})
        }}
        home={home}
        send={() => setSendOpen(true)}
      />
      {sendOpen && (
        <SafetySendSheet
          close={() => setSendOpen(false)}
          profile={profile}
          sent={(person) => {
            setSendOpen(false)
            setToast(`${person.split(" ")[0]}님에게 보냈어요.`)
            window.setTimeout(() => setToast(""), 3000)
          }}
        />
      )}
      {toast && <div className="safety-toast">{toast}</div>}
    </>
  )
}
