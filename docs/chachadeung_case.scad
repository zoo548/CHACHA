// 차차등 케이스 v0.1 (OpenSCAD)
// 본체(body) + 뚜껑(lid) 두 부품. 받침대 없이(서포트 없이) 출력 가능하게 설계.
// ★ 부품을 받으면 자로 재서 아래 "측정값"만 고치고 다시 내보내면 돼요.
//   OpenSCAD에서 part = "body" / "lid" / "both" 바꾸고 F6 → STL 내보내기.

part = "both";          // "body", "lid", "both"(미리보기)

// ---------- 측정값 (부품 받고 꼭 확인) ----------
ring_od       = 52;     // 네오픽셀 링 바깥지름 + 여유 2mm (12구 링: 보통 37~50mm)
ring_pocket_h = 3.2;    // 링이 들어갈 홈 깊이 (링 두께 1.6mm + 여유)
button_hole   = 24.2;   // 아케이드 버튼 구멍 (24mm 버튼 = 24.2 / 30mm 버튼 = 30.2)
board_w       = 28.5;   // ESP32 보드 너비 + 여유 (DevKit 보통 25.5~28mm)
board_l       = 56;     // ESP32 보드 길이 + 여유 (30핀 약 51mm, 38핀 약 55mm)
usb_slot_w    = 14;     // USB 케이블 구멍 너비
usb_slot_h    = 10;     // USB 케이블 구멍 높이
button_x      = 60;     // 버튼 구멍 가로 위치 (ESP32와 겹치지 않게 오른쪽으로)

// ---------- 케이스 크기 ----------
in_x = 84;  in_y = 64;  in_z = 40;   // 안쪽 공간 (가로, 세로, 높이)
wall = 2.4;                          // 벽 두께 (0.4mm 노즐 × 6줄)
floor_t = 2.0;                       // 바닥 두께
lid_t   = 2.4;                       // 뚜껑 두께
diffuser_t = 0.8;                    // 링 위 얇은 부분 (빛이 은은하게 비침)
lip_h = 4;  lip_gap = 0.25;          // 뚜껑 턱 높이 / 끼움 여유
corner_r = 6;                        // 모서리 둥글기
$fn = 64;

out_x = in_x + 2*wall;  out_y = in_y + 2*wall;  out_z = in_z + floor_t;

module rbox(x, y, z, r) {            // 모서리 둥근 상자
  hull() for (i = [r, x-r], j = [r, y-r]) translate([i, j, 0]) cylinder(r=r, h=z);
}

// ---------- 본체 ----------
module body() {
  difference() {
    rbox(out_x, out_y, out_z, corner_r);
    translate([wall, wall, floor_t]) rbox(in_x, in_y, in_z + 1, corner_r - wall);
    // 앞면: 확인 버튼 구멍 (가운데, 높이 중간)
    translate([button_x, -1, floor_t + in_z/2]) rotate([-90, 0, 0]) cylinder(d=button_hole, h=wall + 2);
    // 뒷면: USB 케이블 구멍 (바닥 가까이, 보드 위치에 맞춤)
    translate([wall + 4 + board_w/2 - usb_slot_w/2, out_y - wall - 1, floor_t + 1])
      cube([usb_slot_w, wall + 2, usb_slot_h]);
    // 바닥 글자 (안쪽에 살짝 새김)
    translate([out_x - wall - 4, wall + 4, floor_t - 0.6]) linear_extrude(1)
      mirror([1,0,0]) text("CHACHA v0.1", size=4, halign="left");
  }
  // ESP32 보드 받침 (양옆 낮은 벽): 뒷벽 쪽에 USB가 오도록 세로로 놓기
  bx = wall + 4;  by = out_y - wall - board_l;
  for (dx = [-1.6, board_w]) translate([bx + dx, by, floor_t]) cube([1.6, board_l, 4]);
  translate([bx - 1.6, by - 1.6, floor_t]) cube([board_w + 3.2, 1.6, 4]);   // 앞쪽 막음
}

// ---------- 뚜껑 ----------
module lid() {
  difference() {
    union() {
      rbox(out_x, out_y, lid_t, corner_r);
      // 본체 안으로 끼워지는 턱
      translate([wall + lip_gap, wall + lip_gap, lid_t - 0.5])
        difference() {
          rbox(in_x - 2*lip_gap, in_y - 2*lip_gap, lip_h + 0.5, corner_r - wall);
          translate([1.6, 1.6, -1]) rbox(in_x - 2*lip_gap - 3.2, in_y - 2*lip_gap - 3.2, lip_h + 2, corner_r - wall - 1.6);
        }
    }
    // 링 홈: 아래에서 파서 위쪽은 0.8mm만 남김 → 불빛이 비쳐 보임
    translate([out_x/2, out_y/2, diffuser_t]) cylinder(d=ring_od, h=lid_t + lip_h);
    // 뚜껑 가장자리 손톱 홈 (열기 쉽게)
    translate([out_x/2 - 8, -1, -1]) cube([16, 3, 1.2]);
  }
  // 링 가운데를 잡아주는 원기둥 (링 안지름에 맞춰 조절: 12구 링 안지름 약 23~36mm)
  translate([out_x/2, out_y/2, diffuser_t - 0.3]) difference() {
    cylinder(d=20, h=ring_pocket_h + 2.3);
    translate([0,0,-1]) cylinder(d=16, h=ring_pocket_h + 4);
  }
}

// ---------- 출력 ----------
// 뚜껑은 위아래를 뒤집지 않은 상태가 곧 출력 방향 (얇은 면이 바닥 → 매끈한 윗면)
if (part == "body") body();
else if (part == "lid") lid();
else { body(); translate([0, out_y + 12, 0]) lid(); }
