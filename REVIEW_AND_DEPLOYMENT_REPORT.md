# 아인산업안전 홈페이지 코드 리뷰 및 배포 점검 보고서

- 점검일: 2026-07-21
- 대상: `ainsafe-site`
- 구성: HTML, CSS, Vanilla JavaScript, 정적 GitHub Pages 배포 구조

## 1. 발견한 주요 문제

1. 온라인몰 주소와 대표 사이트 주소가 모두 `https://ainsafety.com`으로 들어 있었지만 `config.js`, `README.md`, `sitemap.xml`에서는 확정 전 TODO로 표시되어 있었습니다.
2. 잘못된 `category` URL 파라미터가 들어오면 필터에 선택된 항목 없이 빈 목록이 표시될 수 있었습니다.
3. 메인 Before/After DOM 일부가 누락된 상태에서 스크립트가 실행되면 null 참조가 발생할 여지가 있었습니다.
4. 모바일 푸터 링크와 기술자료 다운로드 링크 일부가 44px 권장 터치 영역보다 작았습니다.
5. 모바일 메뉴 버튼의 `aria-expanded` 상태는 바뀌었지만 접근성 이름은 계속 "메뉴 열기"로 남았습니다.
6. Ken Burns 효과가 모바일에서도 계속 실행되고, 데스크톱 확대 폭도 비교적 컸습니다.
7. 요청문에 언급된 `implementation_plan.md`, `task.md`, `walkthrough.md`는 프로젝트에 존재하지 않았습니다.
8. 프로젝트 폴더와 상위 폴더에 정상적인 Git 저장소 메타데이터가 없고, 인증된 GitHub 계정에도 대응 저장소가 없었습니다.

## 2. 수정한 문제

- 임시 온라인몰 URL을 제거하고 모든 페이지에서 `aria-disabled`, 준비 중 안내, 비활성 스타일을 적용했습니다.
- 잘못된 시공사례·기술자료 카테고리는 안전하게 전체 목록으로 정규화했습니다.
- 메인 Before/After 필수 DOM이 없으면 해당 위젯을 숨기도록 방어 코드를 추가했습니다.
- 모바일 메뉴 열기/닫기 상태에 맞춰 접근성 이름을 갱신했습니다.
- 모바일 푸터 링크와 기술자료 다운로드 링크의 최소 터치 높이를 44px로 맞췄습니다.
- hover 시각 효과에 키보드 `focus-visible` 대응을 추가했습니다.
- Ken Burns 확대를 1.08에서 1.055로 줄이고 주기를 20초에서 24초로 늦췄으며, 768px 이하에서는 비활성화했습니다.

## 3. 수정한 파일

- `assets/js/main.js`
- `assets/js/config.js`
- `assets/css/style.css`
- `404.html`
- `about.html`
- `concrete.html`
- `contact.html`
- `index.html`
- `privacy.html`
- `project.html`
- `projects.html`
- `resource.html`
- `resources.html`
- `safety.html`
- `waterproof.html`
- `REVIEW_AND_DEPLOYMENT_REPORT.md`

## 4. 디자인 검토

- 히어로에서 제주 노출콘크리트 복원 메시지가 가장 크게 노출되고, 특수방수·안전시설은 연관 전문 분야로 분리되어 있습니다.
- 대표 시공사례는 데스크톱 12열 비대칭 구성, 모바일 1열 구성으로 전환됩니다.
- 기술자료는 카드형이 아닌 날짜·카테고리·제목 중심의 아카이브 목록으로 유지했습니다.
- 긴 제목은 전역 `overflow-wrap`과 유연한 그리드 열로 넘침을 방지합니다.
- 모션은 데스크톱에서만 절제해 유지하고 `prefers-reduced-motion`도 계속 지원합니다.

## 5. 데이터 및 기능 검증

- 시공사례: 39건, ID 39개 모두 고유
- 기술자료: 8건, ID 8개 모두 고유
- 참조 시공 이미지 누락: 0건
- JavaScript 구문 검사: 4개 파일 모두 통과
- 존재하지 않는 시공사례·기술자료 ID: 안내 화면 정상 표시
- 시공사례 필터·지역 필터·더보기·상세·Before/After: 정상
- 기술자료 최신순·카테고리·검색·상세·관련 자료: 정상
- 모바일 메뉴 열기·닫기·배경 스크롤 잠금: 정상

## 6. 반응형 및 브라우저 검증

Playwright 자동 검증 10개 테스트가 모두 통과했습니다.

- 뷰포트: 320, 360, 390, 768, 1024, 1440px
- 가로 스크롤: 없음
- 공개 HTML 12개: 모두 로드 성공
- 사이트 내부 콘솔 오류: 없음
- 사이트 내부 네트워크 404: 없음
- 주요 모바일 터치 영역: 44px 이상
- 360, 390, 1440px 화면 캡처 생성 후 검토

Google Fonts 요청은 페이지 전환 중 브라우저가 취소할 수 있어 사이트 자산 오류 집계에서는 제외했습니다.

## 7. SEO 및 외부 채널 검토

- 모든 HTML에 h1 1개, 고유 title, meta description, canonical이 있습니다.
- 중복 ID는 없습니다.
- 메인 페이지에 LocalBusiness JSON-LD가 있습니다.
- 회사명, 대표전화 1660-4019, 서귀포시 성산읍 주소는 일관됩니다.
- 블로그, 유튜브, 인스타그램은 HTTP 200 응답을 확인했습니다.
- 외부 활성 링크에는 `target="_blank"`, `rel="noopener noreferrer"`가 적용됩니다.
- 온라인몰은 실제 주소 확정 전까지 비활성화했습니다.

## 8. GitHub Pages 경로 검토

- HTML, CSS, JavaScript, 이미지 경로는 상대경로입니다.
- `/assets/...` 형태의 런타임 루트 절대경로는 사용하지 않습니다.
- 상세 페이지는 `project.html?id=...`, `resource.html?id=...` 방식이라 SPA fallback에 의존하지 않습니다.
- 모든 정적 로컬 참조 파일이 존재합니다.

## 9. 배포 상태

- 저장소: https://github.com/nam2037772/ainsafe-site
- 배포 커밋: `577c8da7ee6590ccdb7352c7f4fd4c1255b80328`
- 브랜치: `main`
- Pages 소스: `main / (root)`
- 배포 URL: https://nam2037772.github.io/ainsafe-site/
- Pages 빌드: `built`

공개 URL에서 메인, 서비스, 시공사례, 기술자료, 상세 페이지와 없는 ID 안내를 확인했습니다. CSS, JavaScript, 히어로 이미지, `robots.txt`, `sitemap.xml`은 모두 HTTP 200이며, 320~1440px 실제 배포본 Playwright 테스트 8개가 모두 통과했습니다.

## 10. 남은 TODO 우선순위

1. 실제 온라인몰 주소 입력
2. 사업자등록번호 입력
3. 안전시설·특수방수 시공사례 원본 데이터 보강
