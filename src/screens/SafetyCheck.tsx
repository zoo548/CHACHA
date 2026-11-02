// 우리 집 안전 점검 플로우.
// 1) SafetyStart: 집 유형 선택
// 2) SafetyQuestionScreen: 네 / 아니요 / 몰라요. 아니요·몰라요면 할 일 한 줄.
// 3) SafetyResult: 할 일 목록 + 보호자에게 문자 보내기
//
// 저장소: @capacitor/preferences. 서버 전송은 하지 않는다.
// 예전 숫자 id 답은 읽고 버린다.

import { useEffect, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"
import {
  Building2,
  House,
  Warehouse,
  type LucideIcon,
} from "lucide-react"

import { Icon } from "../components/Icon"
import { ProtoButton } from "../components/ProtoButton"
import { ProtoGuardian } from "../components/ProtoGuardian"
import {
  checkGuidePhotoSrc,
  isSafetyQuestionId,
  safetyQuestions,
  todosFromAnswers,
  type SafetyAnswer,
  type SafetyQuestion,
  type SafetyQuestionId,
} from "../data/safetyQuestions"
import { toTelDigits } from "../data/profile"
import type { Profile } from "../data/profile"
import { loadHomePhotos, saveHomePhoto, takeHomePhoto, type HomePhotos } from "../device/homePhoto"

const SAFETY_STATE_KEY = "chacha-safety-check"
const SAFETY_COMPLETE_KEY = "chacha-safety-complete"

const ANSWER_LABELS: [string, string, string] = ["네", "아니요", "몰라요"]

type SafetyState = {
  home: string
  index: number
  answers: Record<string, SafetyAnswer>
  complete: boolean
}

function readAnswers(raw: unknown): Record<string, SafetyAnswer> {
  if (!raw || typeof raw !== "object") return {}
  const next: Record<string, SafetyAnswer> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isSafetyQuestionId(key)) continue
    if (value === 0 || value === 1 || value === 2) next[key] = value
  }
  return next
}

function smsHref(phone: string, body: string): string {
  const digits = toTelDigits(phone)
  const encoded = encodeURIComponent(body)
  return Capacitor.getPlatform() === "ios"
    ? `sms:${digits}&body=${encoded}`
    : `sms:${digits}?body=${encoded}`
}

