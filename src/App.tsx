import { createContext, useContext, useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar as NativeStatusBar, Style as NativeStatusBarStyle } from "@capacitor/status-bar";
import {
  ArrowUpFromLine,
  Backpack,
  BellRing,
  Building2,
  DoorClosed,
  DoorOpen,
  Droplets,
  Fan,
  FileText,
  FireExtinguisher,
  Flashlight,
  GlassWater,
  House,
  Info,
  MapPin,
  Shield,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type IconName =
  | "alert"
  | "arrow-down"
  | "bell"
  | "building"
  | "call"
  | "check"
  | "cloud"
  | "desk"
  | "home"
  | "history"
  | "light"
  | "list"
  | "lock"
  | "map"
  | "people"
  | "phone"
  | "print"
  | "shade"
  | "stairs"
  | "sun"
  | "water";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    alert: <><path d="M12 3 2.8 20h18.4Z" /><path d="M12 9v5m0 3h.01" /></>,
    "arrow-down": <><path d="M12 3v15" /><path d="m6 13 6 6 6-6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    building: <><path d="M5 21V5h14v16M3 21h18" /><path d="M9 9h2m2 0h2m-6 4h2m2 0h2m-6 4h2m2 0h2" /></>,
    call: <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-5-2-1.2 3c-3.9-1.7-6.1-3.9-7.8-7.8l3-1.2Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    cloud: <><path d="M5 14c-4 0-4-6 0-6 1-5 7-6 10-2 4-1 7 2 7 6 0 2-2 2-4 2Z" /><path d="m7 17-2 4m7-4-2 4m7-4-2 4" /></>,
    desk: <><path d="M3 8h18M5 8v13m14-13v13" /><circle cx="12" cy="13" r="2" /><path d="m12 15-4 4m4-4 4 4" /></>,
    home: <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    light: <><path d="M9 18h6M10 22h4" /><path d="M8.5 15.5A7 7 0 1 1 15.5 15.5c-.8.6-1.2 1.2-1.3 2.5h-4.4c-.1-1.3-.5-1.9-1.3-2.5Z" /></>,
    list: <><circle cx="5" cy="6" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="5" cy="18" r="1.5" /><path d="M9 6h11M9 12h11M9 18h11" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></>,
    people: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6m-3 0c.5-4 2.3-6 5.5-6s5 2 5.5 6" /></>,
    phone: <><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M9 5h6m-4 14h2" /></>,
    print: <><path d="M7 9V3h10v6M7 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3" /><path d="M7 14h10v7H7Z" /></>,
    shade: <><path d="M3 11c3-8 15-8 18 0Z" /><path d="M12 11v10" /><circle cx="9" cy="15" r="1.5" /><path d="m9 17-3 3m3-3 3 3" /></>,
    stairs: <><path d="M2 21h6v-5h5v-5h5V6h4" /><circle cx="9" cy="5" r="2" /><path d="m9 7-3 5 4 2m-1-4 4 2m-3 2-3 5m6-7 3-3" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2" /></>,
    water: <><path d="M6 4h12l-2 17H8Z" /><path d="M7 12c3-2 7 2 10 0" /></>,
  };
  return (
    <svg aria-hidden="true" className={`icon ${className}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

const frameOrder = ["A", "B", "C", "D", "E", "E-2", "F", "G", "H", "H-2", "I", "J", "K", "L", "L-2", "M", "N", "O", "P", "Q", "R", "S", "T"];

const PreviewContext = createContext({
  activeId: "A",
  next: () => {},
  previous: () => {},
});

function Frame({ id, name, children, wide = false }: { id: string; name: string; children: ReactNode; wide?: boolean }) {
  const preview = useContext(PreviewContext);
  if (preview.activeId !== id) return null;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    const text = button.textContent ?? "";
    if (text.includes("돌아가기")) {
      preview.previous();
      return;
    }
    if (
      button.classList.contains("main-button") ||
      button.closest(".alert-bottom") ||
      text.includes("건너뛸게요") ||
      text.includes("차차등이 없어요")
    ) {
      preview.next();
    }
  };

  return (
    <figure className={wide ? "design-frame pdf-frame" : "design-frame"} onClickCapture={handleClick}>
      <figcaption><b>{id}</b> {name}</figcaption>
      <div className={wide ? "paper" : "phone"}>{children}</div>
    </figure>
  );
}

function Logo({ large = false }: { large?: boolean }) {
  return (
    <div className={large ? "brand-logo large" : "brand-logo"}>
      <span className="logo-mark"><i /><i /><i /></span>
      <strong>차차</strong>
      {large && <small>CHA-CHA</small>}
    </div>
  );
}

function GroupHeader({ group, step, total }: { group: 1 | 2 | 3; step?: number; total?: number }) {
  const names = ["차차 알아보기", "내 카드 만들기", "휴대폰 준비하기"];
  return (
    <header className="group-header">
      <div className="group-steps">
        {[1, 2, 3].map((number) => (
          <span className={number < group ? "done" : number === group ? "current" : ""} key={number}>
            {number < group ? <Icon name="check" /> : number}
          </span>
        ))}
      </div>
      <p>{names[group - 1]}</p>
      {group === 2 && (
        <>
          <div className="form-nav"><button>‹ 돌아가기</button><b>{step} / {total}</b></div>
          <div className="progress">{Array.from({ length: total ?? 5 }, (_, index) => <i className={index < (step ?? 1) ? "filled" : ""} key={index} />)}</div>
        </>
      )}
      {group !== 2 && <button className="later">나중에 이어서 하기</button>}
    </header>
  );
}

function Bottom({ children, secondary, sub }: { children: ReactNode; secondary?: boolean; sub?: string }) {
  return (
    <footer className="fixed-bottom">
      <button className={secondary ? "main-button secondary" : "main-button"}>{children}</button>
      {sub && <button className="text-button">{sub}</button>}
    </footer>
  );
}

function AdultIllustration({ together = false }: { together?: boolean }) {
  return (
    <svg className="adult-illustration" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 220 160">
      <circle cx={together ? 75 : 110} cy="42" r="17" />
      <path d={together ? "M57 100c3-28 8-40 18-40s15 12 18 40M63 76l-18 30m42-30 18 25M67 100l-5 42m25-42 5 42" : "M86 112c4-37 10-52 24-52s20 15 24 52M94 80l-28 26m60-26 24 20M97 112l-7 38m33-38 7 38"} />
      {together && <><circle cx="142" cy="42" r="17" /><path d="M124 100c3-28 8-40 18-40s15 12 18 40M130 76l-20 24m44-24 15 25m-34-1-5 42m25-42 5 42" /><rect x="93" y="83" width="42" height="31" rx="4" /></>}
    </svg>
  );
}

function TogetherIllustration() {
  return (
    <svg
      aria-label="두 어른이 나란히 휴대폰을 함께 보는 그림"
      className="together-illustration"
      role="img"
      viewBox="0 0 345 220"
    >
      <ellipse cx="172" cy="200" fill="#E5E8EB" rx="110" ry="6" />

      <path
        d="M165 168C165 139 188 116 217 116C246 116 269 139 269 168V186H165Z"
        fill="#A9C6F7"
      />
      <circle cx="213" cy="78" fill="#A9C6F7" r="28" />

      <path
        d="M76 168C76 139 99 116 128 116C157 116 180 139 180 168V186H76Z"
        fill="#1B64DA"
      />
      <circle cx="132" cy="78" fill="#1B64DA" r="28" />

      <ellipse cx="194" cy="192" fill="#A9C6F7" rx="10" ry="8" />
      <ellipse cx="152" cy="192" fill="#1B64DA" rx="10" ry="8" />

      <rect
        fill="#FFFFFF"
        height="72"
        rx="10"
        stroke="#191F28"
        strokeWidth="2"
        width="46"
        x="150"
        y="124"
      />
      <rect fill="#1B64DA" height="4" rx="2" width="26" x="160" y="143" />
      <rect fill="#1B64DA" height="4" rx="2" width="20" x="160" y="155" />
      <rect fill="#1B64DA" height="4" rx="2" width="24" x="160" y="167" />
    </svg>
  );
}

function IntroFrame({ kind }: { kind: "start" | "work" | "together" }) {
  if (kind === "start") {
    return <><GroupHeader group={1} /><main className="intro centered"><Logo large /><h1>차분하게, 차근차근</h1><p>재난 때 해야 할 일을 알려줘요.</p></main><Bottom>시작하기</Bottom></>;
  }
  if (kind === "work") {
    const rows: [IconName, string][] = [["bell", "재난문자를 쉬운 말로 바꿔 줘요."], ["list", "지금 할 일을 순서대로 알려줘요."], ["call", "도와줄 사람에게 바로 전화해요."]];
    return <><GroupHeader group={1} /><main className="intro"><h1>차차는 이런 일을 해요</h1><div className="intro-list">{rows.map(([icon, text]) => <div key={text}><span><Icon name={icon} /></span><p>{text}</p></div>)}</div></main><Bottom>다음</Bottom></>;
  }
  return <><GroupHeader group={1} /><main className="intro centered together"><AdultIllustration together /><h1><span>보호자와 함께 해요</span></h1><p><span>도와줄 사람을 같이 적어요.</span><span>10분이면 돼요.</span></p><Guardian>사용자 옆에서 함께 읽고 입력해 주세요.</Guardian></main><Bottom>카드 만들기 시작</Bottom></>;
}

function Guardian({ children }: { children: ReactNode }) {
  return <p className="guardian"><Icon name="people" />{children}</p>;
}

function Field({ label, placeholder, required, action }: { label: string; placeholder: string; required?: boolean; action?: string }) {
  return (
    <label className="field">
      <span>{label}{required && <i />}</span>
      <div><input placeholder={placeholder} readOnly />{action && <button>{action}</button>}</div>
    </label>
  );
}

function Chips({ title, options, selected = 0 }: { title: string; options: string[]; selected?: number }) {
  return (
    <div className="chip-field">
      <b>{title}</b>
      <div>{options.map((option, index) => <button className={index === selected ? "selected" : ""} key={option}>{index === selected && <Icon name="check" />}{option}</button>)}</div>
    </div>
  );
}

function FormFrame({ step, title, description, children, button = "다음", skip, note }: { step: number; title: string; description?: string; children: ReactNode; button?: string; skip?: string; note?: ReactNode }) {
  return (
    <>
      <GroupHeader group={2} step={step} total={5} />
      <main className={`form-page ${step === 5 ? "scroll-form" : ""}`}>
        <h1>{title}</h1>{description && <p className="description">{description}</p>}
        <div className="fields">{children}</div>
      </main>
      <footer className="fixed-bottom">{note}<button className="main-button">{button}</button>{skip && <button className="text-button">{skip}</button>}</footer>
    </>
  );
}

function PermissionSheet({ title, description }: { title: string; description: string }) {
  return <div className="sheet-overlay"><section className="bottom-sheet"><i /><h2>{title}</h2><p>{description}</p><button className="main-button">허락하기</button></section></div>;
}

function MiniCard() {
  return <div className="mini-card"><Logo /><hr /><b>김민수</b><span>도와줄 사람</span><strong>김영희 (엄마)</strong><span>우리 집 주소</span><strong>관악구 신림동</strong></div>;
}

function PhonePrep({ kind }: { kind: "notice" | "light" | "practice" | "done" }) {
  if (kind === "notice") return <><GroupHeader group={3} /><main className="prep centered"><div className="phone-drawing"><Icon name="phone" /><span><Logo /><b>재난문자가 왔어요</b></span></div><h1>알림을 켜요</h1><p>재난문자가 오면 바로 알려줘요.</p></main><Bottom>알림 켜기</Bottom></>;
  if (kind === "light") return <><GroupHeader group={3} /><main className="prep"><div className="connect-drawing"><span><Icon name="light" /></span><i /><Icon name="phone" /></div><h1>차차등을 연결해요</h1><p>차차등의 손바닥 버튼을 3초 눌러요.</p><div className="light-states"><section><b>K-1 찾는 중</b><div className="search-dots">· · ·</div></section><section><b>K-2 찾았어요</b><div><span>chachadeung</span><button>연결하기</button></div></section><section><b>K-3 연결됐어요</b><div className="connected"><Icon name="light" /><span>차차등에 노란불이 켜졌나요?</span><button>네</button><button>아니요</button></div></section></div></main><Bottom sub="차차등이 없어요">다음</Bottom></>;
  if (kind === "practice") return <><GroupHeader group={3} /><main className="prep centered practice"><span className="practice-icon"><Icon name="bell" /></span><h1>연습해 봐요</h1><p><span>연습 알림을 보낼게요.</span><span>다 읽고 "알았어요"를 눌러요.</span></p></main><Bottom>연습 알림 보내기</Bottom></>;
  return <><GroupHeader group={3} /><main className="prep centered done"><span className="done-check"><Icon name="check" /></span><h1>준비가 끝났어요</h1><p>재난문자가 오면 차차가 알려줄게요.</p><section className="safety-card"><Icon name="home" /><span><b>우리 집 안전 점검</b><small>집이 안전한지 확인해요. 5분이면 돼요.</small></span><button>점검하기</button></section></main><Bottom>홈으로</Bottom></>;
}

type Disaster = "rain" | "earthquake" | "heat" | "practice";
const alertData: Record<Disaster, { level: "danger" | "caution" | "practice"; title: string; situation: string; hero: IconName; actions: { text: string; icon?: IconName; phone?: boolean; disabled?: boolean }[] }> = {
  rain: { level: "danger", title: "비가 아주 많이 와요", situation: "물이 빨리 차올라서 위험해요.", hero: "cloud", actions: [
    { text: "지하에 있으면 / 바로 밖으로 나와요.", icon: "stairs" }, { text: "지금 바로 김영희에게 / 전화해요.", phone: true }, { text: "전화를 안 받으면 / 박민수에게 전화해요.", phone: true }, { text: "아무도 안 받으면 / 119에 전화해요.", phone: true }, { text: "물이 흐르는 길을 / 건너지 마세요." },
  ] },
  earthquake: { level: "danger", title: "땅이 크게 흔들려요", situation: "물건이 떨어질 수 있어서 위험해요.", hero: "building", actions: [
    { text: "책상 밑으로 들어가 / 머리를 가려요.", icon: "desk" }, { text: "흔들림이 멈추면 / 김영희에게 전화해요.", phone: true }, { text: "전화를 안 받으면 / 박민수에게 전화해요.", phone: true }, { text: "아무도 안 받으면 / 119에 전화해요.", phone: true }, { text: "엘리베이터 말고 / 계단으로 나가요." }, { text: "밖에서는 건물에서 / 멀리 떨어져요." },
  ] },
  heat: { level: "caution", title: "오늘은 아주 더워요", situation: "더우면 몸이 아플 수 있어요.", hero: "sun", actions: [
    { text: "물을 자주 마셔요.", icon: "water" }, { text: "시원한 곳에 있어요.", icon: "shade" }, { text: "낮에는 밖에 / 오래 있지 마세요." }, { text: "몸이 아프면 / 김영희나 119에 전화해요.", phone: true },
  ] },
  practice: { level: "practice", title: "연습 알림이에요", situation: "진짜 재난이 아니에요.", hero: "bell", actions: [
    { text: "이 화면을 끝까지 읽어요." }, { text: "김영희에게 전화해요.", phone: true, disabled: true }, { text: "아래 \"알았어요\"를 눌러요." },
  ] },
};

function Lines({ text }: { text: string }) {
  return <>{text.split(" / ").map((line) => <span key={line}>{line}</span>)}</>;
}

function AlertScreen({ type, collapsed = false }: { type: Disaster; collapsed?: boolean }) {
  const data = alertData[type];
  const calls = data.actions.filter((action) => action.phone);
  const firstCall = data.actions.findIndex((action) => action.phone);
  return (
    <article className={`alert-screen ${data.level}`}>
      {collapsed ? <header className="collapsed-alert"><b>▲ 위험</b><span>·</span><strong>비가 아주 많이 와요</strong></header> :
        <header className="alert-head"><b>{data.level === "danger" ? "▲ 위험" : data.level === "caution" ? "● 주의" : "● 연습"}</b><div><Icon name={data.hero} /><h1>{data.title}</h1></div></header>}
      <main className="alert-main">
        {!collapsed && <p className="situation">{data.situation}</p>}
        <h2>이렇게 해요</h2>
        <div className="action-list">
          {data.actions.map((action, index) => {
            if (action.phone && index !== firstCall) return null;
            if (action.phone) return <div className="phone-group" key="calls">{calls.map((call, callIndex) => <ActionRow action={call} number={firstCall + callIndex + 1} key={call.text} />)}</div>;
            return <ActionRow action={action} number={index + 1} key={action.text} />;
          })}
        </div>
        {type === "earthquake" && <div className="more">아래에 더 있어요 ⌄</div>}
      </main>
      <footer className="alert-bottom"><button>알았어요</button>{type !== "practice" && <small>행정안전부 · 오후 3:12 · 원문 보기 ⌄</small>}</footer>
    </article>
  );
}

function ActionRow({ action, number }: { action: { text: string; icon?: IconName; phone?: boolean; disabled?: boolean }; number: number }) {
  return <div className={`action-row ${action.disabled ? "disabled" : ""}`}><i>{number}</i><p><Lines text={action.text} /></p>{action.icon && <Icon name={action.icon} />}{action.phone && <Icon name="call" />}</div>;
}

function CardView() {
  const items = [
    ["이름", "김민수"], ["우리 집 주소", "관악구 신림동 00-00 101호"], ["도와줄 사람", "김영희 (엄마) · 010-1234-5678 · 30분 안에"], ["또 다른 사람", "박민수 (이웃) · 010-9876-5432"], ["기관", "관악복지관 · 02-000-0000"], ["내가 갈 대피소", "신림초등학교 · 걸어서 7분"], ["소통 방법", "짧은 문장으로 말해 주세요"], ["이동 도움", "같이 걸어 주세요"], ["힘든 것", "큰 소리를 무서워해요"], ["챙길 물건", "약, 물, 휴대폰"],
  ];
  return <><main className="card-view"><h1>나의 재난 대비 카드</h1><p>급할 때 이 카드를 보여 주세요.</p><section className="full-card"><header><Logo /><b>차차 재난 대비 카드</b><button>고치기</button></header>{items.map(([label, value]) => <div className="card-item" key={label}><b>{label}</b><p>{value}{(label === "도와줄 사람" || label === "또 다른 사람" || label === "기관") && <Icon name="call" />}</p></div>)}</section><div className="card-actions"><button><Icon name="arrow-down" />PDF로 저장</button><button><Icon name="print" />인쇄하기</button></div></main><TabBar /></>;
}

function TabBar() {
  return <nav className="tabbar">{[["bell", "알림"], ["alert", "대비하기"], ["call", "도움"], ["people", "내 카드"]].map(([icon, label]) => <button className={label === "내 카드" ? "active" : ""} key={label}><Icon name={icon as IconName} />{label}</button>)}</nav>;
}

function PdfPreview() {
  const rows = [["이름", "김민수"], ["우리 집 주소", "관악구 신림동 00-00 101호"], ["도와줄 사람", "김영희 (엄마) 010-1234-5678"], ["또 다른 사람", "박민수 (이웃) 010-9876-5432"], ["기관", "관악복지관 02-000-0000"], ["내가 갈 대피소", "신림초등학교"], ["소통 방법", "짧은 문장으로 말해 주세요"], ["이동 도움", "같이 걸어 주세요"], ["힘든 것", "큰 소리를 무서워해요"], ["챙길 물건", "약, 물, 휴대폰"]];
  return <div className="pdf"><header><h1>나의 재난 대비 카드</h1><span>작성한 날짜 2025. 10. 10.</span></header><p>잘라서 현관문 안쪽에 붙여 주세요.</p><table><tbody>{rows.map(([a, b]) => <tr key={a}><th>{a}</th><td>{b}</td></tr>)}</tbody></table><div className="cut-line">✂</div><section className="wallet-card"><Logo /><h2>김민수</h2><b>저는 도움이 필요해요.</b><p>이 번호로 전화해 주세요.</p><strong>김영희 (엄마) 010-1234-5678</strong><small>짧은 문장으로 말해 주세요</small></section></div>;
}

type AppScreen = "onboarding" | "home" | "help" | "call-choice" | "prep" | "card" | "pdf" | "lock" | "alert" | "safety";
type SheetKind = "phone-permission" | "location" | "call" | "source" | null;

function StatusBar({ light = false }: { light?: boolean }) {
  return <div className={`proto-status ${light ? "light" : ""}`}><b>9:41</b><span className="dynamic-island" /><div className="status-icons"><i className="signal" /><i className="wifi" /><i className="battery" /></div></div>;
}

function ProtoButton({ children, onClick, secondary = false, text = false }: { children: ReactNode; onClick: () => void; secondary?: boolean; text?: boolean }) {
  return <button className={text ? "proto-text-button" : secondary ? "proto-button secondary" : "proto-button"} onClick={onClick}>{children}</button>;
}

function OnboardHeader({ step, back, skip }: { step: number; back?: () => void; skip?: () => void }) {
  return <header className="onboard-header"><button onClick={back} disabled={!back}>‹ 뒤로</button><div><i style={{ width: `${Math.min(100, ((step + 1) / 12) * 100)}%` }} /></div>{skip ? <button onClick={skip}>나중에 할게요</button> : <span />}</header>;
}

function ProtoField({ label, placeholder, required, action, onAction }: { label: string; placeholder: string; required?: boolean; action?: string; onAction?: () => void }) {
  return <label className="proto-field"><b>{label}{required && <i />}</b><span><input placeholder={placeholder} />{action && <button onClick={onAction}>{action}</button>}</span></label>;
}

function ProtoChips({ title, items, multi = false }: { title: string; items: string[]; multi?: boolean }) {
  const [selected, setSelected] = useState<number[]>([0]);
  return <section className="proto-chips"><b>{title}</b><div>{items.map((item, index) => <button className={selected.includes(index) ? "active" : ""} onClick={() => setSelected(multi ? selected.includes(index) ? selected.filter((n) => n !== index) : [...selected, index] : [index])} key={item}>{selected.includes(index) && <Icon name="check" />}{item}</button>)}</div></section>;
}

function ProtoGuardian({ children }: { children: ReactNode }) {
  return <div className="proto-guardian"><Icon name="people" /><span>{children}</span></div>;
}

function OnboardingFlow({ step, setStep, openSheet, openPdf, openPractice, finish, startSafety }: { step: number; setStep: (step: number) => void; openSheet: (sheet: SheetKind) => void; openPdf: () => void; openPractice: () => void; finish: () => void; startSafety: () => void }) {
  const [lightState, setLightState] = useState(0);
  const back = step > 0 ? () => setStep(step - 1) : undefined;
  const skip = [0, 1, 2, 9, 10, 11, 12].includes(step) ? finish : undefined;
  const next = () => setStep(step + 1);
  const titles = ["", "차차는 이런 일을 해요", "보호자와 함께 해요", "내 이름을 적어요", "도와줄 사람", "또 다른 사람", "기관", "나에 대해", "카드를 만들었어요", "알림을 켜요", "차차등을 연결해요", "연습해 봐요", "준비가 끝났어요"];
  return <section className="onboard-screen"><OnboardHeader step={step} back={back} skip={skip} /><main className={`onboard-body ${step === 7 ? "scrolling" : ""}`}>
    {step === 0 && <div className="onboard-start"><Logo large /><p><span className="text-center">차분하게, 차근차근</span><span className="text-center">재난 때 해야 할 일을 알려줘요.</span></p></div>}
    {step > 0 && step < 8 && <>{step >= 3 && <b className="card-progress">내 카드 {step - 2}/5</b>}<h1>{titles[step]}</h1></>}
    {step === 1 && <div className="proto-list plain">{[["bell", "재난문자를 쉬운 말로 바꿔 줘요."], ["list", "지금 할 일을 순서대로 알려줘요."], ["call", "도와줄 사람에게 바로 전화해요."]].map(([icon, text]) => <div key={text}><span><Icon name={icon as IconName} /></span><b>{text}</b></div>)}</div>}
    {step === 2 && <><TogetherIllustration /><p className="onboard-description"><span>도와줄 사람을 같이 적어요.</span><span>10분이면 돼요.</span></p><ProtoGuardian>사용자 옆에서 함께 읽고 입력해 주세요.</ProtoGuardian></>}
    {step === 3 && <div className="proto-fields"><ProtoField label="이름" placeholder="예) 김민수" required /><ProtoGuardian>인쇄용 카드에 들어가요.</ProtoGuardian></div>}
    {step === 4 && <><p className="onboard-description">급할 때 가장 먼저 전화할 사람이에요.</p><div className="proto-fields"><ProtoField label="이름" placeholder="예) 김영희" required /><ProtoField label="나와의 관계" placeholder="예) 엄마" required /><ProtoField label="전화번호" placeholder="010-0000-0000" required action="연락처에서 고르기" /><ProtoChips title="우리 집까지 오는 시간" items={["30분 안에", "1시간 안에", "더 걸려요"]} /></div></>}
    {step === 5 && <><p className="onboard-description">첫 번째 사람이 전화를 안 받을 때 걸어요.</p><div className="proto-fields"><ProtoField label="이름" placeholder="예) 박민수" /><ProtoField label="나와의 관계" placeholder="예) 이웃" /><ProtoField label="전화번호" placeholder="010-0000-0000" /><ProtoChips title="우리 집까지 오는 시간" items={["30분 안에", "1시간 안에", "더 걸려요"]} /><ProtoGuardian>적지 않으면 알림에서 이 사람에게 전화하는 줄이 없어요.</ProtoGuardian></div></>}
    {step === 6 && <><p className="onboard-description">복지관이나 센터를 적어요.</p><div className="proto-fields"><ProtoField label="기관 이름" placeholder="예) 관악복지관" /><ProtoField label="전화번호" placeholder="02-000-0000" /></div></>}
    {step === 7 && <div className="proto-fields"><ProtoField label="우리 집 주소" placeholder="예) 관악구 신림동 00-00 101호" required /><ProtoGuardian>층과 호수까지 적어 주세요. 이 동네에 오는 재난문자를 알려줘요.</ProtoGuardian><ProtoField label="내가 갈 대피소" placeholder="예) 신림초등학교" action="찾기" onAction={() => openSheet("location")} /><ProtoChips title="나에게 편한 소통 방법(여러 개)" items={["짧은 문장으로 말해 주세요", "천천히 말해 주세요", "글로 써 주세요", "그림으로 보여 주세요", "직접 적기"]} multi /><ProtoChips title="이동할 때 필요한 도움" items={["혼자 갈 수 있어요", "같이 걸어 주세요", "직접 적기"]} /><ProtoField label="힘든 것" placeholder="예) 큰 소리를 무서워해요" /><ProtoField label="꼭 챙길 물건" placeholder="예) 약, 물, 휴대폰" /></div>}
    {step === 8 && <><MiniCard /><h1>{titles[step]}</h1><p className="onboard-description">이제 휴대폰을 준비해요.</p></>}
    {step === 9 && <><div className="phone-drawing"><Icon name="phone" /><span><Logo /><b>재난문자가 왔어요</b></span></div><h1>{titles[step]}</h1><p className="onboard-description">재난문자가 오면 바로 알려줘요.</p></>}
    {step === 10 && <><div className={`proto-light ${lightState === 3 ? "lit" : ""}`}><span><Icon name="light" /></span><i /><Icon name="phone" /></div><h1>{titles[step]}</h1><p className="onboard-description">차차등의 손바닥 버튼을 3초 눌러요.</p>{lightState > 0 && <section className="device-result">{lightState === 1 && <b>찾는 중 · · ·</b>}{lightState === 2 && <><b>chachadeung</b><button onClick={() => setLightState(3)}>연결하기</button></>}{lightState === 3 && <><b>차차등에 노란불이 켜졌나요?</b><div><button onClick={next}>네</button><button onClick={next}>아니요</button></div></>}</section>}</>}
    {step === 11 && <><span className="practice-icon"><Icon name="bell" /></span><h1>{titles[step]}</h1><p className="onboard-description"><span>연습 알림을 보낼게요.</span><span>다 읽고 "알았어요"를 눌러요.</span></p></>}
    {step === 12 && <><span className="done-check"><Icon name="check" /></span><h1>{titles[step]}</h1><p className="onboard-description">재난문자가 오면 차차가 알려줄게요.</p><button className="proto-row safety-row" onClick={startSafety}><span><Icon name="home" /></span><b>우리 집 안전 점검<small>5분이면 돼요.</small></b><i>›</i></button></>}
  </main><footer className="proto-fixed">
    {step === 7 && <p className="privacy"><Icon name="lock" />적은 내용은 내 휴대폰에만 저장돼요.</p>}
    {step === 0 && <ProtoButton onClick={next}>시작하기</ProtoButton>}
    {step === 1 && <ProtoButton onClick={next}>다음</ProtoButton>}
    {step === 2 && <ProtoButton onClick={next}>카드 만들기 시작</ProtoButton>}
    {step === 3 && <ProtoButton onClick={next}>다음</ProtoButton>}
    {step === 4 && <ProtoButton onClick={() => openSheet("phone-permission")}>다음</ProtoButton>}
    {step === 5 && <><ProtoButton onClick={next}>다음</ProtoButton><ProtoButton text onClick={next}>지금은 건너뛸게요</ProtoButton></>}
    {step === 6 && <><ProtoButton onClick={next}>다음</ProtoButton><ProtoButton text onClick={next}>지금은 건너뛸게요</ProtoButton></>}
    {step === 7 && <ProtoButton onClick={next}>카드 저장하기</ProtoButton>}
    {step === 8 && <><ProtoButton onClick={next}>다음</ProtoButton><ProtoButton text onClick={openPdf}>카드 PDF로 저장하기</ProtoButton></>}
    {step === 9 && <ProtoButton onClick={next}>알림 켜기</ProtoButton>}
    {step === 10 && <><ProtoButton onClick={() => lightState === 0 ? setLightState(1) : lightState === 1 ? setLightState(2) : setLightState(3)}>{lightState === 0 ? "찾기" : lightState === 1 ? "찾는 중" : lightState === 2 ? "연결하기" : "다음"}</ProtoButton><ProtoButton text onClick={next}>차차등이 없어요</ProtoButton></>}
    {step === 11 && <ProtoButton onClick={openPractice}>연습 알림 보내기</ProtoButton>}
    {step === 12 && <ProtoButton onClick={finish}>홈으로</ProtoButton>}
  </footer></section>;
}

function ProtoRow({ icon, title, description, badge, onClick, compactTitle = false }: { icon: IconName; title: string; description?: string; badge?: string; onClick: () => void; compactTitle?: boolean }) {
  return <button className="proto-row" onClick={onClick}><span><Icon name={icon} /></span><b className={compactTitle ? "text-lg! font-medium! whitespace-nowrap [&_small]:whitespace-normal" : undefined}>{title}{description && <small>{description}</small>}</b>{badge ? <em>{badge}</em> : <i>›</i>}</button>;
}

function ProtoTabs({ active, setActive }: { active: "home" | "prep" | "help" | "card"; setActive: (tab: "home" | "prep" | "help" | "card") => void }) {
  const tabs: ["home" | "prep" | "help" | "card", IconName, string][] = [["home", "bell", "알림"], ["prep", "home", "대비하기"], ["help", "call", "도움"], ["card", "people", "내 카드"]];
  return <nav className="proto-tabs">{tabs.map(([id, icon, label]) => <button className={active === id ? "active" : ""} onClick={() => setActive(id)} key={id}><Icon name={icon} /><span>{label}</span></button>)}</nav>;
}

function HomeScreen({ danger, acknowledged, openAlert, goCard, goHelp, goPrep }: { danger: boolean; acknowledged: boolean; openAlert: () => void; goCard: () => void; goHelp: () => void; goPrep: () => void }) {
  return <main className="proto-page home-page"><header className="home-head"><Logo /><em>차차등 연결됨</em></header><section className="page-heading"><h1>{danger ? <><span>지금 확인할</span><span>알림이 있어요</span></> : <><span>김민수님,</span><span>지금은 괜찮아요</span></>}</h1>{!danger && <p>관악구 · 오늘</p>}</section><div className="card-stack">{danger && <article className="danger-card"><header><em>▲ 위험</em><Icon name="cloud" /></header><h2>비가 아주 많이 와요</h2><p>물이 빨리 차올라서 위험해요.</p><ProtoButton onClick={openAlert}>{acknowledged ? "확인했어요" : "할 일 보기"}</ProtoButton></article>}{!danger && <article className="quiet-card"><span><Icon name="sun" /></span><div><h2 className="text-lg! font-bold! whitespace-nowrap">지금 온 재난문자가 없어요.</h2><p>문자가 오면 바로 알려줄게요.</p></div></article>}<article className="white-card"><ProtoRow icon="people" title="나의 재난 대비 카드" description="급할 때 바로 전화할 수 있어요." badge="준비됐어요" onClick={goCard} compactTitle /></article><article className="white-card"><ProtoRow icon="history" title="지난 알림 보기" onClick={openAlert} /></article></div><span className="hidden-links"><button onClick={goHelp}>도움</button><button onClick={goPrep}>대비</button></span></main>;
}

function HelpScreen({ choose }: { choose: (situation: string) => void }) {
  const rows: [IconName, string][] = [["people", "무서운 사람이 있어요"], ["water", "물이 들어와요"], ["alert", "다쳤어요"], ["home", "갇혔어요"], ["sun", "불이 났어요"], ["people", "사람이 쓰러졌어요"]];
  return <main className="proto-page"><section className="page-heading"><h1>도와주세요</h1><p>무슨 일이 있나요? 문자가 오지 않아도 괜찮아요.</p></section><article className="white-card help-list">{rows.map(([icon, title]) => <ProtoRow icon={icon} title={title} onClick={() => choose(title)} key={title} />)}</article><ProtoButton text onClick={() => choose("잘 모르겠어요")}>잘 모르겠어요</ProtoButton></main>;
}

function CallChoice({ situation, back, call }: { situation: string; back: () => void; call: (number: string) => void }) {
  const emergency = situation !== "무서운 사람이 있어요" && situation !== "잘 모르겠어요";
  return <main className="proto-page"><button className="proto-back" onClick={back}>‹ 뒤로</button><em className="situation-pill">{situation}</em><section className="page-heading compact"><h1>누구에게 전화할까요?</h1></section><article className="white-card help-list"><ProtoRow icon={emergency ? "alert" : "call"} title={`${emergency ? "119" : "112"}에 전화하기`} description={emergency ? "구해 주는 곳이에요" : "경찰이 오는 곳이에요"} onClick={() => call(emergency ? "119" : "112")} /><ProtoRow icon="people" title="엄마에게 전화하기" description="김영희" onClick={() => call("엄마")} /><ProtoRow icon="building" title="선생님에게 전화하기" description="관악복지관" onClick={() => call("선생님")} /></article><p className="card-note">내 카드에 적은 사람이에요.</p></main>;
}

function PrepScreen({ goCard, startSafety, safetyComplete }: { goCard: () => void; startSafety: () => void; safetyComplete: boolean }) {
  return <main className="proto-page"><section className="page-heading"><h1>재난을 미리 준비해요</h1><p>천천히 하나씩 하면 돼요.</p></section><div className="card-stack"><article className="task-card"><span><Icon name="people" /></span><h2>나의 재난 대비 카드</h2><p>급할 때 도와줄 사람을 적어요.</p><ProtoButton onClick={goCard}>카드 보기</ProtoButton></article><article className="task-card"><header><span><Icon name="home" /></span>{safetyComplete && <em>10월 9일 점검</em>}</header><h2>우리 집 안전 점검</h2><p>{safetyComplete ? "준비할 것이 4개 있어요." : "집이 안전한지 확인해요."}</p><ProtoButton secondary onClick={startSafety}>{safetyComplete ? "결과 보기" : "점검하기"}</ProtoButton></article></div></main>;
}

const cardItems = [["이름", "김민수"], ["우리 집 주소", "관악구 신림동 00-00 101호"], ["도와줄 사람", "김영희 (엄마) · 010-1234-5678 · 30분 안에"], ["또 다른 사람", "박민수 (이웃) · 010-9876-5432"], ["기관", "관악복지관 · 02-000-0000"], ["내가 갈 대피소", "신림초등학교 · 걸어서 7분"], ["소통 방법", "짧은 문장으로 말해 주세요"], ["이동 도움", "같이 걸어 주세요"], ["힘든 것", "큰 소리를 무서워해요"], ["챙길 물건", "약, 물, 휴대폰"]];

function ProtoCard({ openPdf, call, edit }: { openPdf: () => void; call: () => void; edit: () => void }) {
  return <main className="proto-page card-page"><section className="page-heading"><h1>나의 재난 대비 카드</h1><p>급할 때 이 카드를 보여 주세요.</p></section><article className="disaster-card"><header><Logo /><b>차차 재난 대비 카드</b><button onClick={edit}>고치기</button></header>{cardItems.map(([label, value]) => <section key={label}><b>{label}</b><p>{value}{["도와줄 사람", "또 다른 사람", "기관"].includes(label) && <button onClick={call}><Icon name="call" /></button>}</p></section>)}</article><div className="split-actions"><ProtoButton onClick={openPdf}>PDF로 저장</ProtoButton><ProtoButton secondary onClick={openPdf}>인쇄하기</ProtoButton></div></main>;
}

function LockScreen({ openAlert }: { openAlert: () => void }) {
  return <main className="lock-screen"><div className="lock-time"><b>오후 2:20</b><span>8월 15일 토요일</span></div><button className="lock-notification primary" onClick={openAlert}><header><Logo /><span>· 지금</span></header><em>▲ 위험</em><b>비가 아주 많이 와요</b><p>물이 빨리 차올라서 위험해요.</p></button><article className="lock-notification"><b>위급재난문자</b><p>[기상청] 관악구 호우경보 발효. 하천변, 지하공간 등 위험지역 접근을 자제하고…</p></article></main>;
}

function ProtoAlert({ type, acknowledge, call, source }: { type: Disaster; acknowledge: () => void; call: () => void; source: () => void }) {
  const data = alertData[type]; const calls = data.actions.filter((a) => a.phone); const first = data.actions.findIndex((a) => a.phone);
  return <article className={`prototype-alert ${data.level}`}><header><b>{data.level === "danger" ? "▲ 위험" : data.level === "caution" ? "● 주의" : "● 연습"}</b><div><span><Icon name={data.hero} /></span><h1>{data.title}</h1></div></header><main><section className="alert-card"><p>{data.situation}</p><h2>이렇게 해요</h2><div className="proto-actions">{data.actions.map((action, index) => { if (action.phone && index !== first) return null; if (action.phone) return <div className="proto-call-group" key="phones">{calls.map((item, n) => <button disabled={item.disabled} onClick={call} key={item.text}><i>{first + n + 1}</i><span><Lines text={item.text} /></span><Icon name="call" /></button>)}</div>; return <div className="proto-action" key={action.text}><i>{index + 1}</i><span><Lines text={action.text} /></span>{action.icon && <Icon name={action.icon} />}</div>; })}</div></section></main><footer><ProtoButton onClick={acknowledge}>알았어요</ProtoButton>{type !== "practice" && <button onClick={source}>행정안전부 · 오후 2:20 · 원문 보기 ⌄</button>}</footer></article>;
}

function ProtoSheet({ kind, close, next, callNumber }: { kind: SheetKind; close: () => void; next: () => void; callNumber: string }) {
  if (!kind) return null;
  const content = kind === "phone-permission" ? ["전화를 걸려면 허락이 필요해요.", "도와줄 사람에게 바로 전화할 수 있어요.", "허락하기"] : kind === "location" ? ["위치를 쓰려면 허락이 필요해요.", "가까운 대피소를 찾아요.", "허락하기"] : kind === "source" ? ["원문 보기", "[기상청] 관악구 호우경보 발효. 하천변, 지하공간 등 위험지역 접근을 자제하고…", "닫기"] : [`${callNumber}에 전화할까요?`, callNumber === "112" ? "경찰이 오는 곳이에요." : callNumber === "119" ? "구해 주는 곳이에요." : "내 카드에 적은 사람이에요.", "전화하기"];
  return <div className="proto-sheet-wrap" onClick={close}><section className="proto-sheet" onClick={(e) => e.stopPropagation()}><i /><h2>{content[0]}</h2><p>{content[1]}</p><ProtoButton onClick={kind === "phone-permission" ? next : close}>{content[2]}</ProtoButton>{kind === "call" && <ProtoButton secondary onClick={close}>그만하기</ProtoButton>}</section></div>;
}

type SafetyAnswer = 0 | 1 | 2;
type SafetyQuestion = {
  id: number;
  category: string;
  icon: LucideIcon;
  question: string;
  description: string;
  answers: [string, string];
  tip: string;
  lowerFloors?: boolean;
};

const safetyQuestions: SafetyQuestion[] = [
  { id: 1, category: "불이 났을 때", icon: FireExtinguisher, question: "소화기가 있나요?", description: "불이 났을 때 사용할 수 있어요.", answers: ["있어요", "없어요"], tip: "보호자와 함께 소화기를 준비해요." },
  { id: 2, category: "불이 났을 때", icon: MapPin, question: "소화기가 어디 있는지 아나요?", description: "급할 때 바로 찾아야 해요.", answers: ["알아요", "몰라요"], tip: "현관 가까이에 두면 찾기 쉬워요." },
  { id: 3, category: "불이 났을 때", icon: BellRing, question: "집에 화재경보기가 있나요?", description: "연기가 나면 소리로 알려줘요.", answers: ["있어요", "없어요"], tip: "주민센터에 물어봐요." },
  { id: 4, category: "불이 났을 때", icon: DoorOpen, question: "현관까지 가는 길이 비어 있나요?", description: "빨리 나가려면 길이 비어 있어야 해요.", answers: ["비어 있어요", "짐이 있어요"], tip: "현관 앞 짐을 치워요." },
  { id: 5, category: "불이 났을 때", icon: Wrench, question: "가스 밸브가 어디 있는지 아나요?", description: "불이 나면 밸브를 잠가요.", answers: ["알아요", "몰라요"], tip: "보호자와 함께 가스 밸브를 찾아봐요." },
  { id: 6, category: "비가 많이 올 때", icon: Droplets, question: "창문 앞 물 빠지는 곳이 깨끗한가요?", description: "낙엽이 막으면 물이 안 빠져요.", answers: ["깨끗해요", "막혀 있어요"], tip: "낙엽과 쓰레기를 치워요.", lowerFloors: true },
  { id: 7, category: "비가 많이 올 때", icon: Shield, question: "물막이판이 있나요?", description: "물이 집에 들어오는 것을 막아줘요.", answers: ["있어요", "없어요"], tip: "구청에 물어봐요.", lowerFloors: true },
  { id: 8, category: "비가 많이 올 때", icon: DoorClosed, question: "물이 차면 문이 잘 열리나요?", description: "물이 많아지면 문이 안 열릴 수 있어요.", answers: ["열려요", "안 열려요"], tip: "보호자와 함께 확인해요.", lowerFloors: true },
  { id: 9, category: "비가 많이 올 때", icon: ArrowUpFromLine, question: "비가 많이 올 때 갈 높은 곳을 아나요?", description: "미리 정해 두면 좋아요.", answers: ["알아요", "몰라요"], tip: "보호자와 함께 갈 곳을 정해요." },
  { id: 10, category: "비가 많이 올 때", icon: FileText, question: "약이나 서류가 어디 있나요?", description: "물에 젖으면 못 써요.", answers: ["높은 곳에 있어요", "바닥에 있어요"], tip: "약과 서류를 높은 곳에 올려 둬요." },
  { id: 11, category: "아주 덥거나 추울 때", icon: Fan, question: "선풍기나 에어컨이 잘 되나요?", description: "미리 켜서 확인해요.", answers: ["잘 돼요", "안 돼요"], tip: "보호자에게 고쳐 달라고 해요." },
  { id: 12, category: "아주 덥거나 추울 때", icon: Building2, question: "더울 때 갈 시원한 곳을 아나요?", description: "무더위쉼터라고 해요.", answers: ["알아요", "몰라요"], tip: "주민센터에 물어봐요." },
  { id: 13, category: "아주 덥거나 추울 때", icon: GlassWater, question: "마실 물이 집에 있나요?", description: "더울 때 물을 자주 마셔요.", answers: ["있어요", "없어요"], tip: "물을 사 둬요." },
  { id: 14, category: "도움을 받을 때", icon: Flashlight, question: "손전등이 있나요?", description: "불이 꺼지면 사용해요.", answers: ["있어요", "없어요"], tip: "손전등과 건전지를 사 둬요." },
  { id: 16, category: "도움을 받을 때", icon: Backpack, question: "챙길 가방을 만들었나요?", description: "물, 약, 손전등을 넣어 두어요.", answers: ["있어요", "없어요"], tip: "보호자와 함께 가방을 싸요." },
];

function SafetyTop({ current, total, back }: { current: number; total: number; back: () => void }) {
  return <header className="safety-top"><div><button onClick={back}>‹ 뒤로</button><b>{current} / {total}</b></div><span><i style={{ width: `${(current / total) * 100}%` }} /></span></header>;
}

function SafetyIconTile({ icon: SafetyIcon }: { icon: LucideIcon }) {
  return <div className="safety-icon-tile"><SafetyIcon aria-hidden="true" size={56} strokeWidth={2} /></div>;
}

function SafetyStart({ onStart, back }: { onStart: (home: string) => void; back: () => void }) {
  const [home, setHome] = useState("");
  const homes: [LucideIcon, string][] = [[Warehouse, "반지하"], [House, "1층"], [Building2, "2층 이상"]];
  return <section className="safety-screen"><SafetyTop current={1} total={15} back={back} /><main className="safety-start"><h1>우리 집 안전 점검</h1><p>우리 집에 맞는 것만 물어볼게요. 5분이면 돼요.</p><ProtoGuardian>사용자와 함께 집을 둘러보며 답해 주세요.</ProtoGuardian><h2>우리 집은 어떤 곳인가요?</h2><div className="home-options">{homes.map(([HomeIcon, label]) => <button className={home === label ? "selected" : ""} onClick={() => setHome(label)} key={label}><span><HomeIcon size={26} strokeWidth={2} /></span><b>{label}</b>{home === label && <Icon name="check" />}</button>)}</div></main><footer className="safety-fixed"><button className="proto-button" disabled={!home} onClick={() => onStart(home)}>시작하기</button></footer></section>;
}

function SafetyQuestionScreen({ question, current, total, answer, choose, next, back }: { question: SafetyQuestion; current: number; total: number; answer?: SafetyAnswer; choose: (answer: SafetyAnswer) => void; next: () => void; back: () => void }) {
  const options = [...question.answers, "잘 모르겠어요"];
  return <section className="safety-screen"><SafetyTop current={current} total={total} back={back} /><main className="safety-question"><em>{question.category}</em><SafetyIconTile icon={question.icon} /><h1>{question.question}</h1><p>{question.description}</p><div className="answer-options">{options.map((option, index) => <button className={answer === index ? "selected" : ""} onClick={() => choose(index as SafetyAnswer)} key={option}><b>{option}</b>{answer === index && <Icon name="check" />}</button>)}</div>{answer !== undefined && answer > 0 && <aside className="safety-tip"><Info size={24} strokeWidth={2} /><div><b>이렇게 해요</b><p>{question.tip}</p></div></aside>}</main><footer className="safety-fixed"><button className="proto-button" disabled={answer === undefined} onClick={next}>다음</button></footer></section>;
}

function SafetyDetailSheet({ complete, close }: { complete: () => void; close: () => void }) {
  return <div className="proto-sheet-wrap" onClick={close}><section className="proto-sheet safety-detail" onClick={(event) => event.stopPropagation()}><i /><SafetyIconTile icon={FireExtinguisher} /><h2>소화기 준비하기</h2><ol><li><i>1</i><span>보호자와 함께 소화기를 사요.</span></li><li><i>2</i><span>현관 가까이에 둬요.</span></li><li><i>3</i><span>다 하면 아래 버튼을 눌러요.</span></li></ol><ProtoButton onClick={complete}>준비했어요</ProtoButton></section></div>;
}

function SafetySendSheet({ sent, close }: { sent: (person: string) => void; close: () => void }) {
  const [person, setPerson] = useState("김영희 (엄마)");
  return <div className="proto-sheet-wrap" onClick={close}><section className="proto-sheet safety-send" onClick={(event) => event.stopPropagation()}><i /><h2>누구에게 보낼까요?</h2><div className="send-people">{["김영희 (엄마)", "박민수 (이웃)"].map((name) => <button className={person === name ? "selected" : ""} onClick={() => setPerson(name)} key={name}><span><Users size={24} strokeWidth={2} /></span><b>{name}</b>{person === name && <Icon name="check" />}</button>)}</div><div className="send-preview"><span>김민수님의 우리 집 안전 점검 결과예요.</span><span>준비된 것 11개, 준비할 것 4개, 같이 확인할 것 1개</span><span>준비할 것: 소화기, 물막이판, 무더위쉼터, 챙길 가방</span><span>같이 확인: 물이 차면 문이 잘 열리는지</span></div><ProtoButton onClick={() => sent(person)}>문자로 보내기</ProtoButton></section></div>;
}

function SafetyResult({ prepared, completeItem, restart, home, send }: { prepared: boolean; completeItem: () => void; restart: () => void; home: () => void; send: () => void }) {
  const [detail, setDetail] = useState(false);
  const prepareItems: [LucideIcon, string][] = [[FireExtinguisher, "소화기 준비하기"], [Shield, "물막이판 물어보기"], [Building2, "무더위쉼터 알아보기"], [Backpack, "챙길 가방 만들기"]];
  return <section className="safety-screen result-screen"><header className="result-close"><button onClick={home}>×</button></header><main><span className="result-check"><Icon name="check" /></span><h1>안전 점검을 다 했어요</h1><p>2026년 10월 9일 · 반지하</p><div className="result-counts"><section><b>준비된 것</b><strong>{prepared ? 12 : 11}개</strong></section><section><b>준비할 것</b><strong>{prepared ? 3 : 4}개</strong></section><section><b>같이 확인</b><strong>1개</strong></section></div><article className="result-card"><h2>준비할 것</h2>{prepareItems.filter(([, title]) => !prepared || title !== "소화기 준비하기").map(([ItemIcon, title]) => <button onClick={() => setDetail(true)} key={title}><span><ItemIcon size={24} strokeWidth={2} /></span><b>{title}</b><i>›</i></button>)}</article><article className="result-card"><h2>같이 확인해요</h2><button onClick={() => setDetail(true)}><span><DoorClosed size={24} strokeWidth={2} /></span><b>물이 차면 문이 잘 열리는지</b><i>›</i></button></article></main><footer className="safety-fixed"><ProtoButton onClick={send}>도와주는 사람에게 보내기</ProtoButton><ProtoButton secondary onClick={restart}>다시 점검하기</ProtoButton></footer>{detail && <SafetyDetailSheet close={() => setDetail(false)} complete={() => { completeItem(); setDetail(false); }} />}</section>;
}

function SafetyCheck({ back, home, onComplete }: { back: () => void; home: () => void; onComplete: () => void }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem("chacha-safety-check") ?? "{}"); } catch { return {}; } })();
  const [view, setView] = useState<"start" | "question" | "result">(saved.complete ? "result" : saved.home ? "question" : "start");
  const [homeType, setHomeType] = useState<string>(saved.home ?? "");
  const [index, setIndex] = useState<number>(saved.index ?? 0);
  const [answers, setAnswers] = useState<Record<number, SafetyAnswer>>(saved.answers ?? {});
  const [prepared, setPrepared] = useState(Boolean(saved.prepared));
  const [sendOpen, setSendOpen] = useState(false);
  const [toast, setToast] = useState("");
  const questions = safetyQuestions.filter((question) => !question.lowerFloors || homeType !== "2층 이상");
  const question = questions[Math.min(index, questions.length - 1)];
  useEffect(() => { localStorage.setItem("chacha-safety-check", JSON.stringify({ home: homeType, index, answers, complete: view === "result", prepared })); }, [homeType, index, answers, view, prepared]);
  const start = (selectedHome: string) => { setHomeType(selectedHome); setIndex(0); setAnswers({}); setView("question"); };
  const next = () => { if (index >= questions.length - 1) { setView("result"); localStorage.setItem("chacha-safety-complete", "true"); onComplete(); } else setIndex(index + 1); };
  if (view === "start") return <SafetyStart onStart={start} back={back} />;
  if (view === "question") return <SafetyQuestionScreen question={question} current={index + 1} total={questions.length} answer={answers[question.id]} choose={(answer) => setAnswers({ ...answers, [question.id]: answer })} next={next} back={() => index === 0 ? setView("start") : setIndex(index - 1)} />;
  return <><SafetyResult prepared={prepared} completeItem={() => setPrepared(true)} restart={() => { setView("start"); setHomeType(""); setIndex(0); setAnswers({}); }} home={home} send={() => setSendOpen(true)} />{sendOpen && <SafetySendSheet close={() => setSendOpen(false)} sent={(person) => { setSendOpen(false); setToast(`${person.split(" ")[0]}님에게 보냈어요.`); window.setTimeout(() => setToast(""), 3000); }} />}{toast && <div className="safety-toast">{toast}</div>}</>;
}

function App() {
  const [screen, setScreen] = useState<AppScreen>("onboarding");
  const [onboardStep, setOnboardStep] = useState(0);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [tab, setTab] = useState<"home" | "prep" | "help" | "card">("home");
  const [danger, setDanger] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [alertType, setAlertType] = useState<Disaster>("rain");
  const [situation, setSituation] = useState("무서운 사람이 있어요");
  const [callNumber, setCallNumber] = useState("112");
  const [safetyComplete, setSafetyComplete] = useState(() => localStorage.getItem("chacha-safety-complete") === "true");
  const goHome = () => { setScreen("home"); setTab("home"); };
  const openCall = (number = "김영희") => { setCallNumber(number); setSheet("call"); };
  const setActiveTab = (next: typeof tab) => { setTab(next); setScreen(next === "home" ? "home" : next === "help" ? "help" : next === "prep" ? "prep" : "card"); };
  const content = screen === "onboarding" ? <OnboardingFlow step={onboardStep} setStep={setOnboardStep} openSheet={setSheet} openPdf={() => setScreen("pdf")} openPractice={() => { setAlertType("practice"); setScreen("alert"); }} finish={goHome} startSafety={() => setScreen("safety")} /> : screen === "safety" ? <SafetyCheck back={() => setActiveTab("prep")} home={goHome} onComplete={() => setSafetyComplete(true)} /> : screen === "lock" ? <LockScreen openAlert={() => { setAlertType("rain"); setScreen("alert"); }} /> : screen === "alert" ? <ProtoAlert type={alertType} acknowledge={() => { if (alertType === "practice") { setOnboardStep(12); setScreen("onboarding"); } else { setAcknowledged(true); setDanger(false); goHome(); } }} call={() => openCall()} source={() => setSheet("source")} /> : screen === "help" ? <HelpScreen choose={(value) => { setSituation(value); setScreen("call-choice"); }} /> : screen === "call-choice" ? <CallChoice situation={situation} back={() => setScreen("help")} call={openCall} /> : screen === "prep" ? <PrepScreen goCard={() => setActiveTab("card")} startSafety={() => setScreen("safety")} safetyComplete={safetyComplete} /> : screen === "card" ? <ProtoCard openPdf={() => setScreen("pdf")} call={() => openCall()} edit={() => { setOnboardStep(3); setScreen("onboarding"); }} /> : screen === "pdf" ? <main className="pdf-preview-screen"><button className="proto-back" onClick={() => setActiveTab("card")}>‹ 뒤로</button><div><PdfPreview /></div><footer><ProtoButton onClick={() => setActiveTab("card")}>저장하기</ProtoButton></footer></main> : <HomeScreen danger={danger} acknowledged={acknowledged} openAlert={() => { setAlertType("rain"); setScreen("alert"); }} goCard={() => setActiveTab("card")} goHelp={() => setActiveTab("help")} goPrep={() => setActiveTab("prep")} />;
  const showTabs = ["home", "help", "prep", "card"].includes(screen);
  // 잠금화면·빨간 알림 화면은 배경이 어둡다 → 상태바 글자를 흰색으로.
  // 그 외 화면은 밝은 배경 → 상태바 글자를 검은색으로.
  const lightStatusBar = screen === "lock" || (screen === "alert" && alertType !== "heat");
  // 네이티브(iOS/Android)에서만 진짜 상태바 스타일을 바꾼다. 웹에서는 조용히 무시.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Capacitor: Style.Dark = 어두운 배경용(흰 글자), Style.Light = 밝은 배경용(검은 글자)
    NativeStatusBar.setStyle({
      style: lightStatusBar ? NativeStatusBarStyle.Dark : NativeStatusBarStyle.Light,
    }).catch(() => {});
  }, [lightStatusBar]);
  // 안드로이드에서는 상태바를 WebView 위에 겹치게 둬서 edge-to-edge 유지
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    NativeStatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
  }, []);
  return <div className="prototype-stage"><div className="iphone-frame"><StatusBar light={lightStatusBar} /><div className="screen-transition" key={`${screen}-${onboardStep}-${alertType}`}>{content}</div>{showTabs && <ProtoTabs active={tab} setActive={setActiveTab} />}<span className="home-indicator" /><ProtoSheet kind={sheet} close={() => setSheet(null)} next={() => { setSheet(null); setOnboardStep(5); }} callNumber={callNumber} /></div></div>;
}

export default App;
