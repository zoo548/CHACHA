/*
  차차등 (dtech 재난문자 알림등) 펌웨어 v0.1
  보드: ESP32 DevKit (ESP32-WROOM-32, "ESP32 Dev Module")
  라이브러리: Adafruit NeoPixel (라이브러리 매니저에서 설치)

  앱 → 기기 명령 (블루투스 시리얼, 한 글자 + 줄바꿈)
    H : 위험(🔴)  → 빨간불 깜빡임 + 진동 반복 (확인할 때까지)
    L : 주의(🟡)  → 노란불 켜짐 + 진동 1번
    C : 확인      → 모두 끄기
  기기 → 앱
    C : 사용자가 기기 버튼을 눌러서 확인함

  우선순위: H가 켜져 있을 때 L이 오면 무시. L일 때 H가 오면 H로 바뀜. C는 언제나 끔.
  테스트: USB로 연결한 뒤 시리얼 모니터(115200)에 H / L / C 를 입력해도 똑같이 동작해요.
*/

#include "BluetoothSerial.h"
#include <Adafruit_NeoPixel.h>

// ===== 1. 바꿔도 되는 설정 =====
const char* DEVICE_NAME = "chachadeung";  // 휴대폰 블루투스 목록에 보이는 이름

const int PIN_RING = 13;   // 네오픽셀 링 DIN
const int PIN_VIB  = 25;   // 진동 모듈 IN (신호)
const int PIN_BTN  = 27;   // 확인 버튼 (다른 한쪽 다리는 GND)

const int     NUM_LEDS   = 12;  // 링 LED 개수 (8구면 8로)
const uint8_t BRIGHTNESS = 60;  // 밝기 0~255. 눈부시지 않게 낮게 시작

// 깜빡임·진동 시간 (밀리초). 감수 후 여기 숫자만 바꾸면 돼요.
const unsigned long H_LED_ON  = 300, H_LED_OFF = 200;
const unsigned long H_VIB_ON  = 500, H_VIB_OFF = 300;
const unsigned long L_VIB_ONCE = 700;
const unsigned long DEBOUNCE_MS = 50;

// 진동 모듈이 LOW일 때 떨리는 제품이면 false 로 바꿔요.
const bool VIB_ACTIVE_HIGH = true;

// ===== 2. 내부 변수 =====
BluetoothSerial SerialBT;
Adafruit_NeoPixel ring(NUM_LEDS, PIN_RING, NEO_GRB + NEO_KHZ800);

enum State { IDLE, LOW_ALERT, HIGH_ALERT };
State state = IDLE;

unsigned long stateStart = 0;
bool ledOn = false, vibOn = false;
unsigned long ledToggleAt = 0, vibToggleAt = 0;

int lastBtnReading = HIGH, btnState = HIGH;
unsigned long btnChangedAt = 0;

// ===== 3. 출력 도우미 =====
void setRing(uint8_t r, uint8_t g, uint8_t b) {
  for (int i = 0; i < NUM_LEDS; i++) ring.setPixelColor(i, ring.Color(r, g, b));
  ring.show();
}
void ringRed()    { setRing(255, 0, 0); }
void ringYellow() { setRing(255, 150, 0); }
void ringOff()    { setRing(0, 0, 0); }

void setVib(bool on) {
  vibOn = on;
  digitalWrite(PIN_VIB, (on == VIB_ACTIVE_HIGH) ? HIGH : LOW);
}

// ===== 4. 상태 바꾸기 =====
void enterHigh() {
  state = HIGH_ALERT;
  unsigned long now = millis();
  stateStart = now;
  ledOn = true;  ringRed();   ledToggleAt = now + H_LED_ON;
  setVib(true);               vibToggleAt = now + H_VIB_ON;
  Serial.println("[상태] HIGH");
}

void enterLow() {
  state = LOW_ALERT;
  unsigned long now = millis();
  stateStart = now;
  ringYellow();
  setVib(true);
  vibToggleAt = now + L_VIB_ONCE;   // 이 시간이 지나면 진동만 끔 (불은 계속)
  Serial.println("[상태] LOW");
}

void enterIdle() {
  state = IDLE;
  ringOff();
  setVib(false);
  Serial.println("[상태] IDLE");
}

void handleCommand(char c) {
  if (c >= 'a' && c <= 'z') c = c - 'a' + 'A';   // 소문자도 받기
  switch (c) {
    case 'H': enterHigh(); break;
    case 'L': if (state != HIGH_ALERT) enterLow(); break;   // 위험 중에는 주의로 내려가지 않음
    case 'C': enterIdle(); break;
    default: break;   // 줄바꿈 등 다른 글자는 무시
  }
}

// ===== 5. 매 순간 할 일 (멈추지 않는 방식) =====
void updateOutputs() {
  unsigned long now = millis();
  if (state == HIGH_ALERT) {
    if ((long)(now - ledToggleAt) >= 0) {
      ledOn = !ledOn;
      if (ledOn) ringRed(); else ringOff();
      ledToggleAt = now + (ledOn ? H_LED_ON : H_LED_OFF);
    }
    if ((long)(now - vibToggleAt) >= 0) {
      setVib(!vibOn);
      vibToggleAt = now + (vibOn ? H_VIB_ON : H_VIB_OFF);
    }
  } else if (state == LOW_ALERT) {
    if (vibOn && (long)(now - vibToggleAt) >= 0) setVib(false);
  }
}

void readButton() {
  int reading = digitalRead(PIN_BTN);
  unsigned long now = millis();
  if (reading != lastBtnReading) btnChangedAt = now;
  if (now - btnChangedAt > DEBOUNCE_MS && reading != btnState) {
    btnState = reading;
    if (btnState == LOW && state != IDLE) {   // 눌렀을 때 (풀업이라 LOW)
      enterIdle();
      SerialBT.println("C");                  // 앱에도 "확인했어요" 알림
      Serial.println("[버튼] 확인");
    }
  }
  lastBtnReading = reading;
}

void readSerials() {
  while (SerialBT.available()) handleCommand((char)SerialBT.read());
  while (Serial.available())   handleCommand((char)Serial.read());
}

// ===== 6. 시작 =====
void setup() {
  Serial.begin(115200);
  pinMode(PIN_VIB, OUTPUT);
  pinMode(PIN_BTN, INPUT_PULLUP);
  setVib(false);

  ring.begin();
  ring.setBrightness(BRIGHTNESS);
  ringOff();

  SerialBT.begin(DEVICE_NAME);

  // 켜졌다는 표시: 노란불 → 빨간불 → 끔 (각 0.3초)
  ringYellow(); delay(300);
  ringRed();    delay(300);
  ringOff();
  Serial.println("차차등 준비 완료. H / L / C 를 보내 보세요.");
}

void loop() {
  readSerials();
  readButton();
  updateOutputs();
}
