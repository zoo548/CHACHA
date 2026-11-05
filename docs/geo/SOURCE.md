# 시·군·구 경계 데이터

앱의 `public/geo/sigungu.json` 은 지도 API 키 없이, 휴대폰 안에서 좌표 → 시·군·구만 찾을 때 씁니다. 좌표는 서버로 보내지 않습니다.

## 출처

- 원자료: 통계청 통계지리정보서비스(SGIS) 센서스용 행정구역 경계(시군구)
- 공개 저장소: [southkorea/southkorea-maps](https://github.com/southkorea/southkorea-maps) `kostat/2018/json/skorea-municipalities-2018-geo.json`
- 라이선스: 공공누리 제1유형 (출처 표시). southkorea-maps 의 `kostat/2018/json/LICENSE.md` 에 통계청 제공·2018-12-24 수집이라고 적혀 있습니다.
- 기준 연도: **2018** (센서스용 경계, 기준일 해당 연도 6월 30일)

시·도 이름은 2024년 이후 공식 명칭으로 바꿨습니다. (강원특별자치도, 전북특별자치도) 경계 선 자체는 2018년 자료입니다.

## 단순화

원본 GeoJSON 은 약 18MB 입니다. 앱에 넣기 위해 Visvalingam 방식으로 약 6%만 남기고, 좌표는 소수 4자리(약 10m)로 줄였습니다. 결과 파일은 1MB 안팎입니다.

```
npx mapshaper raw.json -simplify visvalingam 6% keep-shapes -filter-fields name,code -o format=geojson precision=0.0001 simple.json
```

속성만 `sido`, `sigungu` 로 남겼습니다. `성남시분당구` 처럼 붙어 있는 일반구 이름은 `성남시 분당구` 로 띄웠습니다.
