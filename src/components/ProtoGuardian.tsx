// 보호자(옆에서 함께 입력해 주는 사람) 에게 보여주는 안내 상자.

import type { ReactNode } from "react"
import { Icon } from "./Icon"

export function ProtoGuardian({ children }: { children: ReactNode }) {
  return (
    <div className="proto-guardian">
      <Icon name="people" />
      <span>{children}</span>
    </div>
  )
}
