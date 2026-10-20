// 입력 한 줄 (라벨 + 입력칸 + 오른쪽 선택 액션).
//
// controlled 로 쓸 때: value + onChange 를 넘긴다.
// uncontrolled 로 쓰면(초기 프로토타입): placeholder 만 보여지는 그냥 입력칸.
//
// kind="tel" 로 넘기면 아이폰에서 숫자 키패드가 올라온다 (inputMode="tel").

export function ProtoField({
  label,
  placeholder,
  required,
  action,
  onAction,
  value,
  onChange,
  kind = "text",
}: {
  label: string
  placeholder: string
  required?: boolean
  action?: string
  onAction?: () => void
  value?: string
  onChange?: (value: string) => void
  /** text=일반 / tel=전화번호(숫자 키패드). */
  kind?: "text" | "tel"
}) {
  const inputProps =
    kind === "tel"
      ? {
          type: "tel" as const,
          inputMode: "tel" as const,
          autoComplete: "tel" as const,
          pattern: "[0-9-+ ]*",
        }
      : { type: "text" as const }

  return (
    <label className="proto-field">
      <b>
        {label}
        {required && <i />}
      </b>
      <span>
        <input
          {...inputProps}
          placeholder={placeholder}
          value={value ?? undefined}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        />
        {action && <button onClick={onAction}>{action}</button>}
      </span>
    </label>
  )
}
