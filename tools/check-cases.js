#!/usr/bin/env node
/* ============================================================
   tools/check-cases.js — 시공기술사례 데이터 검증
   ------------------------------------------------------------
   빌드 도구가 없는 사이트이므로, 배포 전 이 스크립트로 확인합니다.

     node tools/check-cases.js

   검사 항목
     1. projects.js / resources.js / content.js 가 문법 오류 없이 평가되는가
     2. 모든 사례가 대표 이미지를 갖는가 (정규화 모델 기준)
     3. 참조하는 이미지 파일이 실제로 존재하는가
     4. id 중복 / 별칭(PROJECT_ALIASES) 대상이 실재하는가
     5. 통합 아카이브(CONTENT) 가 모든 항목을 만들어 내는가
     6. 검색·분류 필터가 항목을 잃지 않는가
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let failures = 0;
let checks = 0;
function ok(msg) { checks++; console.log('  ✓ ' + msg); }
function fail(msg) { checks++; failures++; console.log('  ✗ ' + msg); }
function assert(cond, msg) { cond ? ok(msg) : fail(msg); }

/* ── 1. 스크립트 평가 ──────────────────────────────────────── */
console.log('\n[1] 스크립트 로드');
/* 브라우저처럼 하나의 전역 스코프에서 순서대로 평가합니다.
   projects.js 등은 const 선언이라 sandbox 객체에 붙지 않으므로,
   같은 컨텍스트 안에서 값을 모아 꺼냅니다. */
const FILES = [
  'assets/js/config.js', 'assets/js/projects.js', 'assets/js/case-images.js',
  'assets/js/resources.js', 'assets/js/content.js'
];
const NAMES = ['PROJECTS', 'PROJECT_ALIASES', 'RETIRED_PROJECT_IDS', 'RESOURCES',
               'CONTENT', 'CaseImages', 'FALLBACK_IMAGE', 'usedUnifiedCategories', 'unifyCategory'];
