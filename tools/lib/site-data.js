/* ============================================================
   tools/lib/site-data.js — 사이트 데이터 로더 · 공통 헬퍼
   ------------------------------------------------------------
   브라우저가 <script> 로 읽는 데이터 파일들을 Node 에서 그대로
   평가해 꺼내옵니다. check-cases.js 가 쓰던 방법과 같습니다.

     assets/js/config.js      → COMPANY / EXTERNAL_LINKS / CONTACT_CHANNELS
     assets/js/projects.js    → PROJECTS / PROJECT_ALIASES / RETIRED_PROJECT_IDS
     assets/js/case-images.js → CaseImages   (이미지 역할 정규화)
     assets/js/resources.js   → RESOURCES
     assets/js/content.js     → CONTENT      (통합 아카이브)
     data/site-content.js     → window.SITE  (홈 화면 문구)

   ▶ 원칙
     · 데이터를 바꾸지 않습니다. 읽어서 정리만 합니다.
     · 이미지 선택은 반드시 CaseImages.normalize 결과만 씁니다.
       (대표/시공전/시공중/시공후 판단을 여기서 다시 하지 않습니다)
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const DATA_FILES = [
  'assets/js/config.js',
  'assets/js/projects.js',
  'assets/js/case-images.js',
  'assets/js/resources.js',
  'assets/js/content.js'
];

const EXPORT_NAMES = [
  'COMPANY', 'EXTERNAL_LINKS', 'CONTACT_CHANNELS', 'FALLBACK_IMAGE',
  'PROJECTS', 'PROJECT_ALIASES', 'RETIRED_PROJECT_IDS',
  'RESOURCES', 'CONTENT', 'CaseImages',
  'unifyCategory', 'usedUnifiedCategories', 'UNIFIED_CATEGORIES'
];

function readRepo(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
}

/* 브라우저와 같은 하나의 전역 스코프에서 순서대로 평가합니다.
   const 선언은 sandbox 객체에 붙지 않으므로 마지막에 값을 모아 꺼냅니다. */
