/*
  차차등 (dtech 재난문자 알림등) 펌웨어 v0.2 — ESP32 BLE (Nordic UART Service)
  보드: ESP32 DevKit (ESP32-WROOM-32, "ESP32 Dev Module")
  라이브러리:
    - Adafruit NeoPixel         (라이브러리 매니저에서 설치)
    - BLE 는 ESP32 보드 패키지에 포함 — 따로 설치할 것 없음

  v0.1 → v0.2 바뀐 점 (BT 쪽만, 나머지는 그대로):
    - BluetoothSerial(클래식 BT) 제거 → BLE Nordic UART Service(NUS) 로 교체.
      ✅ iPhone 은 클래식 BT 를 지원하지 않아서, 아이폰에서 쓰려면 BLE 가 꼭 필요.
    - 서비스/캐릭터리스틱 UUID 는 NUS 표준 사용 → 차차 앱, Bluefy, nRF Connect 등
      어디서든 바로 인식.
    - 앱이 연결되면 노란불 1초 켰다 끈다 (IDLE 일 때만 — H/L 알림 중이면 그대로 둠).
    - 끊기면 자동으로 광고 재시작.

  앱 → 기기 (BLE write, NUS RX, 한 글자 + 줄바꿈)
    H : 위험(🔴)  → 빨간불 깜빡임 + 진동 반복 (확인할 때까지)
    L : 주의(🟡)  → 노란불 켜짐 + 진동 1번
    C : 확인      → 모두 끄기
  기기 → 앱 (BLE notify, NUS TX)
    C : 사용자가 기기 버튼을 눌러서 확인함

  우선순위: H 가 켜져 있을 때 L 이 오면 무시. L 일 때 H 가 오면 H 로 바뀜. C 는 언제나 끔.
  테스트: USB 로 연결한 뒤 시리얼 모니터(115200) 에 H / L / C 를 입력해도 똑같이 동작해요.
*/

#include <Adafruit_NeoPixel.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ===== 1. 바꿔도 되는 설정 =====
const char* DEVICE_NAME = "chachadeung";  // 휴대폰 블루투스/스캔 목록에 보이는 이름

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
const unsigned long CONNECT_BLINK_MS = 1000;   // 연결 확인용 노란불 1초

// 진동 모듈이 LOW 일 때 떨리는 제품이면 false 로 바꿔요.
const bool VIB_ACTIVE_HIGH = true;

// --- BLE: Nordic UART Service UUID 표준 ---
// iOS/Capacitor BLE, Bluefy, nRF Connect 전부 이 UUID 를 바로 알아봄.
#define NUS_SVC_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define NUS_RX_UUID  "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"  // 앱 → 기기 (write)
#define NUS_TX_UUID  "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"  // 기기 → 앱 (notify)

// ===== 2. 내부 변수 =====
Adafruit_NeoPixel ring(NUM_LEDS, PIN_RING, NEO_GRB + NEO_KHZ800);

enum State { IDLE, LOW_ALERT, HIGH_ALERT };
State state = IDLE;

unsigned long stateStart = 0;
bool ledOn = false, vibOn = false;
unsigned long ledToggleAt = 0, vibToggleAt = 0;

int lastBtnReading = HIGH, btnState = HIGH;
unsigned long btnChangedAt = 0;

// --- BLE 전용 ---
BLEServer*         bleServer         = nullptr;
BLECharacteristic* txChar            = nullptr;
bool               bleConnected      = false;
bool               connectBlinkOn    = false;
unsigned long      connectBlinkOffAt = 0;
bool               needsRestartAdv   = false;

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
      // ⚠️ 변경(v0.2): SerialBT.println("C") → BLE TX notify 로 앱에 알림.
      if (bleConnected && txChar) {
        txChar->setValue("C");
        txChar->notify();
      }
      Serial.println("[버튼] 확인");
    }
  }
  lastBtnReading = reading;
}

// 시리얼 모니터(USB) 테스트 경로는 그대로 유지. BLE 가 안 될 때도 디버그 가능.
void readSerial() {
  while (Serial.available()) handleCommand((char)Serial.read());
}

// 연결 확인용 노란불 1초 — IDLE 일 때만 유지하다 끔. 알림 중이면 가만히 둔다.
void tickConnectBlink() {
  if (!connectBlinkOn) return;
  if ((long)(millis() - connectBlinkOffAt) >= 0) {
    connectBlinkOn = false;
    if (state == IDLE) ringOff();
  }
}

// ===== 6. BLE 콜백 =====
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* s) {
    bleConnected = true;
    Serial.println("[BLE] 앱 연결됨");
    // IDLE 일 때만 노란불 1초 — H/L 알림 LED 를 뺏지 않음.
    if (state == IDLE) {
      ringYellow();
      connectBlinkOn = true;
      connectBlinkOffAt = millis() + CONNECT_BLINK_MS;
    }
  }
  void onDisconnect(BLEServer* s) {
    bleConnected = false;
    Serial.println("[BLE] 앱 끊김 → 광고 재시작");
    // 콜백 안에서 바로 startAdvertising() 해도 되지만, 루프에서 처리하는 게 안전.
    needsRestartAdv = true;
  }
};

class RxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* ch) {
    // 앱이 쓴 바이트열을 글자별로 handleCommand 에. "H\n" "L\n" "C\n" 모두 처리.
    std::string val = ch->getValue();
    for (size_t i = 0; i < val.length(); i++) handleCommand(val[i]);
  }
};

// ===== 7. 시작 =====
void setup() {
  Serial.begin(115200);
  pinMode(PIN_VIB, OUTPUT);
  pinMode(PIN_BTN, INPUT_PULLUP);
  setVib(false);

  ring.begin();
  ring.setBrightness(BRIGHTNESS);
  ringOff();

  // --- BLE 초기화 (Nordic UART Service) ---
  BLEDevice::init(DEVICE_NAME);
  bleServer = BLEDevice::createServer();
  bleServer->setCallbacks(new ServerCallbacks());

  BLEService* svc = bleServer->createService(NUS_SVC_UUID);

  // RX: 앱이 보낸 값을 받는 통로 (write + write-without-response 둘 다 허용 — iOS 호환).
  BLECharacteristic* rxChar = svc->createCharacteristic(
      NUS_RX_UUID,
      BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  rxChar->setCallbacks(new RxCallbacks());

  // TX: 기기가 앱에 알림을 쏘는 통로 (notify). iOS 가 subscribe 하려면 BLE2902 필수.
  txChar = svc->createCharacteristic(
      NUS_TX_UUID,
      BLECharacteristic::PROPERTY_NOTIFY);
  txChar->addDescriptor(new BLE2902());

  svc->start();

  // 광고(advertising) 시작 — 스캔하면 'chachadeung' 로 뜬다.
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(NUS_SVC_UUID);
  adv->setScanResponse(true);
  adv->setMinPreferred(0x06);   // iOS 호환성 권장값
  adv->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  // 켜졌다는 표시: 노란불 → 빨간불 → 끔 (각 0.3초)
  ringYellow(); delay(300);
  ringRed();    delay(300);
  ringOff();
  Serial.println("차차등 준비 완료. BLE 광고 중. H / L / C 를 보내 보세요.");
}

void loop() {
  readSerial();
  readButton();
  updateOutputs();
  tickConnectBlink();
  if (needsRestartAdv) {
    BLEDevice::startAdvertising();
    needsRestartAdv = false;
  }
}
