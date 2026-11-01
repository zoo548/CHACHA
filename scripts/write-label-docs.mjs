// docs/short_labels_draft.md 와 docs/icons_needed.md 초안을 JSON 문장에서 만든다.
// JSON 파일 자체는 고치지 않는다.

import { readFileSync, writeFileSync } from "node:fs"

const templates = JSON.parse(readFileSync("docs/disaster_templates.json", "utf8"))

function shortFor(text) {
  if (text.includes("112")) return "112 전화"
  if (text.includes("119")) return "119 전화"
  if (text.includes("{이웃}") || /이웃에게/.test(text)) return "이웃 전화"
  if (text.includes("{보호자}") || /보호자에게/.test(text)) return "보호자 전화"
  if (text.includes("집 안에") || text.includes("집 밖으로 나가지")) return "집에 있기"
  if (text.includes("창문과 문") || text.includes("창문을")) return "창문 닫기"
  if (text.includes("창문에서 멀리")) return "창문 멀리"
  if (text.includes("강, 개울") || text.includes("강 가까이")) return "강 멀리"
  if (text.includes("물이 흐르는 길")) return "물길 금지"
  if (text.includes("바닷가") || text.includes("바다에") || text.includes("바닷물")) return "바다 멀리"
  if (text.includes("산에 가지") || text.includes("산에서 멀리") || text.includes("산 가까이")) return "산 멀리"
  if (text.includes("지하 주차장")) return "지하 금지"
  if (text.includes("지하에 있으면") || text.includes("밖으로 나와요")) return "밖으로"
  if (text.includes("건물 지하로")) return "지하로"
  if (text.includes("책상") || text.includes("머리를 가려요") || text.includes("방석")) return "머리 가리기"
  if (text.includes("물을 자주") || text.includes("마실 물")) return "물 마시기"
  if (text.includes("시원한 곳")) return "시원한 곳"
  if (text.includes("젖은 수건")) return "수건 막기"
  if (text.includes("안내하는 사람")) return "따라가기"
  if (text.includes("휴대폰, 신분증")) return "물건 챙기기"
  if (text.includes("간판") || text.includes("큰 나무")) return "나무 멀리"
  if (text.includes("밖에 오래") || text.includes("낮에는 밖에")) return "밖에 짧게"
  if (text.includes("불이 난 곳")) return "불 멀리"
  if (text.includes("따뜻한 옷") || text.includes("모자와 장갑") || text.includes("따뜻하게")) return "따뜻하게"
  if (text.includes("천천히 걸어요")) return "천천히"
  if (text.includes("미끄럽지 않은 신발")) return "미끄럼 신발"
  if (text.includes("엘리베이터")) return "계단으로"
  if (text.includes("건물에서 멀리")) return "건물 멀리"
  if (text.includes("마스크")) return "마스크"
  if (text.includes("손과 얼굴") || text.includes("손을 자주") || text.includes("몸을 씻")) return "손 씻기"
  if (text.includes("건물 안으로")) return "안으로"
  if (text.includes("물을 아껴") || text.includes("물을 짧게") || text.includes("물을 받아서") || text.includes("물을 미리") || text.includes("처음 물은")) return "물 아끼기"
  if (text.includes("주머니에 손")) return "손 빼기"
  if (text.includes("가스가 새는")) return "가스 멀리"
  if (text.includes("라이터") || text.includes("불을 켜지")) return "불 켜지 않기"
  if (text.includes("불빛을 켜요")) return "불빛 켜기"
  if (text.includes("코드를 뽑아요")) return "코드 뽑기"
  if (text.includes("옷소매")) return "입 가리기"
  if (text.includes("지하가 어디인지")) return "지하 알아두기"
  if (text.includes("문자가 또")) return "문자 보기"
  if (text.includes("무너진 곳")) return "무너진 곳 금지"
  if (text.includes("다른 길로") || text.includes("막힌 길")) return "다른 길로"
  if (text.includes("사람이 많은 곳")) return "사람 피하기"
  if (text.includes("가장자리")) return "가장자리"
  if (text.includes("두 팔로 가슴")) return "가슴 감싸기"
  if (text.includes("사진을 봐요")) return "사진 보기"
  if (text.includes("그냥 넘어가도")) return "그냥 두기"
  if (text.includes("산 위나 물가")) return "물가 금지"
  return "천천히"
}

