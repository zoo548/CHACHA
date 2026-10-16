// 선택 칩 모음. multi=true 면 여러 개 선택 가능. 지금은 UI 전시용 상태만 들고 있다.

import { useState } from "react"
import { Icon } from "./Icon"

export function ProtoChips({
  title,
  items,
  multi = false,
}: {
  title: string
  items: string[]
  multi?: boolean
}) {
  const [selected, setSelected] = useState<number[]>([0])
  return (
    <section className="proto-chips">
      <b>{title}</b>
      <div>
        {items.map((item, index) => (
          <button
            className={selected.includes(index) ? "active" : ""}
            onClick={() =>
              setSelected(
                multi
                  ? selected.includes(index)
                    ? selected.filter((n) => n !== index)
                    : [...selected, index]
                  : [index],
              )
            }
            key={item}
          >
            {selected.includes(index) && <Icon name="check" />}
            {item}
          </button>
        ))}
      </div>
    </section>
  )
}