function loadData() {
  const sandbox = { window: {}, module: undefined, console };
  sandbox.self = sandbox;
  const ctx = vm.createContext(sandbox);

  const bundle = DATA_FILES.map(readRepo).join('\n;\n') +
    '\n;({' + EXPORT_NAMES.map((n) => `${n}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(', ') + '})';

  const globals = vm.runInContext(bundle, ctx, { filename: 'ainsafe-data.js' });

  /* site-content.js 는 window.SITE 에 붙습니다 — 별도 컨텍스트에서 읽습니다. */
  const siteBox = { window: {} };
  siteBox.self = siteBox;
  const siteCtx = vm.createContext(siteBox);
  vm.runInContext(readRepo('data/site-content.js'), siteCtx, { filename: 'site-content.js' });

  globals.SITE = siteBox.window.SITE;
  return globals;
}

/* ── 문자열 이스케이프 — main.js 의 esc() 와 완전히 같은 규칙 ── */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* 속성값 안에 들어가는 텍스트 — esc 와 동일하지만 의도를 드러내기 위해 분리 */
const attr = esc;

/* JSON-LD 안에 들어가는 문자열 — </script> 조기 종료만 막습니다.
   JSON.stringify 가 따옴표·역슬래시를 이미 처리하므로 그 위에 덧칠하지 않습니다. */
function jsonld(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

/* 'YYYY-MM-DD' → 'YYYY.MM.DD' (main.js fmtDate 와 동일) */
function fmtDate(d) { return (d || '').replace(/-/g, '.'); }

function byDateDesc(a, b) { return (b.date || '').localeCompare(a.date || ''); }

/* ── 주소 규칙 ────────────────────────────────────────────────
   시공사례 id:  obsidian-case-045-songpa-…  →  case/case-045-songpa-….html
   'obsidian-' 접두만 떼어 이미지 폴더명과 정확히 같은 이름을 씁니다.
     assets/images/case-studies/case-045-songpa-…/
   폴더명과 주소가 같으면 나중에 사람이 짝을 찾기 쉽습니다. */
function caseSlug(id) {
  return String(id || '').replace(/^obsidian-/, '');
}
function casePath(id) { return 'case/' + caseSlug(id) + '.html'; }
function guidePath(id) { return 'guide/' + String(id || '') + '.html'; }

/* 생성 페이지는 하위 폴더에 있으므로 문서 기준 상대경로에 '../' 가 붙습니다. */
const SUB_PREFIX = '../';

/* 사이트 절대주소 — config.js 의 siteUrl 하나만 씁니다.
   도메인이 바뀌면 config.js 한 곳만 고치면 됩니다. */
function siteUrlOf(COMPANY) {
  const raw = String((COMPANY && COMPANY.siteUrl) || '').trim();
  if (!raw) throw new Error('config.js 의 COMPANY.siteUrl 이 비어 있습니다.');
  return raw.replace(/\/+$/, '') + '/';
}

function absUrl(base, rel) {
  return base + String(rel || '').replace(/^\/+/, '');
}

/* 이미지 경로가 비면 대체 이미지를 씁니다 (main.js img() 와 동일) */
function imgOr(src, fallback) { return src || fallback; }

/* 이미지 실제 크기 — JPEG/PNG 헤더만 읽습니다.
   width/height 를 넣기 위한 것이며, 못 읽으면 null 을 돌려주고
   호출한 쪽에서 속성을 생략합니다(잘못된 값을 넣지 않습니다). */
function imageSize(relPath) {
  const file = path.join(REPO_ROOT, relPath);
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const head = Buffer.alloc(65536);
    const read = fs.readSync(fd, head, 0, 65536, 0);
    const buf = head.subarray(0, read);

    /* PNG: 8바이트 시그니처 + IHDR */
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    /* JPEG: SOFn 마커에서 크기를 찾습니다 */
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        const isSOF = marker >= 0xc0 && marker <= 0xcf &&
          marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSOF) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        if (len <= 0) break;
        i += 2 + len;
      }
    }
    return null;
  } catch (e) {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/* width/height 속성 문자열 — 크기를 못 읽으면 빈 문자열 */
const _sizeCache = new Map();
function sizeAttrs(relPath) {
  if (!relPath) return '';
  if (_sizeCache.has(relPath)) return _sizeCache.get(relPath);
  const s = imageSize(relPath);
  const out = s ? ` width="${s.width}" height="${s.height}"` : '';
  _sizeCache.set(relPath, out);
  return out;
}

function fileExists(rel) {
  return fs.existsSync(path.join(REPO_ROOT, rel));
}

/* 같은 이름의 .webp 가 옆에 있으면 그 경로를, 없으면 '' 를 돌려줍니다.
   WebP 는 눈에 띄는 차이 없이 파일을 크게 줄여 주지만(측정 SSIM 0.98 이상),
   원본에 따라 이득이 거의 없는 사진도 있습니다. 그래서 "만들어 둔 것만" 씁니다.
     · .webp 가 있으면  → <picture> 로 WebP 를 먼저 제안하고 JPEG 을 남겨 둡니다
     · .webp 가 없으면  → 지금까지처럼 <img> 하나만 씁니다
   새로 줄이고 싶은 사진이 생기면 .webp 를 같은 폴더에 넣고 다시 생성하면 됩니다. */
function webpFor(rel) {
  if (!rel || /^https?:/i.test(rel)) return '';
  const webp = String(rel).replace(/\.(jpe?g|png)$/i, '.webp');
  if (webp === rel) return '';
  return fileExists(webp) ? webp : '';
}

function writeFileIfChanged(rel, content) {
  const file = path.join(REPO_ROOT, rel);
  require('./case-source').assertWritable(file);   // vault 안에는 절대 쓰지 않습니다
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return false;
  fs.writeFileSync(file, content, 'utf8');
  return true;
}

module.exports = {
  REPO_ROOT, DATA_FILES,
  loadData, readRepo, fileExists, writeFileIfChanged,
  esc, attr, jsonld, fmtDate, byDateDesc,
  caseSlug, casePath, guidePath, SUB_PREFIX,
  siteUrlOf, absUrl, imgOr, imageSize, sizeAttrs, webpFor
};
