/* ============================================================
   tools/lib/case-source.js
   ------------------------------------------------------------
   옵시디언 시공기술사례 노트 → 사이트 데이터 사이의 공통 유틸.
   · 프론트매터 파싱 (필요한 최소 YAML 문법만)
   · 이미지 역할 항목(representative_image / before_images / after_images)
     을 사이트 경로로 변환
   · assets/js/projects.js 읽기 / 다시 쓰기
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PROJECTS_FILE = path.join(REPO_ROOT, 'assets', 'js', 'projects.js');
const CASE_IMAGE_ROOT = 'assets/images/case-studies';
const DRAFT_DIR = path.join('Wiki', '홈페이지', '발행대기');

/** 기본 vault 위치 — 저장소 옆의 Vault/에릭_vault. --vault= 로 덮어쓸 수 있습니다. */
const DEFAULT_VAULT = path.resolve(REPO_ROOT, '..', '..', 'Vault', '에릭_vault');

/** 명령줄 --이름=값 을 읽습니다. */
function argValue(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3).replace(/^["']|["']$/g, '') : fallback;
}

/** 이 저장소의 도구들이 공통으로 쓰는 vault 경로 결정 규칙. */
function resolveVault() {
  return path.resolve(argValue('vault', process.env.AINSAFE_VAULT || DEFAULT_VAULT));
}

/* ── 프론트매터 ────────────────────────────────────────────── */

/** '"값"' / "'값'" 형태의 따옴표를 벗겨냅니다. */
function unquote(value) {
  const s = String(value == null ? '' : value).trim();
  if (s.length >= 2 && ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'")))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

/**
 * 노트 본문에서 --- 로 감싼 프론트매터만 읽습니다.
 * 지원 문법: `key: value`, `key:` + `  - item` 목록, `key: [a, b]` 인라인 목록.
 * (사례 노트가 쓰는 범위 전부이며, 그 밖의 YAML 기능은 의도적으로 지원하지 않습니다.)
 */
function parseFrontmatter(raw) {
  const text = String(raw).replace(/^﻿/, '');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return {};

  const data = {};
  const lines = m[1].split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      const v = unquote(item[1]);
      if (v) data[currentKey].push(v);
      continue;
    }

    const pair = /^([A-Za-z0-9_]+)\s*:\s*(.*)$/.exec(line);
    if (!pair) continue;

    const key = pair[1];
    const rest = pair[2].trim();
    currentKey = key;

    if (rest === '') { data[key] = ''; continue; }

    const inline = /^\[(.*)\]$/.exec(rest);
    if (inline) {
      data[key] = inline[1].split(',').map(unquote).filter(Boolean);
      continue;
    }
    data[key] = unquote(rest);
  }
  return data;
}

/* ── 발행대기 노트 ─────────────────────────────────────────── */

/** '## 제목' 으로 나뉜 본문을 { 제목: 내용 } 으로 만듭니다. */
function parseDraftSections(raw) {
  const text = String(raw).replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const out = {};
  let key = null;
  let buf = [];
  const flush = () => { if (key) out[key] = buf.join('\n').trim(); buf = []; };
  body.split('\n').forEach((line) => {
    const h = /^##\s+(.*)$/.exec(line);
    if (h) { flush(); key = h[1].trim(); return; }
    buf.push(line);
  });
  flush();
  return out;
}

/**
 * 발행대기 폴더를 사례 번호로 색인합니다.
 *   { '045': { slug, file, frontmatter, sections, path } }
 * 사례 번호는 프론트매터 case_no 를 3자리로 맞춰 씁니다.
 */
function loadDrafts(vaultDir) {
  const dir = path.join(vaultDir, DRAFT_DIR);
  if (!fs.existsSync(dir)) {
    const err = new Error('발행대기 폴더를 찾을 수 없습니다: ' + dir);
    err.code = 'ENODRAFT';
    throw err;
  }
  const index = {};
  fs.readdirSync(dir).filter((f) => f.endsWith('.md')).forEach((f) => {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, 'utf8');
    const fm = parseFrontmatter(raw);
    if (String(fm.type || '') !== 'case' || !fm.case_no) return;
    const no = String(fm.case_no).padStart(3, '0');
    index[no] = {
      case_no: no,
      slug: fm.slug || path.basename(f, '.md'),
      file: DRAFT_DIR.replace(/\\/g, '/') + '/' + f,
      path: full,
      raw,
      frontmatter: fm,
      sections: parseDraftSections(raw)
    };
  });
  return index;
}

/* ── 이미지 경로 해석 ──────────────────────────────────────── */

/**
 * 사례의 이미지 폴더(사이트 기준 상대경로)를 정합니다.
 * 기존 데이터에 경로가 있으면 그것을 신뢰하고, 없으면 case_no + slug 로 만듭니다.
 */
