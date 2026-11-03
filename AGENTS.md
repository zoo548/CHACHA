# 차차 (Chacha)
성인 발달장애인을 위한 재난문자 쉬운정보 앱. React 19 + Vite + Tailwind v4 + TypeScript.
Capacitor로 감싸서 iOS 앱(우선)과 Android 앱으로 빌드한다. 실행: pnpm dev (직접 실행해야 함)

## 폴더
- src/ : 앱 코드 (Figma Make에서 내보낸 프로토타입에서 시작)
- docs/ : 기획 자료. 쉬운정보_변환_가이드.md, disaster_templates.json(재난문자 템플릿), 재난문자_알림기기_설계.md, chachadeung_protocol.md, alert_tiers.md, chachadeung.ino(차차등 펌웨어), chachadeung_case.scad(케이스)
- .figma/ : vite.config.ts가 쓰므로 지우거나 옮기지 않는다

## 규칙
- 재난문자 변환은 생성형 AI를 쓰지 않는다. docs/disaster_templates.json 템플릿만 매칭해서 보여준다. 템플릿 문장을 코드에서 고치거나 새로 만들지 않는다.
- 화면 문구는 docs/쉬운정보_변환_가이드.md를 따른다: 해요체, 한 문장 한 정보, 25자 이내, 수치·기호 금지.
- 지금 디자인(색, 글꼴, 간격, 화면 구성)을 바꾸지 않는다. 디자인 변경이 필요하면 먼저 물어본다.
- 색: --blue(차차 기능, 남색 #1F2A44), --danger(지금 해야 해요 H 빨강), --caution(조심해요 L 주황 #E8710A), --safety(알아두세요 I 파랑). 애니메이션·깜빡임 추가 금지. 색은 정부 발송 유형이 아니라 src/alerts/tier.ts.
- 기기 기능(블루투스, 알림, 저장, 전화)은 Capacitor 플러그인으로 만들고, 아이폰에서 동작하는지를 기준으로 판단한다. 브라우저 전용 API(Web Bluetooth 직접 호출 등)는 쓰지 않는다.
- 아이폰 화면: 노치·홈 인디케이터 영역(safe area)을 침범하지 않는다.
- 기기 명령: 앱→기기 "I\n" "L\n" "H\n" "R\n" "C\n" "F\n" "M\n" / 기기→앱 "C"(버튼 확인). 우선순위 H/R > L > I. 기기는 BLE Nordic UART Service.
- 사용자 정보는 휴대폰 안에만 저장(서버 전송 없음).
- 한 번에 한 기능만 고치고, 끝나면 바꾼 파일과 직접 확인하는 방법을 알려준다.
