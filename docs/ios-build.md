# 차차 iOS 빌드·설치 가이드 (무료 Apple ID + 내 아이폰)

iOS 앱으로 빌드해서 내 아이폰에 올리는 전체 순서예요. **Mac이 꼭 필요해요**
(Windows 에서는 설정과 Android 빌드까지만 가능).

처음 한 번만 "A. 준비" 를 하고, 그 다음부터는 **"D. 코드 고치고 다시 올리기"**
만 반복하면 돼요.

---

## A. 처음 한 번만 — Mac 준비

### 1) Xcode 설치

1. Mac 에서 **App Store** 열기
2. "Xcode" 검색 → **받기** (10GB 넘어서 시간이 꽤 걸려요)
3. 설치가 끝나면 Xcode 를 한 번 열고, 요청하는 약관(라이선스)에 **동의** 하기
4. 터미널에서 커맨드라인 도구가 켜지는지 확인

   ```bash
   xcode-select --install    # 이미 있으면 "already installed" 라고 떠요
   sudo xcodebuild -license accept
   ```

### 2) Node.js + pnpm 설치

```bash
# Homebrew 가 없으면 먼저 설치 (한 줄 복사해서 실행)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install node
npm install -g pnpm
```

### 3) CocoaPods 설치

Capacitor 8 은 Swift Package Manager 를 쓰지만, 외부 플러그인 호환성 때문에
CocoaPods 가 설치돼 있으면 좋아요.

```bash
sudo gem install cocoapods
# 또는: brew install cocoapods
pod --version    # 설치 확인
```

### 4) 저장소 가져오기

- 지금 Windows 에서 작업한 소스를 Mac 으로 옮겨요
  (GitHub/Cursor Origin 같은 원격을 쓰면 `git clone`, 아니면 USB 로 전체 폴더 복사).
- `node_modules/`, `dist/`, `ios/App/App/public/`, `ios/App/build/` 는 안 옮겨도 돼요.

```bash
cd ~/где/있는 폴더/chacha
pnpm install           # 패키지 설치
```

---

## B. 처음 한 번만 — Xcode 서명 설정 (무료 Apple ID)

### 1) Xcode 에 Apple ID 등록

1. Xcode 열기 → 상단 메뉴 **Xcode → Settings…** → **Accounts** 탭
2. 왼쪽 아래 **+** → **Apple ID** → 평소 쓰는 Apple ID 로 로그인
3. 로그인하면 Team 에 "**(내 이름) (Personal Team)**" 이 생겨요 — 이게 무료 팀.

### 2) 차차 프로젝트 열기

```bash
pnpm cap:sync:ios      # dist 를 ios 로 복사하고 플러그인 동기화
pnpm cap:open:ios      # Xcode 가 자동으로 열림
```

### 3) 프로젝트 설정 수정

Xcode 왼쪽 사이드바에서 **App** (파란 아이콘) 클릭 → 가운데 창에서:

1. **TARGETS → App** 선택
2. **Signing & Capabilities** 탭 열기
3. **Automatically manage signing** 체크
4. **Team** 드롭다운에서 조금 전 등록한 **(내 이름) (Personal Team)** 선택
5. **Bundle Identifier**: `kr.vess.chacha`
   - 무료 계정은 같은 번들 ID 로 한 번만 서명돼요. 혹시 "already registered" 오류가 나면
     `kr.vess.chacha.본인닉` 같이 뒤에 뭘 붙여서 유일하게 만들어요.
   - 번들 ID 를 바꾸면 `capacitor.config.ts` 의 `appId` 도 같이 바꾸고
     `pnpm cap:sync:ios` 다시 실행.

---

## C. 처음 한 번만 — 내 아이폰 준비

### 1) 아이폰을 Mac 에 USB 로 연결

- 아이폰에 "이 컴퓨터를 신뢰하시겠습니까?" 가 뜨면 **신뢰** 선택.
- Xcode 상단 가운데 기기 선택 칸에서 내 아이폰이 보이는지 확인.

### 2) 아이폰 "개발자 모드" 켜기 (iOS 16 이상)

1. 아이폰에서 **설정 → 개인정보 보호 및 보안 → 개발자 모드** (스크롤 아래쪽)
2. **개발자 모드** 를 켠다 → 아이폰이 **재시동**
3. 재시동 후 잠금해제하면 "개발자 모드 켬" 확인 창 → **켬** → 암호 입력

