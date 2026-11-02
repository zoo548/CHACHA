# 우리 집 안전점검 사진

앱은 `public/photos/check/{항목id}.jpg` 를 보여 줍니다.
파일이 없으면 그림 아이콘을 보여 줍니다.

## 지금 쓰는 항목

| 항목id | 질문 | 필요한 사진 | 우리 집 사진 찍기 |
|---|---|---|---|
| fire_extinguisher | 집에 소화기가 있어요? | 빨간 가정용 소화기 한 대, 정면 | 있음 |
| smoke_alarm | 천장에 화재경보기가 있어요? | 천장에 달린 둥근 흰색 화재경보기 | 없음 |
| gas_valve | 가스 밸브가 어디 있는지 알아요? | 한국 가정용 가스 중간밸브 | 있음 |
| clear_exit | 현관 가는 길에 물건이 없어요? | 짐이 없는 현관으로 가는 길 | 있음 |
| emergency_kit | 손전등과 약을 한곳에 챙겨 뒀어요? | 손전등과 약을 한곳에 둔 모습 | 없음 |

넣을 파일 이름:

- `public/photos/check/fire_extinguisher.jpg`
- `public/photos/check/smoke_alarm.jpg`
- `public/photos/check/gas_valve.jpg`
- `public/photos/check/clear_exit.jpg`
- `public/photos/check/emergency_kit.jpg`

`gas_valve` 는 한국 집 밸브라 위키미디어 후보가 없습니다. 직접 촬영이 필요해요.

## 예전 번호 → 지금 이름

예전에는 숫자 id 로 `1.jpg` 처럼 쓰려 했습니다. 지금 화면 5개만 연결합니다.

| 예전 id | 지금 항목id | 비고 |
|---|---|---|
| 1 | fire_extinguisher | 소화기 |
| 2 | (화면에서 뺌) | 소화기 위치 |
| 3 | smoke_alarm | 화재경보기 |
| 4 | clear_exit | 현관 가는 길 |
| 5 | gas_valve | 가스 밸브, 직접 촬영 |
| 6–13 | (화면에서 뺌) | 상세 점검용으로 코드에 남김 |
| 14, 16 | emergency_kit | 손전등·약을 한곳으로 합침 |

빠진 항목의 문장은 `src/data/safetyQuestions.extra.ts` 에 있습니다.
후보 사진은 `docs/check_photos_candidates.html` 을 보세요.
