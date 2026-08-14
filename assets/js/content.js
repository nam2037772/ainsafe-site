/* ============================================================
   content.js — 통합 콘텐츠 모델 (기술자료 = 기술문서 + 시공사례)
   ------------------------------------------------------------
   ▶ 이 파일은 데이터를 "저장"하지 않습니다.
     실제 데이터는 그대로 두 파일에 있습니다.
       · assets/js/projects.js  → PROJECTS  (시공사례)
       · assets/js/resources.js → RESOURCES (기술문서)
     이 파일은 두 데이터를 **하나의 공통 형태**로 변환해
     통합 목록(resources.html)에서 함께 보여주는 역할만 합니다.

   ▶ 왜 이렇게 했나요?
     · 기존 파일을 그대로 두므로 기존 주소(project.html?id=, resource.html?id=)가
       전부 그대로 동작합니다.
     · 사장님이 쓰던 편집 방법(projects.js / resources.js 에 항목 추가)이
       바뀌지 않습니다.
     · 나중에 옵시디언(.md) 원고를 넣을 때는, 아래 "통합 항목 형태" 그대로
       만들어 CONTENT 에 합치기만 하면 됩니다.

   ------------------------------------------------------------
   ■ 통합 항목 형태 (Obsidian .md 프론트매터와 1:1로 대응)

     ---
     title:       노출콘크리트 층조인트 단차 보수   → item.title
     category:    노출콘크리트                     → item.category
     type:        case                             → item.type ('technical' | 'case')
     date:        2026-08-14                       → item.date
     description: 한 줄 요약                        → item.description
     images:      [a.jpg, b.jpg]                   → item.images.*
     ---
     (본문 마크다운)                                 → item.body (HTML)

   ■ 실제 객체
     {
       id, type, title,
       category,      // 통합 필터용 (UNIFIED_CATEGORIES 중 하나)
       categoryRaw,   // 원본 데이터에 적힌 분류 (상세페이지 표기용)
       date,          // 'YYYY-MM' 또는 'YYYY-MM-DD'
       sortKey,       // 정렬용으로 보정한 'YYYY-MM-DD'
       description,   // 목록 카드에 노출되는 한 줄 요약
       images: { thumbnail, cover, before, gallery[] },
       body,          // 상세 본문 HTML ('' 이면 상세페이지가 자체 구성)
       tags[],        // 검색 키워드
       url,           // 상세 주소 (기존 주소 그대로)
       meta: { ... }  // 유형별 부가정보 (현장 위치, 공법, 첨부파일 등)
     }
   ============================================================ */

/* 통합 필터 — 화면에 표시되는 순서대로 */
var UNIFIED_CATEGORIES = ['노출콘크리트', '균열·보수', '특수방수', '안전시설'];

/* 콘텐츠 유형 — 기술문서 / 시공사례 */
var CONTENT_TYPES = [
  { value: 'technical', label: '기술자료' },
  { value: 'case',      label: '시공사례' }
];

/* 기존 분류 → 통합 필터 대응표.
   앞으로 새 글을 쓸 때는 통합 필터 이름(UNIFIED_CATEGORIES)을 그대로 써도 됩니다. */
var CATEGORY_ALIASES = {
  '노출콘크리트': '노출콘크리트',
  '시공기준':     '노출콘크리트',
  '균열보수':     '균열·보수',
  '균열·보수':    '균열·보수',
  '인젝션':       '특수방수',
  '특수방수':     '특수방수',
  '안전시설':     '안전시설',
  '건축자재':     '안전시설',
  '현장관리':     '안전시설',
  '안전시설·자재': '안전시설'
};

/* 분류 이름을 통합 필터 값으로 바꿉니다. 대응표에 없으면 '' (→ '전체'에서만 노출) */
function unifyCategory(raw) {
  var v = CATEGORY_ALIASES[raw];
  return v || '';
}

/* 'YYYY-MM' 을 'YYYY-MM-01' 로 보정해 두 데이터의 정렬 기준을 맞춥니다. */
function contentSortKey(date) {
  var d = String(date || '');
  if (/^\d{4}-\d{2}$/.test(d)) return d + '-01';
  if (/^\d{4}$/.test(d)) return d + '-01-01';
  return d;
}

/* 시공사례(PROJECTS 항목) → 통합 항목 */
function projectToContent(p) {
  return {
    id: p.id,
    type: 'case',
    title: p.title,
    category: unifyCategory(p.category),
    categoryRaw: p.category,
    date: p.date,
    sortKey: contentSortKey(p.date),
    description: p.summary,
    images: {
      thumbnail: p.thumbnail || p.after || '',
      cover: p.after || p.thumbnail || '',
      before: p.before || '',
      gallery: (p.images || []).slice()
    },
    body: '',
    tags: [p.category, p.building, p.location].filter(Boolean),
    url: 'project.html?id=' + encodeURIComponent(p.id),
    meta: {
      location: p.location || '',
      building: p.building || '',
      period: p.period || '',
      problem: p.problem || '',
      method: p.method || '',
      result: p.result || '',
      featured: !!p.featured,
      file: ''
    }
  };
}

/* 기술문서(RESOURCES 항목) → 통합 항목 */
function resourceToContent(r) {
  return {
    id: r.id,
    type: 'technical',
    title: r.title,
    category: unifyCategory(r.category),
    categoryRaw: r.category,
    date: r.date,
    sortKey: contentSortKey(r.date),
    description: r.summary,
    images: {
      thumbnail: r.thumbnail || '',
      cover: r.thumbnail || '',
      before: '',
      gallery: []
    },
    body: r.content || '',
    tags: (r.tags || []).concat([r.category]).filter(Boolean),
    url: 'resource.html?id=' + encodeURIComponent(r.id),
    meta: {
      location: '', building: '', period: '',
      problem: '', method: '', result: '',
      featured: false,
      file: r.file || ''
    }
  };
}

/* 검색용 문자열 — 제목·요약·분류·태그·현장정보를 한 덩어리로 */
function contentSearchText(item) {
  var m = item.meta || {};
  return [
    item.title, item.description, item.category, item.categoryRaw,
    m.building, m.location, m.problem, m.method, m.result
  ].concat(item.tags || []).filter(Boolean).join(' ').toLowerCase();
}

/* ── 통합 목록 ────────────────────────────────────────────────
   기술문서 + 시공사례를 합쳐 제목 가나다순으로 정렬합니다.
   날짜가 없는 항목에 임의 날짜를 만들지 않고, 모든 항목에 같은 중립 규칙을 적용합니다.
   (앞으로 옵시디언 .md 를 변환해 넣을 때도 여기에 concat 하면 됩니다) */
var CONTENT = (function () {
  var list = [];
  if (typeof RESOURCES !== 'undefined') list = list.concat(RESOURCES.map(resourceToContent));
  if (typeof PROJECTS !== 'undefined') list = list.concat(PROJECTS.map(projectToContent));
  list.forEach(function (item) { item.searchText = contentSearchText(item); });
  return list.sort(function (a, b) {
    return String(a.title || '').localeCompare(String(b.title || ''), 'ko');
  });
})();

/* 실제로 항목이 존재하는 통합 필터만 반환 (빈 필터를 화면에 두지 않기 위함) */
function usedUnifiedCategories() {
  return UNIFIED_CATEGORIES.filter(function (c) {
    return CONTENT.some(function (item) { return item.category === c; });
  });
}