let globals;
try {
  const sandbox = { window: {}, module: undefined, console };
  sandbox.self = sandbox;
  const ctx = vm.createContext(sandbox);
  const bundle = FILES.map((f) => read(f)).join('\n;\n') +
    '\n;({' + NAMES.map((n) => `${n}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(', ') + '})';
  globals = vm.runInContext(bundle, ctx, { filename: 'ainsafe-bundle.js' });
  ok('config / projects / case-images / resources / content 평가 성공');
} catch (e) {
  fail('스크립트 평가 실패: ' + e.message);
  console.log('\n검증 중단.');
  process.exit(1);
}

const { PROJECTS, PROJECT_ALIASES, RETIRED_PROJECT_IDS, RESOURCES, CONTENT, CaseImages, FALLBACK_IMAGE } = globals;
assert(Array.isArray(PROJECTS) && PROJECTS.length > 0, `PROJECTS ${PROJECTS.length}건`);
assert(Array.isArray(RESOURCES) && RESOURCES.length > 0, `RESOURCES ${RESOURCES.length}건`);
assert(typeof CaseImages === 'object' && CaseImages, 'CaseImages 전역 노출');

/* ── 2·3. 이미지 역할 정규화 + 파일 존재 ───────────────────── */
console.log('\n[2] 이미지 역할 정규화');
const rows = [];
let missing = 0, noRep = 0, explicit = 0, withBefore = 0;

PROJECTS.forEach((p) => {
  const ci = CaseImages.normalize(p);
  if (!ci.representativeImage) { noRep++; fail(`${p.id} — 대표 이미지 없음`); }
  if (ci.source === 'explicit') explicit++;
  if (ci.hasBefore) withBefore++;

  [ci.representativeImage, ...ci.beforeImages, ...ci.afterImages, ...ci.galleryImages]
    .filter(Boolean)
    .filter((s) => !/^https?:\/\//i.test(s))
    .forEach((s) => {
      if (!fs.existsSync(path.join(ROOT, s))) { missing++; fail(`${p.id} — 파일 없음: ${s}`); }
    });

  /* 대표 이미지는 시공 전 사진이어서는 안 됩니다 (완성/AFTER 가 기본). */
  if (ci.hasBefore && ci.hasAfter && ci.beforeImages.indexOf(ci.representativeImage) > -1) {
    fail(`${p.id} — 대표 이미지가 시공 전 사진으로 지정됨`);
  }

  rows.push({
    case_no: p.case_no, id: p.id, source: ci.source,
    rep: ci.representativeImage, before: ci.beforeImages.length,
    after: ci.afterImages.length, gallery: ci.galleryImages.length,
    compare: ci.showComparison
  });
});
assert(noRep === 0, `모든 사례에 대표 이미지 존재 (${PROJECTS.length}건)`);
assert(missing === 0, '참조 이미지 파일 모두 존재');
assert(fs.existsSync(path.join(ROOT, FALLBACK_IMAGE)), `대체 이미지 존재: ${FALLBACK_IMAGE}`);

/* ── 4. id / 별칭 ──────────────────────────────────────────── */
console.log('\n[3] 식별자');
const ids = PROJECTS.map((p) => p.id);
assert(new Set(ids).size === ids.length, 'PROJECTS id 중복 없음');
const badAlias = Object.entries(PROJECT_ALIASES || {}).filter(([, to]) => ids.indexOf(to) === -1);
assert(badAlias.length === 0, `PROJECT_ALIASES 대상 실재 (${Object.keys(PROJECT_ALIASES || {}).length}건)`);
const retiredClash = (RETIRED_PROJECT_IDS || []).filter((id) => ids.indexOf(id) > -1);
assert(retiredClash.length === 0, 'RETIRED_PROJECT_IDS 와 현행 id 충돌 없음');

/* ── 5. 통합 아카이브 ──────────────────────────────────────── */
console.log('\n[4] 통합 아카이브(CONTENT)');
assert(CONTENT.length === PROJECTS.length + RESOURCES.length,
  `항목 수 일치: ${CONTENT.length} = 사례 ${PROJECTS.length} + 기술문서 ${RESOURCES.length}`);

const caseItems = CONTENT.filter((i) => i.type === 'case');
const noThumb = caseItems.filter((i) => !i.images.thumbnail);
assert(noThumb.length === 0, '모든 시공사례 카드에 대표 이미지 존재');

const mismatched = caseItems.filter((i) => {
  const p = PROJECTS.find((x) => x.id === i.id);
  return i.images.thumbnail !== CaseImages.normalize(p).representativeImage;
});
assert(mismatched.length === 0, '아카이브 썸네일 = 정규화 대표 이미지');

const badUrl = CONTENT.filter((i) => !/^(project|resource)\.html\?id=.+/.test(i.url));
assert(badUrl.length === 0, '모든 항목의 상세 링크 형식 정상');

/* ── 6. 필터 / 검색 ───────────────────────────────────────── */
console.log('\n[5] 분류 · 검색');
const cats = globals.usedUnifiedCategories();
const covered = cats.reduce((n, c) => n + CONTENT.filter((i) => i.category === c).length, 0);
const uncategorized = CONTENT.filter((i) => !i.category).length;
assert(covered + uncategorized === CONTENT.length,
  `분류 합계 일치: ${covered} + 미분류 ${uncategorized} = ${CONTENT.length}`);
assert(cats.length > 0, `표시되는 분류 ${cats.length}종: ${cats.join(', ')}`);
assert(CONTENT.every((i) => typeof i.searchText === 'string' && i.searchText.length > 0),
  '모든 항목에 검색 색인 존재');
assert(CONTENT.filter((i) => i.searchText.indexOf('노출콘크리트') > -1).length > 0,
  "검색 '노출콘크리트' 결과 있음");

/* ── 요약표 ───────────────────────────────────────────────── */
console.log('\n[6] 사례별 이미지 역할');
console.log('  no   출처       대표  전  후  기타  비교구간  id');
rows.sort((a, b) => String(b.case_no).localeCompare(String(a.case_no))).forEach((r) => {
  console.log(
    '  ' + String(r.case_no).padEnd(5) +
    r.source.padEnd(11) +
    (r.rep ? ' O  ' : ' -  ').padEnd(6) +
    String(r.before).padEnd(4) +
    String(r.after).padEnd(4) +
    String(r.gallery).padEnd(6) +
    (r.compare ? 'Y' : '-').padEnd(10) +
    r.id
  );
});

console.log(`\n명시 분류 완료 ${explicit}건 / 자동 추론 ${PROJECTS.length - explicit}건 · 시공 전 사진 보유 ${withBefore}건`);
console.log(`\n검사 ${checks}건 중 실패 ${failures}건`);
process.exit(failures ? 1 : 0);
