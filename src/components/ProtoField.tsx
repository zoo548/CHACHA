// 입력 한 줄(라벨 + 입력칸 + 오른쪽에 선택 액션).
// 지금은 프로토타입이라 실제 입력값은 저장되지 않는다 (readOnly 아님, 그냥 placeholder 표시용).

export function ProtoField({
  label,
  placeholder,
  required,
  action,
  onAction,
}: {
  label: string
  placeholder: string
  required?: boolean
  action?: string
  onAction?: () => void
}) {
  return (
    <label className="proto-field">
      <b>{label}{required && <i />}</b>
      <span>
        <input placeholder={placeholder} />
        {action && <button onClick={onAction}>{action}</button>}
      </span>
    </label>
  )
}