function todoSmsBody(todos: string[]): string {
  if (todos.length === 0) return "할 일이 없어요."
  return ["할 일", ...todos].join("\n")
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

function SafetyIconTile({
  question,
  homePhoto,
}: {
  question: SafetyQuestion
  homePhoto?: string
}) {
  const [guideOk, setGuideOk] = useState(false)
  const GuideIcon = question.icon

  useEffect(() => {
    setGuideOk(false)
  }, [question.id, homePhoto])

  if (homePhoto) {
    return (
      <div className="safety-icon-tile">
        <img src={homePhoto} alt="" />
      </div>
    )
  }
  return (
    <div className="safety-icon-tile">
      <img
        src={checkGuidePhotoSrc(question.id)}
        alt=""
        hidden={!guideOk}
        onLoad={() => setGuideOk(true)}
        onError={() => setGuideOk(false)}
      />
      {!guideOk && <GuideIcon aria-hidden="true" size={56} strokeWidth={2} />}
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
      <SafetyTop current={1} total={safetyQuestions.length} back={back} />
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
  homePhoto,
  choose,
  next,
  back,
  onCapture,
}: {
  question: SafetyQuestion
  current: number
  total: number
  answer?: SafetyAnswer
  homePhoto?: string
  choose: (answer: SafetyAnswer) => void
  next: () => void
  back: () => void
  onCapture: (id: SafetyQuestionId, dataUrl: string) => void
}) {
  const capture = async () => {
    const dataUrl = await takeHomePhoto()
    if (dataUrl) onCapture(question.id, dataUrl)
  }

  return (
    <section className="safety-screen">
      <SafetyTop current={current} total={total} back={back} />
      <main className="safety-question">
        <em>{question.category}</em>
        <SafetyIconTile question={question} homePhoto={homePhoto} />
        {question.capturePhoto && (
          <button className="proto-button secondary safety-photo-btn" type="button" onClick={capture}>
            우리 집 사진 찍기
          </button>
        )}
        <h1>{question.question}</h1>
        <div className="answer-options">
          {ANSWER_LABELS.map((option, index) => (
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
            <div>
              <b>할 일</b>
              <p>{question.todo}</p>
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

// --- 3단계: 결과 요약 ---------------------------------------------------

function SafetyResult({
  todos,
  restart,
  home,
  guardianPhone,
}: {
  todos: string[]
  restart: () => void
  home: () => void
  guardianPhone: string
}) {
  const digits = toTelDigits(guardianPhone)
  const href = digits ? smsHref(digits, todoSmsBody(todos)) : ""
  return (
    <section className="safety-screen result-screen">
      <header className="result-close">
        <button onClick={home}>×</button>
      </header>
      <main>
        <span className="result-check"><Icon name="check" /></span>
        <h1>안전 점검을 다 했어요</h1>
        <article className="result-card">
          <h2>할 일</h2>
          {todos.length === 0 ? (
            <p className="result-empty">할 일이 없어요.</p>
          ) : (
            todos.map((todo) => (
              <div className="result-todo" key={todo}>
                <b>{todo}</b>
              </div>
            ))
          )}
        </article>
      </main>
      <footer className="safety-fixed">
        {href ? (
          <a className="proto-button" href={href}>보호자에게 보내기</a>
        ) : (
          <>
            <button className="proto-button" disabled>보호자에게 보내기</button>
            <p className="result-send-hint">내 카드에 보호자 전화번호를 적으면 여기서 보낼 수 있어요.</p>
          </>
        )}
        <ProtoButton secondary onClick={restart}>다시 점검하기</ProtoButton>
      </footer>
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
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<"start" | "question" | "result">("start")
  const [homeType, setHomeType] = useState<string>("")
  const [index, setIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, SafetyAnswer>>({})
  const [photos, setPhotos] = useState<HomePhotos>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [{ value }, homePhotos] = await Promise.all([
          Preferences.get({ key: SAFETY_STATE_KEY }),
          loadHomePhotos(),
        ])
        if (cancelled) return
        setPhotos(homePhotos)
        if (value) {
          const saved = JSON.parse(value) as Partial<SafetyState>
          const restored = readAnswers(saved.answers)
          const last = Math.max(safetyQuestions.length - 1, 0)
          const nextIndex = Math.min(Math.max(saved.index ?? 0, 0), last)
          setHomeType(saved.home ?? "")
          setIndex(nextIndex)
          setAnswers(restored)
          setView(saved.complete ? "result" : saved.home ? "question" : "start")
        }
      } catch {
        /* 예전 형식·깨진 값은 무시하고 처음부터 */
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const question = safetyQuestions[Math.min(index, safetyQuestions.length - 1)]

  useEffect(() => {
    if (!loaded) return
    const state: SafetyState = {
      home: homeType,
      index,
      answers,
      complete: view === "result",
    }
    Preferences.set({ key: SAFETY_STATE_KEY, value: JSON.stringify(state) }).catch(() => {})
  }, [loaded, homeType, index, answers, view])

  const start = (selectedHome: string) => {
    setHomeType(selectedHome)
    setIndex(0)
    setAnswers({})
    setView("question")
  }
  const next = () => {
    if (index >= safetyQuestions.length - 1) {
      setView("result")
      Preferences.set({ key: SAFETY_COMPLETE_KEY, value: "true" }).catch(() => {})
      onComplete()
    } else setIndex(index + 1)
  }

  if (view === "start") return <SafetyStart onStart={start} back={back} />
  if (view === "question" && question)
    return (
      <SafetyQuestionScreen
        question={question}
        current={index + 1}
        total={safetyQuestions.length}
        answer={answers[question.id]}
        homePhoto={photos[question.id]}
        choose={(answer) => setAnswers({ ...answers, [question.id]: answer })}
        next={next}
        back={() => {
          if (index === 0) {
            setHomeType("")
            setView("start")
          } else setIndex(index - 1)
        }}
        onCapture={(id, dataUrl) => {
          setPhotos((prev) => ({ ...prev, [id]: dataUrl }))
          saveHomePhoto(id, dataUrl).catch(() => {})
        }}
      />
    )
  return (
    <SafetyResult
      todos={todosFromAnswers(answers)}
      restart={() => {
        setView("start")
        setHomeType("")
        setIndex(0)
        setAnswers({})
      }}
      home={home}
      guardianPhone={profile.guardian.phone}
    />
  )
}