function suggestIcon(text, existing) {
  if (existing) return existing
  if (text.includes("112")) return "phone_112"
  if (text.includes("119")) return "phone_119"
  if (text.includes("{이웃}") || /이웃에게/.test(text)) return "phone_neighbor"
  if (text.includes("{보호자}") || /보호자에게/.test(text)) return "phone_guardian"
  if (text.includes("집 안에") || text.includes("집 밖으로 나가지")) return "stay_home"
  if (text.includes("창문과 문") || text.includes("창문을")) return "close_window"
  if (text.includes("창문에서 멀리")) return "away_window"
  if (text.includes("강, 개울") || text.includes("강 가까이") || text.includes("물이 흐르는 길")) return "no_river"
  if (text.includes("바닷가") || text.includes("바다에") || text.includes("바닷물")) return "away_sea"
  if (text.includes("산에 가지") || text.includes("산 가까이")) return "no_mountain"
  if (text.includes("산에서 멀리")) return "away_mountain"
  if (text.includes("지하 주차장")) return "no_basement"
  if (text.includes("지하에 있으면") || text.includes("밖으로 나와요")) return "exit_basement"
  if (text.includes("건물 지하로") || text.includes("지하가 어디인지")) return "go_underground"
  if (text.includes("책상") || text.includes("머리를 가려요") || text.includes("방석")) return "under_desk"
  if (text.includes("물을 자주") || text.includes("마실 물")) return "drink_water"
  if (text.includes("시원한 곳")) return "cool_place"
  if (text.includes("젖은 수건")) return "wet_towel"
  if (text.includes("안내하는 사람")) return "follow_guide"
  if (text.includes("휴대폰, 신분증")) return "bag_ready"
  if (text.includes("간판") || text.includes("큰 나무")) return "no_sign"
  if (text.includes("밖에 오래") || text.includes("낮에는 밖에")) return "stay_out_short"
  if (text.includes("불이 난 곳")) return "no_fire_site"
  if (text.includes("따뜻한 옷") || text.includes("모자와 장갑") || text.includes("따뜻하게")) return "warm_clothes"
  if (text.includes("천천히 걸어요")) return "walk_slow"
  if (text.includes("미끄럽지 않은 신발")) return "anti_slip"
  if (text.includes("엘리베이터")) return "use_stairs"
  if (text.includes("건물에서 멀리")) return "away_building"
  if (text.includes("건물 안으로")) return "go_inside"
  if (text.includes("마스크")) return "wear_mask"
  if (text.includes("손과 얼굴") || text.includes("손을 자주") || text.includes("몸을 씻")) return "wash_hands"
  if (text.includes("물을 아껴") || text.includes("물을 짧게") || text.includes("물을 받아서") || text.includes("물을 미리") || text.includes("처음 물은")) return "save_water"
  if (text.includes("주머니에 손")) return "hands_out"
  if (text.includes("가스가 새는")) return "no_gas"
  if (text.includes("라이터") || text.includes("불을 켜지")) return "no_flame"
  if (text.includes("불빛을 켜요")) return "phone_light"
  if (text.includes("코드를 뽑아요")) return "unplug"
  if (text.includes("옷소매")) return "sleeve_cough"
  if (text.includes("문자가 또") || text.includes("사진을 봐요")) return "watch_sms"
  if (text.includes("무너진 곳")) return "no_collapse"
  if (text.includes("다른 길로") || text.includes("막힌 길")) return "other_way"
  if (text.includes("사람이 많은 곳")) return "no_crowd"
  if (text.includes("가장자리")) return "go_edge"
  if (text.includes("두 팔로 가슴")) return "hug_chest"
  if (text.includes("그냥 넘어가도")) return "pass_ok"
  if (text.includes("산 위나 물가")) return "no_peak_water"
  return ""
}

