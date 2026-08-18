#!/usr/bin/env node
/* ============================================================
   tools/check-images.js — 이미지 자산 점검
   ------------------------------------------------------------
     node tools/check-images.js            # 보고만 합니다 (파일을 바꾸지 않음)
     node tools/check-images.js --convert  # PNG 사진을 JPEG 로 변환 (원본은 남김)

   ▶ 무엇을 보나요
     1. 사진인데 PNG 로 저장된 파일 — 같은 그림을 JPEG 로 두면 훨씬 가볍습니다
     2. 투명(알파)을 쓰는 PNG — 로고·도형일 수 있으므로 건드리지 않습니다
     3. 사이트 어디에서도 참조하지 않는 이미지 — 지워도 되는 후보
     4. 용량이 큰 파일

   ▶ 원칙
     · --convert 를 붙여도 원본 PNG 를 지우지 않습니다.
       .jpg 를 옆에 만들어 두고, 참조를 바꾸는 일은 사람이 확인한 뒤 합니다.
     · 투명을 쓰는 PNG 와 SVG 는 후보에서 제외합니다.
     · 화질을 눈으로 확인할 수 없으므로 자동으로 배포에 반영하지 않습니다.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const D = require('./lib/site-data');
const { REPO_ROOT } = D;

const CONVERT = process.argv.includes('--convert');
const IMAGE_ROOT = path.join(REPO_ROOT, 'assets/images');

/* ── 파일 훑기 ─────────────────────────────────────────────── */
function walk(dir, out) {
  out = out || [];
  fs.readdirSync(dir).forEach((name) => {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) walk(abs, out);
    else out.push(path.relative(REPO_ROOT, abs).replace(/\\/g, '/'));
  });
  return out;
}

/* PNG 색상 타입 — 6(RGBA) · 4(GrayAlpha) 또는 tRNS 청크가 있으면 투명을 씁니다. */
function pngInfo(rel) {
  const buf = fs.readFileSync(path.join(REPO_ROOT, rel));
  if (buf.length < 26 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  const colorType = buf[25];
  const bitDepth = buf[24];
  const hasTRNS = buf.indexOf(Buffer.from('tRNS')) > -1;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colorType,
    bitDepth,
    /* 2 = truecolour, 0 = greyscale → 알파 없음 */
    hasAlpha: colorType === 4 || colorType === 6 || hasTRNS,
    /* 팔레트(3)는 도형·아이콘일 가능성이 큽니다 */
    isPalette: colorType === 3
  };
}

/* ── 참조 조사 ─────────────────────────────────────────────── */
/* 어느 페이지도 <script> 로 읽지 않는 파일입니다.
   여기서 나온 참조는 '살아 있는 참조'가 아니므로 세지 않습니다. */
const DEAD_SOURCES = [
  'data/legacy-projects-unverified.js'
];

