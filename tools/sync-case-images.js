#!/usr/bin/env node
/* ============================================================
   tools/sync-case-images.js
   ------------------------------------------------------------
   옵시디언 시공기술사례 노트의 이미지 역할 지정을 사이트 데이터로 옮깁니다.

     옵시디언 노트 프론트매터
       representative_image / before_images / after_images
            ↓ (이 스크립트)
     assets/js/projects.js 의 같은 이름 항목
            ↓
     assets/js/case-images.js 가 정규화 → 카드 대표 이미지 / 상세 BEFORE·AFTER

   사용법
     node tools/sync-case-images.js                # 미리보기 (파일을 고치지 않음)
     node tools/sync-case-images.js --write        # 실제로 projects.js 수정
     node tools/sync-case-images.js --vault="D:\\경로\\에릭_vault"

   ▶ 본문·요약 등 사람이 다듬은 내용은 건드리지 않습니다.
     이 스크립트는 이미지 역할 3개 항목만 갱신합니다.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  REPO_ROOT, parseFrontmatter, caseImageDir, draftSlug,
  imageRolesFromFrontmatter, loadProjects, writeProjects
} = require('./lib/case-source');

const DEFAULT_VAULT = path.join(
  path.dirname(REPO_ROOT), '..', 'Vault', '에릭_vault'
);
const DRAFT_DIR = path.join('Wiki', '홈페이지', '발행대기');

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3).replace(/^["']|["']$/g, '') : fallback;
}
const WRITE = process.argv.includes('--write');
const VAULT = path.resolve(arg('vault', process.env.AINSAFE_VAULT || DEFAULT_VAULT));

function sameList(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function main() {
  const draftDir = path.join(VAULT, DRAFT_DIR);
  if (!fs.existsSync(draftDir)) {
    console.error('옵시디언 발행대기 폴더를 찾을 수 없습니다:\n  ' + draftDir);
    console.error('--vault="<에릭_vault 경로>" 로 지정하거나 AINSAFE_VAULT 환경변수를 설정하세요.');
    process.exit(2);
  }

  const bundle = loadProjects();
  const updated = [];
  const skipped = [];
  const warnings = [];

  bundle.PROJECTS.forEach((p) => {
    const slug = draftSlug(p);
    if (!slug) { skipped.push(`${p.id} — draft_file 없음`); return; }

    const notePath = path.join(draftDir, slug + '.md');
    if (!fs.existsSync(notePath)) { warnings.push(`${p.id} — 노트를 찾을 수 없음: ${slug}.md`); return; }

    const fm = parseFrontmatter(fs.readFileSync(notePath, 'utf8'));
    const dir = caseImageDir(p);
    const roles = imageRolesFromFrontmatter(fm, dir);

    if (!roles) { skipped.push(`${p.id} — 이미지 역할 미지정 (기존 로직 유지)`); return; }

    /* 실제 파일이 있는지 확인 — 원격 URL 은 검사 대상이 아닙니다. */
    [roles.representative_image, ...roles.before_images, ...roles.after_images]
      .filter(Boolean)
      .filter((s) => !/^https?:\/\//i.test(s))
      .forEach((s) => {
        if (!fs.existsSync(path.join(REPO_ROOT, s))) warnings.push(`${p.id} — 파일 없음: ${s}`);
      });

    const changed =
      (p.representative_image || '') !== roles.representative_image ||
      !sameList(p.before_images || [], roles.before_images) ||
      !sameList(p.after_images || [], roles.after_images);

    if (!changed) { skipped.push(`${p.id} — 변경 없음`); return; }

    p.representative_image = roles.representative_image;
    p.before_images = roles.before_images;
    p.after_images = roles.after_images;
    updated.push(
      `${p.id}\n    대표: ${roles.representative_image || '(없음)'}` +
      `\n    시공 전: ${roles.before_images.length}장  시공 후: ${roles.after_images.length}장`
    );
  });

  console.log('옵시디언 vault : ' + VAULT);
  console.log('사례 항목       : ' + bundle.PROJECTS.length + '건\n');

  console.log(`■ 갱신 대상 (${updated.length}건)`);
  updated.forEach((s) => console.log('  · ' + s));
  if (!updated.length) console.log('  (없음)');

  console.log(`\n■ 건너뜀 (${skipped.length}건)`);
  skipped.forEach((s) => console.log('  · ' + s));

  if (warnings.length) {
    console.log(`\n■ 확인 필요 (${warnings.length}건)`);
    warnings.forEach((s) => console.log('  ! ' + s));
  }

  if (!WRITE) {
    console.log('\n미리보기입니다. 실제로 반영하려면 --write 를 붙여 다시 실행하세요.');
    return;
  }
  if (!updated.length) {
    console.log('\n변경할 내용이 없어 projects.js 를 그대로 둡니다.');
    return;
  }
  writeProjects(bundle);
  console.log('\nassets/js/projects.js 에 반영했습니다. 이어서 node tools/check-cases.js 로 검증하세요.');
}

main();