function caseImageDir(project) {
  const known = project.thumbnail || project.after || project.before ||
                (project.images && project.images[0]) || '';
  if (known && known.indexOf('/') > -1) return known.replace(/\\/g, '/').replace(/\/[^/]+$/, '');

  const no = String(project.case_no || '').padStart(3, '0');
  const slug = draftSlug(project);
  if (!no || !slug) return '';
  return `${CASE_IMAGE_ROOT}/case-${no}-${slug}`;
}

/** draft_file 경로에서 slug(파일명)를 뽑습니다. */
function draftSlug(project) {
  const df = String(project.draft_file || '');
  if (!df) return '';
  return path.posix.basename(df.replace(/\\/g, '/'), '.md');
}

/**
 * 프론트매터에 적힌 이미지 값을 사이트 경로로 바꿉니다.
 *   · http(s):// → 그대로 (원격 이미지)
 *   · 'assets/' 로 시작 → 그대로 (이미 사이트 경로)
 *   · 그 밖에 '/' 가 있으면 → 그대로 (직접 지정한 상대경로로 간주)
 *   · 파일명만 있으면 → 해당 사례의 이미지 폴더 기준으로 해석
 */
function resolveImage(value, imageDir) {
  const s = String(value == null ? '' : value).trim().replace(/\\/g, '/');
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.indexOf('assets/') === 0) return s;
  if (s.indexOf('/') > -1) return s.replace(/^\.\//, '');
  return imageDir ? `${imageDir}/${s}` : s;
}

function toArray(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * 노트 프론트매터 → 이미지 역할 4종 (사이트 경로).
 * 값이 하나도 없으면 null 을 돌려주어 "명시 없음"을 구분합니다.
 */
function imageRolesFromFrontmatter(fm, imageDir) {
  const rep = resolveImage(fm.representative_image || fm.featured_image || '', imageDir);
  const list = (key) => toArray(fm[key]).map((v) => resolveImage(v, imageDir)).filter(Boolean);
  const before = list('before_images');
  const process = list('process_images');
  const after = list('after_images');
  if (!rep && !before.length && !process.length && !after.length) return null;
  return {
    representative_image: rep,
    before_images: before,
    process_images: process,
    after_images: after
  };
}

/* ── projects.js 읽기 / 쓰기 ───────────────────────────────── */

/** projects.js 를 평가해 PROJECTS / PROJECT_ALIASES / RETIRED_PROJECT_IDS 를 가져옵니다. */
function loadProjects(file = PROJECTS_FILE) {
  const source = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.runInNewContext(source + '\n;__out = { PROJECTS, PROJECT_ALIASES, RETIRED_PROJECT_IDS };', sandbox, {
    filename: file
  });
  return { source, ...sandbox.__out };
}

/* 항목 안에서 유지할 키 순서 — 사람이 읽기 좋게 고정합니다. */
const KEY_ORDER = [
  'id', 'source', 'case_no', 'source_note', 'draft_file', 'review_required',
  'title', 'location', 'building', 'category', 'date', 'period',
  'summary', 'problem', 'method', 'result',
  'representative_image', 'before_images', 'process_images', 'after_images',
  'thumbnail', 'after', 'before', 'images', 'featured'
];

function orderKeys(obj) {
  const out = {};
  KEY_ORDER.forEach((k) => { if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]; });
  Object.keys(obj).forEach((k) => { if (!(k in out)) out[k] = obj[k]; });
  return out;
}

/** 원본 파일 맨 위의 주석 블록을 그대로 보존합니다. */
function leadingComment(source) {
  const m = /^\s*\/\*[\s\S]*?\*\/\s*\n/.exec(source);
  return m ? m[0].trimEnd() + '\n\n' : '';
}

/** PROJECTS 를 projects.js 파일로 다시 씁니다. (데이터는 순수 JSON 구조) */
function writeProjects({ source, PROJECTS, PROJECT_ALIASES, RETIRED_PROJECT_IDS }, file = PROJECTS_FILE) {
  const body =
    leadingComment(source) +
    'const PROJECT_ALIASES = ' + JSON.stringify(PROJECT_ALIASES, null, 2) + ';\n\n' +
    'const RETIRED_PROJECT_IDS = ' + JSON.stringify(RETIRED_PROJECT_IDS, null, 2) + ';\n\n' +
    'const PROJECTS = ' + JSON.stringify(PROJECTS.map(orderKeys), null, 2) + ';\n';
  fs.writeFileSync(file, body, 'utf8');
  return body;
}

module.exports = {
  REPO_ROOT,
  PROJECTS_FILE,
  CASE_IMAGE_ROOT,
  DRAFT_DIR,
  DEFAULT_VAULT,
  argValue,
  resolveVault,
  parseFrontmatter,
  parseDraftSections,
  loadDrafts,
  caseImageDir,
  draftSlug,
  resolveImage,
  imageRolesFromFrontmatter,
  loadProjects,
  writeProjects
};
