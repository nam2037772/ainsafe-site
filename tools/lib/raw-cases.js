/* ============================================================
   tools/lib/raw-cases.js
   ------------------------------------------------------------
   옵시디언 Raw 노트(에릭 검수본)를 읽는 단 하나의 창구입니다.

     Vault/에릭_vault/Raw/노출콘 시공기술사례/
       노출콘크리트 시공기술사례 - NNN.md

   ▶ 노트 서식 (에릭이 확정한 고정 스키마)
       # 작업내용
       (기술 본문)
       # 이미지분류
       ## 대표사진   ![](url)          ← 카드·아카이브 대표 이미지 1장
       ## 시공전     ![](url) …  또는  사진없음
       ## 시공중     ![](url) …  또는  사진없음
       ## 시공후     ![](url) …  또는  사진없음

   ▶ 규칙
     · 이미지의 "순서"는 노트에 적힌 그대로가 정답입니다. 재정렬하지 않습니다.
     · '사진없음' 은 "사진이 의도적으로 없다" 는 뜻입니다(= 화면에서 구간 숨김).
     · 이 파일은 추론을 하지 않습니다. 노트에 없는 이미지는 만들어 내지 않습니다.
       (예전 PDF·네이버 링크·발행대기 노트·사이트 데이터에서 되살리지 않습니다)
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join('Raw', '노출콘 시공기술사례');
const NOTE_RE = /^노출콘크리트 시공기술사례 - (\d{3})\.md$/;

/* 이미지 역할 — 노트의 소제목 → 사이트 데이터 항목 이름 */
const ROLES = [
  { heading: '대표사진', key: 'representative' },
  { heading: '시공전',   key: 'before' },
  { heading: '시공중',   key: 'process' },
  { heading: '시공후',   key: 'after' }
];
const HEADING_TO_KEY = ROLES.reduce((m, r) => (m[r.heading] = r.key, m), {});

const NO_PHOTO = '사진없음';

/* 마크다운 이미지 — ![alt](url).
   한 줄에 여러 장이 붙어 있는 노트가 많아 전역 검색으로 훑습니다. */
const IMAGE_RE = /!\[([^\]]*)\]\(\s*(<[^>]*>|[^)\s]+)[^)]*\)/g;

/** 제목 줄에서 소제목만 떼어 냅니다. ('## 시공후![](url)' 처럼 붙여 쓴 노트가 있습니다) */
function splitHeading(rest) {
  const cut = rest.search(/!\[|\[/);
  const title = (cut === -1 ? rest : rest.slice(0, cut)).trim();
  const tail = cut === -1 ? '' : rest.slice(cut);
  return { title, tail };
}

/** 구간 본문에서 이미지 URL 을 적힌 순서 그대로 뽑습니다. */
function imagesIn(body) {
  const out = [];
  let m;
  IMAGE_RE.lastIndex = 0;
  while ((m = IMAGE_RE.exec(body)) !== null) {
    let url = m[2].trim();
    if (url[0] === '<' && url[url.length - 1] === '>') url = url.slice(1, -1);
    if (url) out.push({ alt: m[1].trim(), url });
  }
  return out;
}

/**
 * 노트 한 장 → { work, images:{ representative, before, process, after }, notes[] }
 * images 의 각 항목은 { declaredNone:Boolean, list:[{alt,url}] } 입니다.
 */
function parseRawNote(raw) {
  const lines = String(raw).replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n');

  const bodies = {};                 // key → 구간 본문
  const order = [];                  // 노트에 나타난 구간 순서
  let work = '';
  let bucket = null;
  let buf = [];

  const flush = () => {
    if (bucket === null) return;
    const text = buf.join('\n');
    if (bucket === 'work') work = text.trim();
    else bodies[bucket] = (bodies[bucket] || '') + '\n' + text;
    buf = [];
  };

  for (const line of lines) {
    const h = /^#{1,6}\s*(.*)$/.exec(line);
    if (!h) { buf.push(line); continue; }

    const { title, tail } = splitHeading(h[1]);
    flush();
    if (title === '작업내용') bucket = 'work';
    else if (HEADING_TO_KEY[title]) { bucket = HEADING_TO_KEY[title]; order.push(bucket); }
    else bucket = null;             // '이미지분류' 등 묶음 제목 — 본문을 버립니다
    buf = tail ? [tail] : [];
  }
  flush();

  const images = {};
  ROLES.forEach(({ key }) => {
    const body = bodies[key];
    images[key] = body == null
      ? { declared: false, declaredNone: false, list: [] }
      : { declared: true, declaredNone: body.indexOf(NO_PHOTO) > -1, list: imagesIn(body) };
  });

  return { work, images, sectionOrder: order };
}

/** Raw 폴더 전체를 사례 번호 오름차순으로 읽습니다. */
function loadRawCases(vaultDir) {
  const dir = path.join(vaultDir, RAW_DIR);
  if (!fs.existsSync(dir)) {
    const err = new Error('Raw 폴더를 찾을 수 없습니다: ' + dir);
    err.code = 'ENORAW';
    throw err;
  }
  return fs.readdirSync(dir)
    .map((file) => ({ file, m: NOTE_RE.exec(file) }))
    .filter((x) => x.m)
    .sort((a, b) => a.m[1].localeCompare(b.m[1]))
    .map(({ file, m }) => Object.assign(
      { case_no: m[1], file, source_note: RAW_DIR.replace(/\\/g, '/') + '/' + file },
      parseRawNote(fs.readFileSync(path.join(dir, file), 'utf8'))
    ));
}

/**
 * 노트가 스키마를 지키는지 확인합니다. 고쳐 주지 않고, 그대로 알려만 줍니다.
 * (대표사진이 없는 사례를 다른 사진으로 몰래 채우지 않기 위한 장치입니다)
 */
function auditRawCase(c) {
  const issues = [];
  const rep = c.images.representative;

  if (!rep.declared) issues.push({ level: 'error', text: '대표사진 구간이 없습니다' });
  else if (rep.list.length === 0 && !rep.declaredNone) issues.push({ level: 'error', text: '대표사진이 비어 있습니다' });
  else if (rep.declaredNone) issues.push({ level: 'error', text: "대표사진이 '사진없음' 입니다" });
  else if (rep.list.length > 1) issues.push({ level: 'warn', text: `대표사진이 ${rep.list.length}장입니다 (첫 장을 사용)` });

  ['before', 'process', 'after'].forEach((key) => {
    const ko = ROLES.find((r) => r.key === key).heading;
    const s = c.images[key];
    if (!s.declared) { issues.push({ level: 'warn', text: `${ko} 구간이 없습니다` }); return; }
    if (!s.declaredNone && s.list.length === 0) {
      issues.push({ level: 'warn', text: `${ko} 구간이 비어 있습니다 ('사진없음' 표기 없음 — 사진 없음으로 처리)` });
    }
  });

  return issues;
}

module.exports = { RAW_DIR, ROLES, parseRawNote, loadRawCases, auditRawCase };
