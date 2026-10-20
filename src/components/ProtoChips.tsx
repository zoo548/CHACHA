// 선택 칩 모음.
// - multi=false: value 는 선택된 라벨 하나(string) 혹은 ""
// - multi=true : value 는 선택된 라벨 모음(string[])
// value / onChange 를 넘기지 않으면 내부 상태로 UI 전시만 함(초기 프로토 모드).

import { useState } from "react"
import { Icon } from "./Icon"

type SingleProps = {
  title: string
  items: string[]
  multi?: false
  value?: string
  onChange?: (next: string) => void
}

type MultiProps = {
  title: string
  items: string[]
  multi: true
  value?: string[]
  onChange?: (next: string[]) => void
}

export function ProtoChips(props: SingleProps | MultiProps) {
  const { title, items } = props

  // controlled 가 아닐 때만 쓰는 내부 상태 (프로토 전시용).
  const [innerSingle, setInnerSingle] = useState<string>(items[0] ?? "")
  const [innerMulti, setInnerMulti] = useState<string[]>(items[0] ? [items[0]] : [])

  const isMulti = props.multi === true
  const controlled =
    (isMulti ? (props as MultiProps).value : (props as SingleProps).value) !== undefined

  const selected: string[] = isMulti
    ? (controlled ? ((props as MultiProps).value as string[]) : innerMulti)
    : (controlled
        ? ((props as SingleProps).value ? [(props as SingleProps).value as string] : [])
        : (innerSingle ? [innerSingle] : []))

  const toggle = (label: string) => {
    if (isMulti) {
      const next = selected.includes(label)
        ? selected.filter((item) => item !== label)
        : [...selected, label]
      if (controlled) (props as MultiProps).onChange?.(next)
      else setInnerMulti(next)
    } else {
      const next = selected.includes(label) ? "" : label
      if (controlled) (props as SingleProps).onChange?.(next)
      else setInnerSingle(next)
    }
  }

  return (
    <section className="proto-chips">
      <b>{title}</b>
      <div>
        {items.map((item) => {
          const isActive = selected.includes(item)
          return (
            <button
              className={isActive ? "active" : ""}
              onClick={() => toggle(item)}
              key={item}
            >
              {isActive && <Icon name="check" />}
              {item}
            </button>
          )
        })}
      </div>
    </section>
  )
}
