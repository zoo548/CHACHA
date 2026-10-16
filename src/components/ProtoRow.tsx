// 리스트 한 줄. 왼쪽 아이콘, 가운데 제목+설명, 오른쪽에 뱃지(> 또는 pill)

import { Icon } from "./Icon"
import type { IconName } from "../types"

export function ProtoRow({
  icon,
  title,
  description,
  badge,
  onClick,
  compactTitle = false,
}: {
  icon: IconName
  title: string
  description?: string
  badge?: string
  onClick: () => void
  compactTitle?: boolean
}) {
  return (
    <button className="proto-row" onClick={onClick}>
      <span><Icon name={icon} /></span>
      <b
        className={
          compactTitle
            ? "text-lg! font-medium! whitespace-nowrap [&_small]:whitespace-normal"
            : undefined
        }
      >
        {title}
        {description && <small>{description}</small>}
      </b>
      {badge ? <em>{badge}</em> : <i>›</i>}
    </button>
  )
}
