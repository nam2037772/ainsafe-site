# 진행상황

마지막 확인: 2026-09-07, Asia/Seoul

## 완료한 작업

### 이번 작업 — 제주 현지 콘크리트 보수보강 포지셔닝 확장

- 홈에 `보수보강 시공 범위` 5축 구간을 새로 넣었다. 누수 차단 · 균열 보수 · 구조 보강 ·
  콘크리트 복원 · 표면보호로 나누고, 각 줄에서 해당 상세 페이지로 연결한다.
  기존 서비스 카드 3장(전문 분야)은 그대로 두었다.
- 공정별 상세 페이지 3쪽을 새로 만들었다.
  - `carbon-fiber-reinforcement.html` — CFRP 탄소섬유 구조보강
  - `epoxy-crack-repair.html` — 에폭시 균열보수 · 저압주입 · 기계식 인젝션
  - `concrete-surface-protection.html` — 표면강화 · 발수코팅
- `reinforcement.html` 에 `증상별 공법 선택 가이드`(7줄)와
  `구조설계 · 안전진단과 연계한 제주 현장 시공` 구간을 추가했다.
- `concrete.html` · `waterproof.html` · `reinforcement.html` 에서 새 상세 페이지로
  가는 내부링크와 JSON-LD `isRelatedTo` 를 이었다.
- 기술자료 위젯에 `data-resource-ids` 를 추가했다. 최신순 대신 주제로 골라 둔
  자료를 적은 순서 그대로 쓴다(빌드와 main.js 양쪽 같은 규칙).
- 시공사례 세부 공종 이름을 대응표에 넣었다(에폭시저압주입 · 에폭시인젝션 ·
  탄소섬유 · 표면강화). 사례를 올리는 순간 필터가 저절로 생긴다.
- llms.txt 에 새 페이지 3건과 빠져 있던 기술자료 2건(015 · 016)을 넣었다.
- CONTENT_GUIDE.md 에 보수보강 세부 공종 표와 TEST · MOCK-UP 사례 표기 규칙을 적었다.

## 현재 프로젝트 상태

- 정적 HTML, CSS, Vanilla JavaScript 기반 사이트이며 GitHub Pages 에 게시하는 구조다.
- `node tools/build-site.js --write` 71개 파일 생성, `node tools/check-site.js` 61건 전부 통과.
  `node tools/check-cases.js` 20건 통과.
- sitemap 66건(정적 12 · 기술자료 16 · 시공사례 38).
- 기존 페이지의 title · description · canonical 은 하나도 바뀌지 않았다.
  생성 페이지의 변경은 CSS · JS 캐시 해시뿐이다.

## 확인한 것

- 신규 3쪽 모두 로컬 서버에서 HTTP 200, 모바일 390px 에서 가로 넘침 0(`scrollWidth == clientWidth`).
- CFRP 페이지 히어로는 `reinforcement.html` 과 같은 사진을 쓰므로,
  같은 대비 보정(`body[data-page=carbon-fiber]`)을 함께 적용했다.
- 홈 5축 구간은 599px 이하에서 항목을 세로로 쌓는다. 격자·플렉스 칸에
  `min-width:0` 을 주어 긴 항목이 화면 밖으로 밀리지 않게 했다.
- llms.txt 의 사이트 내부 링크 45건이 모두 실제 파일이다.

## 남은 작업

- 배포 후 실제 주소에서 신규 3쪽의 HTTP 200 과 검색엔진 노출을 확인한다.
- Google Search Console · 네이버 서치어드바이저에 sitemap 재제출.
- 보수보강 실적(에폭시 · CFRP)이 생기면 시공사례로 올린다.
  아직 없는 실적을 채우지 않는다.

## 알려진 문제 / 주의사항

- `build-site.js` 는 `SHELL_PAGES` 의 머리말·꼬리말과 `WIDGET_PAGES` 의 관련 콘텐츠
  위젯을 다시 쓴다. 새 페이지 3쪽도 두 목록에 들어가 있다.
- `homepage-subpages.css` 는 `.tech__media{display:none}` 으로 공법 설명 이미지를
  사이트 전체에서 숨긴다(문구가 박힌 홍보 이미지를 내보내지 않기 위함).
  새 페이지의 `.tech` 구간도 글만 보인다 — 마크업은 기존 페이지와 같게 두었다.
- 히어로에 쓸 수 있는 문구 없는 사진이 많지 않다.
  `hero/tech-*.jpg` 와 `waterproof-main.jpg` 는 문구가 박힌 홍보 이미지이므로
  히어로에 쓰지 않는다.
- JSON-LD 에 FAQPage · HowTo · Review · 평점 · 가격을 넣지 않는다.
  `check-site.js` 가 막는다. FAQ 는 화면 본문(`.qa`)으로만 쓴다.
- 기존 `contact.html` 변경(상담 안내 문구)은 이번 작업 범위가 아니며 그대로 두었다.

## 마지막으로 검증한 파일과 관계

- `data/site-content.js` → `tools/build-site.js` → `index.html`: 5축 구간 생성 — [CODE-CONFIRMED].
- `assets/css/home-inline.css`: `.scopes` · `.scope-list` 구간 스타일 추가 — [CODE-CONFIRMED].
- `tools/build-site.js` `SERVICE_BY_CATEGORY` → 사례 상세의 `about` 서비스 링크 — [CODE-CONFIRMED].
- `assets/js/content.js` `CATEGORY_ALIASES` → 통합 필터 분류 — [CODE-CONFIRMED].
- `tools/check-site.js` `ROOT_PAGES` · `EXPECT` → 신규 3쪽 검사 대상 편입 — [CODE-CONFIRMED].
