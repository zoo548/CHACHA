# 차차 알림 색 30종 (팀 검토용)

정부 발송 유형(위급/긴급/안전안내)이 아니라 차차 기준으로 색을 정한다.
코드: `src/alerts/tier.ts`. 템플릿 문장은 `docs/disaster_templates.json`을 고치지 않는다.

- **빨강** `지금 해야 해요` · 점 ●●● · 차차등 `H` (호우 `R`): 템플릿 `evacuate`
- **주황** `조심해요` · 점 ●● · 차차등 `L`: `caution` 이면서 아래 주황 목록
- **파랑** `알아두세요` · 점 ● · 차차등 `I`: 나머지 `caution`
- 실종경보는 알리지 않는다

주황 `caution` 이유:

- 갑자기 나빠질 수 있음: 호우, 태풍, 산불, 산사태, 지진, 댐 방류, 경계경보
- 잘못 행동하면 바로 다침: 화재, 너울·높은 파도, 가스 누출, 인파 밀집
- 몸의 이상을 알아차리기 어려움: 폭염

원문에 "대피"가 있으면 `matchAlert`가 `evacuate`를 고르므로 빨강이 된다.

| 재난 | id | 변형 | 차차 색 | 쉬운 이름 | 기기 | 알림 |
|---|---|---|---|---|---|---|
| 호우·홍수 | `heavy_rain` | caution | 주황 | 조심해요 | L | 함 |
| 호우·홍수 | `heavy_rain` | evacuate | 빨강 | 지금 해야 해요 | R | 함 |
| 태풍 | `typhoon` | caution | 주황 | 조심해요 | L | 함 |
| 태풍 | `typhoon` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 폭염 | `heatwave` | caution | 주황 | 조심해요 | L | 함 |
| 산불 | `wildfire` | caution | 주황 | 조심해요 | L | 함 |
| 산불 | `wildfire` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 화재 | `fire` | caution | 주황 | 조심해요 | L | 함 |
| 한파 | `cold_wave` | caution | 파랑 | 알아두세요 | I | 함 |
| 대설 | `heavy_snow` | caution | 파랑 | 알아두세요 | I | 함 |
| 강풍·풍랑 | `strong_wind` | caution | 파랑 | 알아두세요 | I | 함 |
| 지진 | `earthquake` | caution | 주황 | 조심해요 | L | 함 |
| 지진 | `earthquake` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 지진해일 | `tsunami` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 산사태 | `landslide` | caution | 주황 | 조심해요 | L | 함 |
| 산사태 | `landslide` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 황사 | `yellow_dust` | caution | 파랑 | 알아두세요 | I | 함 |
| 미세먼지 | `fine_dust` | caution | 파랑 | 알아두세요 | I | 함 |
| 낙뢰 | `lightning` | caution | 파랑 | 알아두세요 | I | 함 |
| 가뭄 | `drought` | caution | 파랑 | 알아두세요 | I | 함 |
| 댐 방류 | `dam_release` | caution | 주황 | 조심해요 | L | 함 |
| 도로 결빙 | `road_ice` | caution | 파랑 | 알아두세요 | I | 함 |
| 너울·높은 파도 | `high_wave` | caution | 주황 | 조심해요 | L | 함 |
| 화학물질 누출 | `chemical` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 가스 누출 | `gas_leak` | caution | 주황 | 조심해요 | L | 함 |
| 정전 | `blackout` | caution | 파랑 | 알아두세요 | I | 함 |
| 단수 | `water_outage` | caution | 파랑 | 알아두세요 | I | 함 |
| 감염병 | `epidemic` | caution | 파랑 | 알아두세요 | I | 함 |
| 공습경보 | `air_raid` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 경계경보 | `alert_warning` | caution | 주황 | 조심해요 | L | 함 |
| 방사능 누출 | `radiation` | evacuate | 빨강 | 지금 해야 해요 | H | 함 |
| 붕괴·땅꺼짐 | `collapse` | caution | 파랑 | 알아두세요 | I | 함 |
| 인파 밀집 | `crowd` | caution | 주황 | 조심해요 | L | 함 |
| 교통 통제 | `traffic` | caution | 파랑 | 알아두세요 | I | 함 |
| 실종 경보 | `missing_person` | caution | — | — | — | 안 함 |