function referencedPaths() {
  const refs = new Set();
  const scanExt = /\.(html|js|css|xml|txt|json)$/i;
  const skipDir = /(^|\/)(\.git|node_modules)(\/|$)/;

  walk(REPO_ROOT).forEach((rel) => {
    if (skipDir.test(rel) || !scanExt.test(rel)) return;
    if (DEAD_SOURCES.indexOf(rel) > -1) return;
    const text = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    const re = /(?:^|["'(\s])((?:\.\.\/)?[\w./-]*assets\/images\/[\w./-]+\.(?:jpg|jpeg|png|svg|webp))/gi;
    let m;
    while ((m = re.exec(text))) {
      refs.add(m[1].replace(/^\.\.\//, '').replace(/^\.\//, ''));
    }
  });
  return refs;
}

/* ── 실행 ──────────────────────────────────────────────────── */
const all = walk(IMAGE_ROOT);
const refs = referencedPaths();

const pngs = all.filter((f) => /\.png$/i.test(f));
const photos = [];     // 사진으로 보이는 PNG (알파 없음 · 팔레트 아님 · 충분히 큼)
const keepAsPng = [];  // 투명/팔레트 — 건드리지 않습니다

pngs.forEach((rel) => {
  const info = pngInfo(rel);
  const size = fs.statSync(path.join(REPO_ROOT, rel)).size;
  if (!info) return;
  const row = { rel, size, ...info, used: refs.has(rel) };
  /* 사진 판정: 알파 없음 · 팔레트 아님 · 가로세로 400px 이상 · 60KB 이상 */
  if (!info.hasAlpha && !info.isPalette && info.width >= 400 && info.height >= 400 && size > 60000) {
    photos.push(row);
  } else {
    keepAsPng.push(row);
  }
});

const kb = (n) => (n / 1024).toFixed(0) + 'KB';

console.log('\n[1] 사진인데 PNG 로 저장된 파일');
photos.sort((a, b) => b.size - a.size);
photos.forEach((r) => {
  console.log(`  ${kb(r.size).padStart(7)}  ${String(r.width) + '×' + r.height}`.padEnd(24) + `  ${r.rel}`);
});
const photoBytes = photos.reduce((n, r) => n + r.size, 0);
console.log(`  → ${photos.length}개 · 합계 ${kb(photoBytes)}`);
console.log('     JPEG 로 두면 보통 60~75% 줄어듭니다 (같은 그림, 눈으로는 거의 차이 없음).');

console.log('\n[2] 그대로 두어야 하는 PNG (투명 · 팔레트 · 작은 그림)');
if (!keepAsPng.length) console.log('  없음');
keepAsPng.forEach((r) => {
  const why = r.hasAlpha ? '투명 사용' : (r.isPalette ? '팔레트' : '작음');
  console.log(`  ${kb(r.size).padStart(7)}  ${why.padEnd(10)}  ${r.rel}`);
});

console.log('\n[3] 어디에서도 참조하지 않는 이미지');
const unused = all.filter((f) => !refs.has(f));
const byDir = {};
unused.forEach((f) => {
  const dir = path.posix.dirname(f);
  byDir[dir] = byDir[dir] || { n: 0, bytes: 0 };
  byDir[dir].n++;
  byDir[dir].bytes += fs.statSync(path.join(REPO_ROOT, f)).size;
});
Object.entries(byDir).sort((a, b) => b[1].bytes - a[1].bytes).forEach(([dir, v]) => {
  console.log(`  ${kb(v.bytes).padStart(8)}  ${String(v.n).padStart(4)}개  ${dir}/`);
});
console.log(`  → 합계 ${unused.length}개 · ${kb(unused.reduce((n, f) => n + fs.statSync(path.join(REPO_ROOT, f)).size, 0))}`);
console.log('     ※ 지우기 전에 반드시 사람이 확인하세요. 이 목록은 후보일 뿐입니다.');

console.log('\n[4] 요약');
console.log(`  이미지 전체        : ${all.length}개 · ${kb(all.reduce((n, f) => n + fs.statSync(path.join(REPO_ROOT, f)).size, 0))}`);
console.log(`  참조되는 이미지    : ${all.length - unused.length}개`);
console.log(`  PNG 사진 변환 후보 : ${photos.length}개 · ${kb(photoBytes)}`);

/* ── 변환 (명시적으로 요청했을 때만) ───────────────────────── */
if (!CONVERT) {
  console.log('\n보고만 했습니다. 변환하려면 --convert 를 붙이세요 (원본 PNG 는 지우지 않습니다).');
  process.exit(0);
}

let ffmpeg;
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  ffmpeg = 'ffmpeg';
} catch (e) {
  console.log('\n■ ffmpeg 를 찾을 수 없어 변환할 수 없습니다.');
  process.exit(1);
}

console.log('\n[5] JPEG 변환 (원본 PNG 는 그대로 둡니다)');
let done = 0, saved = 0;
photos.forEach((r) => {
  const out = r.rel.replace(/\.png$/i, '.jpg');
  const outAbs = path.join(REPO_ROOT, out);
  if (fs.existsSync(outAbs)) { console.log(`  · 건너뜀 (이미 있음) ${out}`); return; }
  try {
    execFileSync(ffmpeg, ['-loglevel', 'error', '-i', path.join(REPO_ROOT, r.rel),
      '-qscale:v', '3', outAbs], { stdio: 'ignore' });
    const newSize = fs.statSync(outAbs).size;
    saved += r.size - newSize;
    done++;
    console.log(`  ✓ ${kb(r.size).padStart(7)} → ${kb(newSize).padStart(7)}  ${out}`);
  } catch (e) {
    console.log(`  ✗ 실패 ${r.rel}: ${e.message}`);
  }
});
console.log(`\n  ${done}개 변환 · 약 ${kb(saved)} 절약`);
console.log('  다음 단계는 사람이 합니다:');
console.log('    1) 만들어진 .jpg 를 눈으로 확인');
console.log('    2) 원본 노트(Raw)의 이미지 경로를 .jpg 로 바꾸고');
console.log('       node tools/rebuild-cases.js --write → build-site → check-site');
console.log('    3) 확인이 끝난 뒤에야 원본 .png 를 지웁니다');