> iOS 15 이하는 "개발자 모드" 토글이 아예 없어요 — 그냥 다음 단계로.

### 3) Xcode 에서 아이폰에 설치

1. Xcode 상단 가운데에서 실행 기기를 **내 아이폰** 으로 바꿔요
2. 좌측 상단 ▶ (삼각형) 버튼 클릭
3. Mac 에서 "codesign 이 키체인에 접근하려 합니다" 창이 뜨면 **항상 허용**
4. 아이폰에 "App 설치 중" 이 보이고, 홈 화면에 **차차** 아이콘이 생겨요.

### 4) "신뢰할 수 없는 개발자" 풀어 주기

아이콘을 눌러도 "신뢰할 수 없는 개발자" 라고 나오면:

1. 아이폰에서 **설정 → 일반 → VPN 및 기기 관리**
2. 개발자 앱 아래 **내 Apple ID** (내 이메일) 를 눌러요
3. **"내 Apple ID" 신뢰** → 확인 창에서 **신뢰**
4. 홈으로 가서 차차 아이콘을 다시 누르면 열려요.

> **무료 Apple ID 는 7 일마다 서명이 만료돼요.** 7 일이 지나면 앱 아이콘을 눌러도 안 열려요.
> 그때는 `pnpm cap:run:ios` 를 다시 돌려 주면 새 서명으로 다시 설치돼요.

---

## D. 코드 고치고 아이폰에 다시 올리기 (매번 반복)

### Mac 에서

```bash
# 1. 아이폰 USB 로 연결 (이미 신뢰 눌러놨으면 끝)
# 2. 아래 한 줄만 치면 끝
pnpm cap:run:ios
```

이 한 줄이 안쪽에서 하는 일:

1. `pnpm build` — 웹 코드를 dist/ 로 다시 빌드
2. `cap sync ios` — dist 를 ios/App/App/public/ 으로 복사하고 플러그인 반영
3. `cap run ios` — Xcode 로 아이폰에 설치·실행

### 혹은 Xcode 에서 확인하면서

```bash
pnpm cap:sync:ios      # 코드만 복사 (설치 안 함)
pnpm cap:open:ios      # Xcode 열기 → ▶ 버튼으로 설치
```

### Xcode 에서 바로 안 뜨고 에러가 날 때

| 증상 | 해결 |
|------|------|
| "No account for team" | B-1 로 돌아가서 Apple ID 다시 로그인 |
| "Could not launch 'App'" + "process launch failed" | 아이폰 → 설정 → 일반 → VPN 및 기기 관리 → 내 Apple ID 신뢰 (C-4) |
| 7 일 지나서 앱이 안 열림 | `pnpm cap:run:ios` 다시 실행 |
| 번들 ID 중복 오류 | capacitor.config.ts 의 appId 에 본인닉 붙여서 유일하게. 저장 후 sync |
| 플러그인(블루투스 등) 안 보임 | `pnpm cap:sync:ios` 다시 실행 |

---

## E. 아이폰에 올리기 전에 폰 모양으로 미리 확인하는 법

Mac 설치 전이거나 가볍게 보고 싶을 때:

- `pnpm dev` → Chrome / Safari 에서 열기 → 창을 393px 폭(아이폰 15 Pro 폭)으로 줄이면 거의 똑같아요.
- Chrome DevTools 의 **Device Toolbar (Cmd+Shift+M)** 에서 iPhone 15 Pro 로 선택.
- 또는 Vercel 에 배포해 두고, 아이폰 **Bluefy** 앱으로 열면 BLE(블루투스) 도 같이 테스트 가능해요
  (@capacitor-community/bluetooth-le 는 네이티브 + 웹 BLE 모두 지원).

---

## F. 참고

- **번들 ID**: `kr.vess.chacha` (`capacitor.config.ts` 에서 바꿀 수 있음)
- **앱 이름**: 차차 (`capacitor.config.ts` 의 `appName`)
- **웹 빌드 폴더**: `dist/` → 자동으로 `ios/App/App/public/`, `android/app/src/main/assets/public/` 로 복사됨
- **네이티브 플러그인 추가하면** 반드시 `pnpm cap:sync` (양쪽 플랫폼 다시 반영)
