// 알림·차차등·알림 화면·지난 알림에 올리지 않는 재난.
// JSON 템플릿(docs/disaster_templates.json)은 그대로 두고, 여기 id 만 빼거나 더한다.

export const EXCLUDED_DISASTER_IDS: readonly string[] = ["missing_person"]

export function isExcludedDisaster(id: string | undefined | null): boolean {
  return typeof id === "string" && EXCLUDED_DISASTER_IDS.includes(id)
}
