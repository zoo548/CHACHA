# 그림이 필요한 행동

`disaster_templates.json` 에서 `icon` 이 없는 행동입니다. 문장은 고치지 않았습니다.
뜻이 같은 행동은 같은 그림 이름을 씁니다. 이미 `src/assets/icons/` 에 있는 이름은 그대로 적었습니다.

| 재난 | 단계(caution/evacuate) | 행동 문장 | 필요한 그림 설명(한 줄) | 제안 이름(영어 소문자_밑줄) |
|---|---|---|---|---|
| 호우·홍수 | caution | 지하 주차장에 가지 마세요. | 지하 주차장에 가지 말라는 그림 | no_basement |
| 호우·홍수 | caution | 밖에 나가야 하면 {보호자}에게 먼저 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 호우·홍수 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 호우·홍수 | evacuate | 물이 흐르는 길을 건너지 마세요. | 강·물에 가지 말라는 그림 | no_river |
| 태풍 | caution | 바닷가, 강가에 가지 마세요. | 바닷가에서 물러서는 그림 | away_sea |
| 태풍 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 태풍 | evacuate | 간판, 나무 옆으로 가지 마세요. | 간판·나무에서 떨어지는 물건을 피하는 그림 | no_sign |
| 폭염 | caution | 낮에는 밖에 오래 있지 마세요. | 밖에 오래 있지 않는 그림 | stay_out_short |
| 산불 | caution | 창문을 닫아요. | 창문을 닫는 그림 | close_window |
| 산불 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 화재 | caution | 불이 난 곳에 가지 마세요. | 불이 난 곳에서 멀어지는 그림 | no_fire_site |
| 한파 | caution | 따뜻한 옷을 입어요. | 따뜻한 옷과 모자를 입는 그림 | warm_clothes |
| 한파 | caution | 밖에 나가면 모자와 장갑을 챙겨요. | 따뜻한 옷과 모자를 입는 그림 | warm_clothes |
| 한파 | caution | 집 안을 따뜻하게 해요. | 따뜻한 옷과 모자를 입는 그림 | warm_clothes |
| 한파 | caution | 몸이 아프면 {보호자}나 119에 전화해요. | 119가 적힌 전화기 그림 | phone_119 |
| 대설 | caution | 집 안에 있어요. | 집 안에 있는 사람 그림 | stay_home |
| 대설 | caution | 밖에 나가면 천천히 걸어요. | 천천히 걷는 그림 | walk_slow |
| 대설 | caution | 미끄럽지 않은 신발을 신어요. | 미끄럼 없는 신발을 신는 그림 | anti_slip |
| 대설 | caution | 무서우면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 강풍·풍랑 | caution | 집 안에 있어요. | 집 안에 있는 사람 그림 | stay_home |
| 강풍·풍랑 | caution | 창문을 꼭 닫아요. | 창문을 닫는 그림 | close_window |
| 강풍·풍랑 | caution | 간판, 나무 옆으로 가지 마세요. | 간판·나무에서 떨어지는 물건을 피하는 그림 | no_sign |
| 강풍·풍랑 | caution | 바닷가에 가지 마세요. | 바닷가에서 물러서는 그림 | away_sea |
| 강풍·풍랑 | caution | 무서우면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 지진 | caution | 흔들리면 책상 밑으로 들어가요. | 책상 밑에 들어가 머리를 가리는 그림 | under_desk |
| 지진 | caution | 가방이나 방석으로 머리를 가려요. | 책상 밑에 들어가 머리를 가리는 그림 | under_desk |
| 지진 | caution | 흔들림이 멈추면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 지진 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 지진 | evacuate | 엘리베이터 말고 계단으로 나가요. | 엘리베이터 대신 계단을 쓰는 그림 | use_stairs |
| 지진 | evacuate | 밖에서는 건물에서 멀리 떨어져요. | 건물에서 멀리 떨어지는 그림 | away_building |
| 지진해일 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 지진해일 | evacuate | 바닷물이 빠져도 바닷가에 가지 마세요. | 바닷가에서 물러서는 그림 | away_sea |
| 산사태 | caution | 산에 가지 마세요. | 산에 가지 말라는 그림 | no_mountain |
| 산사태 | caution | 산 가까이 있는 길로 가지 마세요. | 산에 가지 말라는 그림 | no_mountain |
| 산사태 | caution | 이상한 소리가 나면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 산사태 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 산사태 | evacuate | 산 가까이 있는 길로 다니지 마세요. | 산에 가지 말라는 그림 | no_mountain |
| 황사 | caution | 창문을 닫아요. | 창문을 닫는 그림 | close_window |
| 황사 | caution | 밖에 나가면 마스크를 써요. | 마스크를 쓰는 그림 | wear_mask |
| 황사 | caution | 집에 오면 손과 얼굴을 씻어요. | 손과 얼굴을 씻는 그림 | wash_hands |
| 황사 | caution | 숨쉬기 힘들면 119에 전화해요. | 119가 적힌 전화기 그림 | phone_119 |
| 미세먼지 | caution | 창문을 닫아요. | 창문을 닫는 그림 | close_window |
| 미세먼지 | caution | 밖에 나가면 마스크를 써요. | 마스크를 쓰는 그림 | wear_mask |
| 미세먼지 | caution | 밖에 오래 있지 마세요. | 밖에 오래 있지 않는 그림 | stay_out_short |
| 미세먼지 | caution | 몸이 아프면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 낙뢰 | caution | 건물 안으로 들어가요. | 건물 안으로 들어가는 그림 | go_inside |
| 낙뢰 | caution | 큰 나무 밑에 있지 마세요. | 간판·나무에서 떨어지는 물건을 피하는 그림 | no_sign |
| 낙뢰 | caution | 산 위나 물가에 가지 마세요. | 산 위와 물가에 가지 않는 그림 | no_peak_water |
| 낙뢰 | caution | 무서우면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 가뭄 | caution | 물을 아껴 써요. | 물을 받아서 아끼는 그림 | save_water |
| 가뭄 | caution | 씻을 때 물을 짧게 틀어요. | 물을 받아서 아끼는 그림 | save_water |
| 가뭄 | caution | 설거지할 때 물을 받아서 써요. | 물을 받아서 아끼는 그림 | save_water |
| 댐 방류 | caution | 강, 개울, 계곡에 가지 마세요. | 강·물에 가지 말라는 그림 | no_river |
| 댐 방류 | caution | 강 가까이 있으면 바로 멀리 떨어져요. | 강·물에 가지 말라는 그림 | no_river |
| 댐 방류 | caution | 무서우면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 도로 결빙 | caution | 밖에 나가면 천천히 걸어요. | 천천히 걷는 그림 | walk_slow |
| 도로 결빙 | caution | 미끄럽지 않은 신발을 신어요. | 미끄럼 없는 신발을 신는 그림 | anti_slip |
| 도로 결빙 | caution | 주머니에 손을 넣지 마세요. | 주머니에서 손을 빼는 그림 | hands_out |
| 도로 결빙 | caution | 넘어져서 아프면 119에 전화해요. | 119가 적힌 전화기 그림 | phone_119 |
| 너울·높은 파도 | caution | 바닷가에 가지 마세요. | 바닷가에서 물러서는 그림 | away_sea |
| 너울·높은 파도 | caution | 바닷가 바위에 올라가지 마세요. | 바닷가에서 물러서는 그림 | away_sea |
| 너울·높은 파도 | caution | 바다에 들어가지 마세요. | 바닷가에서 물러서는 그림 | away_sea |
| 너울·높은 파도 | caution | 사람이 물에 빠지면 119에 전화해요. | 119가 적힌 전화기 그림 | phone_119 |
| 화학물질 누출 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 화학물질 누출 | evacuate | 집 밖으로 나가지 마세요. | 집 안에 있는 사람 그림 | stay_home |
| 화학물질 누출 | evacuate | 젖은 수건으로 코와 입을 막아요. | 젖은 수건으로 코와 입을 막는 그림 | wet_towel |
| 가스 누출 | caution | 가스가 새는 곳에 가지 마세요. | 가스가 새는 곳에서 멀어지는 그림 | no_gas |
| 가스 누출 | caution | 라이터나 불을 켜지 마세요. | 라이터와 불을 켜지 않는 그림 | no_flame |
| 가스 누출 | caution | 무서우면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 정전 | caution | 휴대폰 불빛을 켜요. | 휴대폰 불빛을 켜는 그림 | phone_light |
| 정전 | caution | 전기 제품 코드를 뽑아요. | 전기 코드를 뽑는 그림 | unplug |
| 정전 | caution | 엘리베이터는 타지 마세요. | 엘리베이터 대신 계단을 쓰는 그림 | use_stairs |
| 정전 | caution | 무서우면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 단수 | caution | 물을 미리 받아 둬요. | 물을 받아서 아끼는 그림 | save_water |
| 단수 | caution | 마실 물을 챙겨 둬요. | 물을 마시는 그림 | drink_water |
| 단수 | caution | 물이 다시 나오면 처음 물은 조금 버려요. | 물을 받아서 아끼는 그림 | save_water |
| 감염병 | caution | 손을 자주 씻어요. | 손과 얼굴을 씻는 그림 | wash_hands |
| 감염병 | caution | 사람이 많은 곳에서는 마스크를 써요. | 마스크를 쓰는 그림 | wear_mask |
| 감염병 | caution | 기침할 때 옷소매로 입을 가려요. | 옷소매로 입을 가리는 그림 | sleeve_cough |
| 감염병 | caution | 열이 나면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 공습경보 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 공습경보 | evacuate | 창문에서 멀리 떨어져 있어요. | 창문에서 물러서는 그림 | away_window |
| 경계경보 | caution | 휴대폰, 신분증, 약을 챙겨 둬요. | 가방에 약과 물건을 넣는 그림 | bag_ready |
| 경계경보 | caution | 가까운 건물 지하가 어디인지 알아 둬요. | 건물 지하로 들어가는 그림 | go_underground |
| 경계경보 | caution | 문자가 또 오면 바로 봐요. | 휴대폰 문자를 보는 그림 | watch_sms |
| 경계경보 | caution | {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 방사능 누출 | evacuate | 전화를 안 받으면 {이웃}에게 전화해요. | 이웃 사람에게 전화하는 그림 | phone_neighbor |
| 방사능 누출 | evacuate | 집 밖으로 나가지 마세요. | 집 안에 있는 사람 그림 | stay_home |
| 방사능 누출 | evacuate | 밖에 있었으면 몸을 씻어요. | 손과 얼굴을 씻는 그림 | wash_hands |
| 붕괴·땅꺼짐 | caution | 무너진 곳에 가지 마세요. | 무너진 곳에 가지 않는 그림 | no_collapse |
| 붕괴·땅꺼짐 | caution | 다른 길로 돌아가요. | 막힌 길을 피해 돌아가는 그림 | other_way |
| 붕괴·땅꺼짐 | caution | 다치면 119에 전화해요. | 119가 적힌 전화기 그림 | phone_119 |
| 인파 밀집 | caution | 사람이 많은 곳에 가지 마세요. | 사람이 많은 곳을 피하는 그림 | no_crowd |
| 인파 밀집 | caution | 사람이 적은 가장자리로 가요. | 사람이 적은 가장자리로 가는 그림 | go_edge |
| 인파 밀집 | caution | 숨쉬기 힘들면 두 팔로 가슴을 감싸요. | 두 팔로 가슴을 감싸는 그림 | hug_chest |
| 인파 밀집 | caution | 위험하면 119에 전화해요. | 119가 적힌 전화기 그림 | phone_119 |
| 교통 통제 | caution | 막힌 길로 들어가지 마세요. | 막힌 길을 피해 돌아가는 그림 | other_way |
| 교통 통제 | caution | 다른 길로 돌아가요. | 막힌 길을 피해 돌아가는 그림 | other_way |
| 교통 통제 | caution | 길을 모르면 {보호자}에게 전화해요. | 도와줄 사람에게 전화하는 그림 | phone_guardian |
| 실종 경보 | caution | 문자에 나온 사진을 봐요. | 휴대폰 문자를 보는 그림 | watch_sms |
| 실종 경보 | caution | 문자에 나온 사람을 보면 112에 전화해요. | 112가 적힌 전화기 그림 | phone_112 |
| 실종 경보 | caution | 모르는 사람이면 그냥 넘어가도 괜찮아요. | 모르는 사람을 그냥 지나치는 그림 | pass_ok |

## 이미 있는 그림으로 쓸 수 있는 이름

- away_sea
- away_window
- bag_ready
- close_window
- drink_water
- go_underground
- no_mountain
- no_river
- phone_119
- phone_guardian
- stay_home
- under_desk
- wet_towel

## 새로 만들어야 하는 그림 이름

- anti_slip
- away_building
- go_edge
- go_inside
- hands_out
- hug_chest
- no_basement
- no_collapse
- no_crowd
- no_fire_site
- no_flame
- no_gas
- no_peak_water
- no_sign
- other_way
- pass_ok
- phone_112
- phone_light
- phone_neighbor
- save_water
- sleeve_cough
- stay_out_short
- unplug
- use_stairs
- walk_slow
- warm_clothes
- wash_hands
- watch_sms
- wear_mask
