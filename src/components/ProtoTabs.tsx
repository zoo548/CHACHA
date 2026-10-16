// 하단 탭 바. 홈 / 대비 / 도움 / 내 카드.

import { Icon } from "./Icon"
import type { ActiveTab, IconName } from "../types"

const TAB_DEFS: [ActiveTab, IconName, string][] = [
  ["home", "bell", "알림"],
  ["prep", "home", "대비하기"],
  ["help", "call", "도움"],
  ["card", "people", "내 카드"],
]

export function ProtoTabs({
  active,
  setActive,
}: {
  active: ActiveTab
  setActive: (tab: ActiveTab) => void
}) {
  return (
    <nav className="proto-tabs">
      {TAB_DEFS.map(([id, icon, label]) => (
        <button
          className={active === id ? "active" : ""}
          onClick={() => setActive(id)}
          key={id}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
