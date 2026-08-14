# 주식회사 아인산업안전 — 제주 노출콘크리트 보수 전문 홈페이지

무채색 건축 포트폴리오 톤의 정적 웹사이트입니다.
빌드 도구·서버·데이터베이스 없이 **HTML + CSS + Vanilla JS** 로만 동작하며, GitHub Pages에 그대로 올리면 됩니다.

---

## 1. 파일 구조

```
ainsafe-site/
├─ index.html          메인 (히어로 · 전문성 · 기술 · 전후비교 · 사례 · 강점 · 연관분야 · 기술자료 · 채널 · 상담)
├─ concrete.html       노출콘크리트 (공정별 기준 · 시공 흐름)
├─ waterproof.html     특수방수 (인젝션 · 배면그라우팅 · 액상고무)
├─ safety.html         안전시설 (시공 범위 · 연계 시공)
├─ projects.html       시공사례 목록 (공종 필터 · 더보기)
├─ project.html        시공사례 상세  → project.html?id=아이디
├─ resources.html      기술자료 목록 (검색 · 카테고리 필터)
├─ resource.html       기술자료 상세  → resource.html?id=아이디
├─ about.html          회사소개
├─ contact.html        상담문의 · 견적문의
├─ privacy.html        개인정보처리방침
├─ 404.html            없는 페이지
├─ robots.txt / sitemap.xml
└─ assets/
   ├─ css/style.css        전체 스타일 (디자인 토큰 → 반응형 순서)
   ├─ js/config.js         회사정보 · 외부링크 · 상담채널  ← 가장 먼저 확인할 파일
   ├─ js/projects.js       시공사례 데이터
   ├─ js/resources.js      기술자료 데이터
   ├─ js/main.js           공통 동작 + 페이지별 렌더러
   └─ images/
      ├─ brand/    로고 · SNS 아이콘
      ├─ hero/     히어로 및 공법 설명 이미지
      └─ projects/ 시공사례 사진 (`-thumb` = 목록용 축소본)
```

로컬 확인:

```bash
cd ainsafe-site
python -m http.server 8777
# http://localhost:8777
```

> `index.html`을 더블클릭해도 대부분 동작하지만, 브라우저 보안 정책 때문에
> 목록/상세 렌더가 막힐 수 있습니다. 위 방식으로 확인하세요.

---

## 2. 콘텐츠 추가 방법

### 2-1. 시공사례 추가 — `assets/js/projects.js`

배열 **맨 앞**에 항목 하나를 추가하면 목록·메인·상세·관련사례에 자동 반영됩니다.

```js
{
  id: 'jeju-concrete-101',              // 상세 주소가 됩니다 → project.html?id=jeju-concrete-101
  title: '제주 ○○빌딩 층조인트 면보수',
  location: '제주시',                    // 현장 위치(선택). 상세페이지에만 표시, 분류 기준 아님
  building: '근린생활시설',
  category: '노출콘크리트',              // 노출콘크리트 | 균열보수 | 인젝션 | 특수방수 | 안전시설
  date: '2026-08',                       // 최신순 정렬 기준
  period: '4일',                         // 모르면 '' → 화면에 표시되지 않음
  summary: '파라펫 층조인트 단차 제거 및 색상 재현',
  problem: '…', method: '…', result: '…',// 비어 있으면 해당 블록이 생략됨
  thumbnail: 'assets/images/projects/101-1-thumb.jpg',
  after:     'assets/images/projects/101-1.jpg',
  before:    'assets/images/projects/101-2.jpg', // '' 이면 Before/After 비교 미표시
  images: [], featured: true             // featured: true → 메인 대표사례에 노출
}
```

사진은 `assets/images/projects/` 에 넣습니다.
파일명은 **영문·숫자·하이픈**만 사용하세요(한글 파일명은 서버에 따라 깨질 수 있습니다).
권장 크기 — 상세용 1600×1200 이하, 목록용 `-thumb` 800px 폭, JPEG 품질 80.

### 2-2. 기술자료 추가 — `assets/js/resources.js`

