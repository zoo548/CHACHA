import type { CapacitorConfig } from '@capacitor/cli'

// 차차 (Chacha) — Capacitor 설정
// - 번들 ID: kr.vess.chacha
// - 앱 이름: 차차
// - 웹 빌드 결과물 폴더: dist (Vite 기본값)
// - iOS: contentInset='never' + viewport-fit=cover + CSS env() 로
//   safe area 를 직접 처리한다.
const config: CapacitorConfig = {
  appId: 'kr.vess.chacha',
  appName: '차차',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
  },
}

export default config