const DESCRIPTIONS = {
  phone_112: "112가 적힌 전화기 그림.",
  phone_119: "119가 적힌 전화기 그림.",
  phone_neighbor: "이웃 사람에게 전화하는 그림.",
  phone_guardian: "도와줄 사람에게 전화하는 그림.",
  stay_home: "집 안에 있는 사람 그림.",
  close_window: "창문을 닫는 그림.",
  away_window: "창문에서 물러서는 그림.",
  no_river: "강·물에 가지 말라는 그림.",
  away_sea: "바닷가에서 물러서는 그림.",
  no_mountain: "산에 가지 말라는 그림.",
  away_mountain: "산에서 멀리 떨어지는 그림.",
  exit_basement: "지하에서 밖으로 나오는 그림.",
  no_basement: "지하 주차장에 가지 말라는 그림.",
  away_building: "건물에서 멀리 떨어지는 그림.",
  go_underground: "건물 지하로 들어가는 그림.",
  under_desk: "책상 밑에 들어가 머리를 가리는 그림.",
  drink_water: "물을 마시는 그림.",
  cool_place: "그늘지고 시원한 곳 그림.",
  wet_towel: "젖은 수건으로 코와 입을 막는 그림.",
  follow_guide: "안내하는 사람을 따라가는 그림.",
  bag_ready: "가방에 약과 물건을 넣는 그림.",
  no_sign: "간판·나무에서 떨어지는 물건을 피하는 그림.",
  stay_out_short: "밖에 오래 있지 않는 그림.",
  no_fire_site: "불이 난 곳에서 멀어지는 그림.",
  warm_clothes: "따뜻한 옷과 모자를 입는 그림.",
  walk_slow: "천천히 걷는 그림.",
  anti_slip: "미끄럼 없는 신발을 신는 그림.",
  use_stairs: "엘리베이터 대신 계단을 쓰는 그림.",
  go_inside: "건물 안으로 들어가거나 건물에서 멀어지는 그림.",
  wear_mask: "마스크를 쓰는 그림.",
  wash_hands: "손과 얼굴을 씻는 그림.",
  save_water: "물을 받아서 아끼는 그림.",
  hands_out: "주머니에서 손을 빼는 그림.",
  no_gas: "가스가 새는 곳에서 멀어지는 그림.",
  no_flame: "라이터와 불을 켜지 않는 그림.",
  phone_light: "휴대폰 불빛을 켜는 그림.",
  unplug: "전기 코드를 뽑는 그림.",
  sleeve_cough: "옷소매로 입을 가리는 그림.",
  watch_sms: "휴대폰 문자를 보는 그림.",
  no_collapse: "무너진 곳에 가지 않는 그림.",
  other_way: "막힌 길을 피해 돌아가는 그림.",
  no_crowd: "사람이 많은 곳을 피하는 그림.",
  go_edge: "사람이 적은 가장자리로 가는 그림.",
  hug_chest: "두 팔로 가슴을 감싸는 그림.",
  pass_ok: "모르는 사람을 그냥 지나치는 그림.",
  no_peak_water: "산 위와 물가에 가지 않는 그림.",
}

const levelLabel = { caution: "주의(caution)", evacuate: "대피(evacuate)" }

const lines = [
  "# 짧은 핵심 단어 초안",
  "",
  "JSON 문장은 바꾸지 않은 초안입니다. 같은 행동은 같은 단어를 씁니다. 글자 수는 2~8자입니다.",
  "",
]

const missing = new Map()

for (const d of templates.disasters) {
  for (const v of d.variants) {
    lines.push(`## ${d.name_official} · ${levelLabel[v.level] ?? v.level}`)
    lines.push("")
    lines.push("| 원래 문장 | 짧은 핵심 단어 초안 | 그림 이름 |")
    lines.push("| --- | --- | --- |")
    for (const a of v.actions) {
      const icon = suggestIcon(a.text, a.icon ?? "")
      lines.push(`| ${a.text} | ${shortFor(a.text)} | ${icon || "—"} |`)
      if (!a.icon) {
        if (!missing.has(icon)) missing.set(icon, { desc: DESCRIPTIONS[icon] ?? "", texts: new Set() })
        missing.get(icon).texts.add(a.text)
      }
    }
    lines.push("")
  }
}

writeFileSync("docs/short_labels_draft.md", lines.join("\n"), "utf8")

const need = [
  "# 그림이 필요한 행동",
  "",
  "`disaster_templates.json` 에서 `icon` 필드가 없는 행동입니다. 비슷한 행동은 같은 그림 이름으로 묶었습니다.",
  "이미 있는 그림 이름(`stay_home`, `phone_119` 등)은 그대로 쓰고, 없는 이름만 새로 그리면 됩니다.",
  "",
]

for (const [name, info] of [...missing.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  need.push(`## ${name || "이름 없음"}`)
  need.push("")
  need.push(info.desc || "이 행동을 한눈에 보여 주는 그림.")
  need.push("")
  for (const text of [...info.texts]) need.push(`- ${text}`)
  need.push("")
}

writeFileSync("docs/icons_needed.md", need.join("\n"), "utf8")
console.log("wrote docs/short_labels_draft.md and docs/icons_needed.md")
