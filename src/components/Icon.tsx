// 자체 선 아이콘. lucide 를 쓰지 않고 디자인에 맞춘 작은 SVG 세트.
// 새 아이콘 추가하려면 types.ts 의 IconName 과 아래 paths 를 함께 늘려야 한다.

import type { ReactNode } from "react"
import type { IconName } from "../types"

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
}

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  )
}