```js
{
  id: 'concrete-repair-009',
  title: '…', category: '노출콘크리트', date: '2026-08-01',
  summary: '목록에 노출되는 2~3줄 요약',
  thumbnail: 'assets/images/resources/xxx.jpg',  // 없으면 '' (대체 이미지 자동)
  file: 'assets/documents/xxx.pdf',              // 없으면 '' (다운로드 버튼 숨김)
  tags: ['검색', '키워드'],
  content: `<h3>소제목</h3><p>본문</p><ul><li>항목</li></ul>`
}
```

카테고리: 노출콘크리트 / 균열보수 / 인젝션 / 특수방수 / 안전시설 / 건축자재 / 시공기준 / 현장관리

> 자료를 새로 추가하면 `sitemap.xml` 에도 `resource.html?id=…` 한 줄을 추가해 주세요.
> 특정 자료의 검색 노출을 크게 키우고 싶다면, 그 자료만 별도 HTML 파일
> (예: `note-곰보보수.html`)로 복사해 두는 방식도 가능합니다.

### 2-3. 어떤 목록이 어디에 뜨는가

HTML 안의 아래 속성만 바꾸면 원하는 위치에 목록을 넣을 수 있습니다.

```html
<div class="grid grid--3" data-works="featured" data-limit="6"></div>
<div class="grid grid--3" data-works="인젝션"   data-limit="3"></div>
<div class="grid grid--4" data-resources="all"  data-limit="4"></div>
```

---

## 3. 수정 위치 안내

| 바꾸고 싶은 것 | 파일 / 위치 |
| --- | --- |
| 외부 링크(쇼핑몰·블로그·유튜브·인스타) | `assets/js/config.js` → `EXTERNAL_LINKS` |
| 사진상담 채널(메일 → 카카오톡 등) | `assets/js/config.js` → `CONTACT_CHANNELS.usePhotoChannel`, `kakao` |
| 견적문의를 외부 폼(네이버폼/구글폼)으로 | `assets/js/config.js` → `CONTACT_CHANNELS.externalForm` 에 주소 입력 |
| 사업자등록번호 | `assets/js/config.js` → `COMPANY.businessNumber` (비워두면 표시 안 함) |
| 색상 · 여백 · 폰트 | `assets/css/style.css` 최상단 `:root` 변수 |
| 대표전화 / 주소 문구 | 검색 노출을 위해 각 HTML에 **직접** 적혀 있습니다. 변경 시 전체 파일 찾아 바꾸기 |
| 도메인(canonical·sitemap) | 각 HTML `<link rel="canonical">`, `sitemap.xml`, `robots.txt` |

> 전화번호·주소는 SEO(지역 검색)와 자바스크립트 미동작 환경을 위해 HTML에 그대로 넣었습니다.
> `config.js` 는 버튼 링크·구조화 데이터 등 스크립트가 쓰는 값의 기준입니다. 두 곳을 함께 맞춰 주세요.

---

## 4. GitHub Pages 배포

1. 저장소에 `ainsafe-site` 폴더 내용을 **저장소 루트**로 올리는 것을 권장합니다.
   (하위 폴더로 올려도 모든 경로가 상대경로라 동작합니다.)
2. Settings → Pages → Source: `main` 브랜치 / `/ (root)` 선택.
3. 배포 주소가 정해지면 아래를 실제 주소로 교체합니다.
   - 각 HTML의 `<link rel="canonical">`, `og:url`
   - `sitemap.xml` 의 모든 `<loc>`
   - `robots.txt` 의 `Sitemap:`
   - `assets/js/config.js` 의 `COMPANY.siteUrl`
4. Google Search Console · 네이버 서치어드바이저에 사이트를 등록하고
   `sitemap.xml` 을 제출합니다.

---

## 5. 아직 채워야 할 항목

- [ ] 사업자등록번호 (`config.js`)
- [ ] 실제 도메인 주소 (canonical / sitemap / robots / config)
- [ ] 안전시설물 시공 사진 → `assets/images/projects/` 에 추가 후 `projects.js` 에 `category: '안전시설'` 항목 등록
- [ ] 카카오톡 상담 채널 주소 (개설 시)
- [ ] 시공사례의 건축물 종류 · 작업 기간 등 실제 정보 보완
- [ ] 회사 로고 고해상도 파일(현재 `assets/images/brand/logo.png` 사용 중)
