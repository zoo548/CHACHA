// 보호자와 사용자가 나란히 휴대폰을 보는 일러스트. 온보딩 "보호자와 함께 해요" 페이지 전용.

export function TogetherIllustration() {
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
  )
}
