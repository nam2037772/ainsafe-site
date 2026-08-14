/* ============================================================
   main.js — 공통 동작 + 페이지별 렌더러
   ------------------------------------------------------------
   · 빌드 도구 없이 동작하는 Vanilla JS (ES5+/ES2018 문법)
   · 페이지 구분은 <body data-page="..."> 값으로 합니다
   · 데이터는 projects.js / resources.js, 설정은 config.js
   ============================================================ */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var hasProjects  = typeof PROJECTS  !== 'undefined';
  var hasResources = typeof RESOURCES !== 'undefined';
  var hasContent   = typeof CONTENT   !== 'undefined';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  function byDateDesc(a, b) { return (b.date || '').localeCompare(a.date || ''); }
  function fmtDate(d) { return (d || '').replace(/-/g, '.'); }
  function img(src) { return src || FALLBACK_IMAGE; }

  /* ── 1. 헤더 / 내비게이션 ─────────────────────────────── */
  function initHeader() {
    var header = $('#header');
    var burger = $('#burger');
    var gnb = $('#gnb');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-solid', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!burger || !gnb) return;

    var close = function () {
      header.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('is-locked');
    };
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      document.body.classList.toggle('is-locked', open);
    });
    $$('a', gnb).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1100) close();
    });
  }

  /* ── 2. 회사정보 / 외부링크 주입 ──────────────────────── */
  function initConfigBindings() {
    if (typeof COMPANY === 'undefined') return;

    $$('[data-company]').forEach(function (el) {
      var key = el.getAttribute('data-company');
      var val = COMPANY[key];
      if (!val) return;
      if (el.tagName === 'A' && key === 'tel') { el.href = COMPANY.telHref; el.textContent = val; }
      else if (el.tagName === 'A' && key === 'email') { el.href = 'mailto:' + val; el.textContent = val; }
      else el.textContent = val;
    });

    $$('[data-link]').forEach(function (el) {
      var item = EXTERNAL_LINKS[el.getAttribute('data-link')];
      if (!item) return;
      if (!item.url) {
        el.removeAttribute('href');
        el.removeAttribute('target');
        el.removeAttribute('rel');
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('aria-label', item.label + ' 주소 준비 중');
        el.setAttribute('title', item.label + ' 주소 준비 중');
        el.classList.add('is-disabled');
        if (el.hasAttribute('data-link-label')) el.textContent = item.label + ' 준비 중';
        return;
      }
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      if (el.hasAttribute('data-link-label')) el.textContent = item.label;
    });

    // 사진 상담 채널 (페이지 내 모든 사진상담 버튼에 적용)
    var ch = CONTACT_CHANNELS.usePhotoChannel;
    var mailHref = 'mailto:' + COMPANY.email +
      '?subject=' + encodeURIComponent('[사진 상담] 현장 검토 요청') +
      '&body=' + encodeURIComponent('현장 사진을 첨부해 주세요.\n\n- 현장 위치 :\n- 건축물 종류 :\n- 증상(누수/균열/곰보 등) :\n- 연락처 :\n');
    $$('[data-photo-consult]').forEach(function (photo) {
      if (ch === 'kakao' && CONTACT_CHANNELS.kakao) {
        photo.href = CONTACT_CHANNELS.kakao;
        photo.target = '_blank';
        photo.rel = 'noopener noreferrer';
      } else if (ch === 'sms') {
        photo.href = CONTACT_CHANNELS.sms;
      } else {
        photo.href = mailHref;
      }
    });

    var year = $('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    var biz = $('[data-business-number]');
    if (biz) {
      if (COMPANY.businessNumber) biz.textContent = '사업자등록번호 ' + COMPANY.businessNumber;
      else biz.remove();
    }
  }

  /* ── 3. 스크롤 등장 ───────────────────────────────────── */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── 4. Before / After 비교 ───────────────────────────── */
  function setupCompare(root) {
    if (!root || root.getAttribute('data-ba-ready')) return;
    var range = $('.ba__range', root);
    if (!range) return;
    root.setAttribute('data-ba-ready', '1');
    var apply = function (v) { root.style.setProperty('--pos', v + '%'); };
    apply(range.value);
    range.addEventListener('input', function () { apply(range.value); });

    // 터치 / 마우스 드래그
    var dragging = false;
    var move = function (clientX) {
      var rect = root.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      range.value = pct;
      apply(pct);
    };
    root.addEventListener('pointerdown', function (e) {
      dragging = true;
      root.setPointerCapture && root.setPointerCapture(e.pointerId);
      move(e.clientX);
    });
    root.addEventListener('pointermove', function (e) { if (dragging) move(e.clientX); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      root.addEventListener(evt, function () { dragging = false; });
    });
  }
  function initCompares() { $$('.ba').forEach(setupCompare); }

  /* ── 5. 카드 및 리스트 마크업 ────────────────────────── */
  function projectCard(p) {
    var meta = [p.category, p.building, fmtDate(p.date)].filter(Boolean)
      .map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    return '' +
      '<article class="card">' +
        '<a class="card__link" href="project.html?id=' + esc(p.id) + '">' +
          '<span class="card__media">' +
            '<img src="' + esc(img(p.thumbnail || p.after)) + '" alt="' + esc(p.title) + ' 시공 사진"' +
            ' loading="lazy" width="800" height="600" />' +
            (p.before ? '<span class="card__flag">BEFORE / AFTER</span>' : '') +
          '</span>' +
          '<span class="card__body">' +
            '<span class="card__meta">' + meta + '</span>' +
            '<span class="card__ttl">' + esc(p.title) + '</span>' +
            '<span class="card__sum">' + esc(p.summary) + '</span>' +
          '</span>' +
        '</a>' +
      '</article>';
  }

  function featuredProjectCard(p, index) {
    var meta = [p.category, p.building, fmtDate(p.date)].filter(Boolean)
      .map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    
    if (index === 0) {
      // Split layout (Left text, Right photo)
      return '' +
        '<article class="project-split reveal">' +
          '<div class="project-split__body">' +
            '<p class="eyebrow">FEATURED WORK</p>' +
            '<p class="project-split__meta">' + meta + '</p>' +
            '<h3 class="project-split__ttl">' + esc(p.title) + '</h3>' +
            '<p class="project-split__sum">' + esc(p.summary) + '</p>' +
            '<a class="link-arrow" href="project.html?id=' + esc(p.id) + '">시공사례 자세히 보기</a>' +
          '</div>' +
          '<a class="project-split__media" href="project.html?id=' + esc(p.id) + '">' +
            '<img src="' + esc(img(p.after)) + '" alt="' + esc(p.title) + ' 시공 사진" loading="lazy" />' +
            (p.before ? '<span class="card__flag">BEFORE / AFTER</span>' : '') +
          '</a>' +
        '</article>';
    } else if (index === 3) {
      // Banner layout
      return '' +
        '<article class="project-banner reveal">' +
          '<a class="project-banner__link" href="project.html?id=' + esc(p.id) + '">' +
            '<div class="project-banner__media">' +
              '<img src="' + esc(img(p.after)) + '" alt="' + esc(p.title) + ' 시공 사진" loading="lazy" />' +
              (p.before ? '<span class="card__flag">BEFORE / AFTER</span>' : '') +
            '</div>' +
            '<div class="project-banner__body">' +
              '<p class="project-banner__meta">' + meta + '</p>' +
              '<h3 class="project-banner__ttl">' + esc(p.title) + '</h3>' +
              '<p class="project-banner__sum">' + esc(p.summary) + '</p>' +
            '</div>' +
          '</a>' +
        '</article>';
    } else {
      // Standard asymmetric grid items
      return '' +
        '<article class="project-item reveal">' +
          '<a class="project-item__link" href="project.html?id=' + esc(p.id) + '">' +
            '<span class="project-item__media">' +
              '<img src="' + esc(img(p.after)) + '" alt="' + esc(p.title) + ' 시공 사진" loading="lazy" />' +
              (p.before ? '<span class="card__flag">BEFORE / AFTER</span>' : '') +
            '</span>' +
            '<span class="project-item__body">' +
              '<span class="project-item__meta">' + meta + '</span>' +
              '<span class="project-item__ttl">' + esc(p.title) + '</span>' +
              '<span class="project-item__sum">' + esc(p.summary) + '</span>' +
            '</span>' +
          '</a>' +
        '</article>';
    }
  }

  function resourceRow(r) {
    var fileHtml = r.file 
      ? '<div class="resource-row__file"><a class="resource-row__download" href="' + esc(r.file) + '" download>PDF 자료</a></div>' 
      : '<div class="resource-row__file"></div>';
    
    return '' +
      '<article class="resource-row reveal">' +
        '<a class="resource-row__link" href="resource.html?id=' + esc(r.id) + '">' +
          '<span class="resource-row__cat">' + esc(r.category) + '</span>' +
          '<span class="resource-row__content">' +
            '<span class="resource-row__ttl">' + esc(r.title) + '</span>' +
            '<span class="resource-row__sum">' + esc(r.summary) + '</span>' +
          '</span>' +
          '<span class="resource-row__date">' + fmtDate(r.date) + '</span>' +
        '</a>' +
        fileHtml +
      '</article>';
  }

  /* 통합 콘텐츠 카드 — 기술문서와 시공사례를 같은 그리드에 함께 노출합니다.
     유형은 배지(card__type)로 구분합니다. 시공사례는 진한 배지 + BEFORE/AFTER 표시. */
  function contentCard(item) {
    var isCase = item.type === 'case';
    var typeLabel = isCase ? '시공사례' : '기술자료';
    var meta = [item.category || item.categoryRaw, isCase ? item.meta.building : '', fmtDate(item.date)]
      .filter(Boolean)
      .map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    var alt = item.title + (isCase ? ' 시공 사진' : ' 관련 사진');

    return '' +
      '<article class="card card--' + (isCase ? 'case' : 'tech') + ' reveal">' +
        '<a class="card__link" href="' + esc(item.url) + '">' +
          '<span class="card__media">' +
            '<img src="' + esc(img(item.images.thumbnail || item.images.cover)) + '" alt="' + esc(alt) + '"' +
            ' loading="lazy" width="800" height="600" />' +
            '<span class="card__type card__type--' + (isCase ? 'case' : 'tech') + '">' + typeLabel + '</span>' +
            (isCase && item.images.before ? '<span class="card__flag card__flag--btm">BEFORE / AFTER</span>' : '') +
          '</span>' +
          '<span class="card__body">' +
            '<span class="card__meta">' + meta + '</span>' +
            '<span class="card__ttl">' + esc(item.title) + '</span>' +
            '<span class="card__sum">' + esc(item.description) + '</span>' +
          '</span>' +
        '</a>' +
      '</article>';
  }

  function emptyState(msg) {
    return '<p class="empty">' + esc(msg) + '</p>';
  }

  /* ── 6-1. 공통 목록 위젯 ──────────────────────────────── */
  /* <div data-works="featured|카테고리명|all" data-limit="3"> */
  function initWorkLists() {
    if (!hasProjects) return;
    $$('[data-works]').forEach(function (box) {
      var mode = box.getAttribute('data-works');
      var limit = parseInt(box.getAttribute('data-limit'), 10) || 3;
      var list;
      if (mode === 'featured') {
        list = PROJECTS.filter(function (p) { return p.featured; }).sort(byDateDesc);
        if (list.length < 3) list = PROJECTS.slice().sort(byDateDesc);
      } else if (mode === 'all' || !mode) {
        list = PROJECTS.slice().sort(byDateDesc);
      } else {
        list = PROJECTS.filter(function (p) { return p.category === mode; }).sort(byDateDesc);
      }
      list = list.slice(0, limit);
      var isAsymmetric = box.classList.contains('works-asymmetric');
      box.innerHTML = list.length ? list.map(function(p, i) {
        return isAsymmetric ? featuredProjectCard(p, i) : projectCard(p);
      }).join('')
        : emptyState('해당 분야의 시공사례를 준비 중입니다.');
    });
  }

  /* <div data-resources="카테고리명|all" data-limit="4"> */
  function initResourceLists() {
    if (!hasResources) return;
    $$('[data-resources]').forEach(function (box) {
      var mode = box.getAttribute('data-resources');
      var limit = parseInt(box.getAttribute('data-limit'), 10) || 4;
      var list = RESOURCES.slice().sort(byDateDesc);
      if (mode && mode !== 'all') list = list.filter(function (r) { return r.category === mode; });
      list = list.slice(0, limit);
      box.innerHTML = list.length ? list.map(resourceRow).join('')
        : emptyState('등록된 기술자료가 없습니다.');
    });
  }

  /* ── 6-2. 메인페이지 Before/After ─────────────────────── */
  function initHome() {
    // Before/After 사례 전환
    var stage = $('#ba');
    var nav = $('#baNav');
    if (stage && nav && hasProjects) {
      var pairs = PROJECTS.filter(function (p) { return p.before && p.after; }).sort(byDateDesc).slice(0, 4);
      if (!pairs.length) {
        var section = document.getElementById('compare');
        if (section) section.hidden = true;
        return;
      }
      var beforeEl = $('#baBefore'), afterEl = $('#baAfter');
      var titleEl = $('#baTitle'), noteEl = $('#baNote'), moreEl = $('#baMore');
      if (!beforeEl || !afterEl || !titleEl || !noteEl) {
        stage.hidden = true;
        return;
      }

      var show = function (i) {
        var p = pairs[i];
        beforeEl.src = p.before;
        beforeEl.alt = p.title + ' 시공 전 사진';
        afterEl.src = p.after;
        afterEl.alt = p.title + ' 시공 후 사진';
        titleEl.textContent = p.title;
        noteEl.textContent = p.problem || p.summary;
        if (moreEl) moreEl.href = 'project.html?id=' + p.id;
        $$('button', nav).forEach(function (b, bi) {
          b.classList.toggle('is-on', bi === i);
          b.setAttribute('aria-selected', bi === i ? 'true' : 'false');
        });
      };

      nav.innerHTML = pairs.map(function (p, i) {
        return '<button type="button" role="tab" aria-selected="' + (i === 0) + '"' +
               ' class="' + (i === 0 ? 'is-on' : '') + '">' + esc(p.category) + ' · ' + esc(fmtDate(p.date)) + '</button>';
      }).join('');
      $$('button', nav).forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
      show(0);
    }
  }

  /* ── 7. 시공사례 목록 ─────────────────────────────────── */
  function initProjectsPage() {
    var grid = $('#projectGrid');
    if (!grid || !hasProjects) return;

    var requestedCategory = qs('category');
    var state = {
      category: CATEGORIES.indexOf(requestedCategory) > -1 ? requestedCategory : 'all',
      shown: 9
    };
    var STEP = 9;
    var catBox = $('#catFilters');
    var moreBtn = $('#projectMore');
    var countEl = $('#projectCount');

    function chip(value, label, active) {
      return '<button class="filter' + (active ? ' is-on' : '') + '" type="button" role="tab"' +
             ' aria-selected="' + (active ? 'true' : 'false') + '" data-value="' + esc(value) + '">' + esc(label) + '</button>';
    }
    if (catBox) {
      catBox.innerHTML = chip('all', '전체', state.category === 'all') +
        CATEGORIES.map(function (c) { return chip(c, c, state.category === c); }).join('');
    }

    function filtered() {
      return PROJECTS.slice().sort(byDateDesc).filter(function (p) {
        return state.category === 'all' || p.category === state.category;
      });
    }
    function render() {
      var list = filtered();
      var view = list.slice(0, state.shown);
      grid.innerHTML = view.length ? view.map(projectCard).join('')
        : emptyState('선택하신 조건의 시공사례를 준비 중입니다. 다른 분류를 선택해 보세요.');
      if (countEl) countEl.textContent = list.length;
      if (moreBtn) moreBtn.hidden = state.shown >= list.length;
    }
    function bind(box, key) {
      if (!box) return;
      box.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-value]');
        if (!btn) return;
        state[key] = btn.getAttribute('data-value');
        state.shown = STEP;
        $$('button', box).forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        render();
      });
    }
    bind(catBox, 'category');
    if (moreBtn) moreBtn.addEventListener('click', function () { state.shown += STEP; render(); });
    render();
  }

  /* ── 8. 시공사례 상세 ─────────────────────────────────── */
  function initProjectDetail() {
    var root = $('#projectDetail');
    if (!root || !hasProjects) return;
    var requestedId = qs('id');
    var id = (typeof PROJECT_ALIASES !== 'undefined' && PROJECT_ALIASES[requestedId]) || requestedId;
    var idx = -1;
    var sorted = PROJECTS.slice().sort(byDateDesc);
    sorted.forEach(function (p, i) { if (p.id === id) idx = i; });

    if (idx < 0) {
      var isRetired = typeof RETIRED_PROJECT_IDS !== 'undefined' && RETIRED_PROJECT_IDS.indexOf(requestedId) !== -1;
      root.innerHTML = '<div class="wrap notfound">' +
        (isRetired
          ? '<h1 class="h2">이 시공사례는 게시가 종료되었습니다.</h1>' +
            '<p>검증되지 않은 이전 콘텐츠는 더 이상 제공하지 않습니다. 검증된 기술자료와 시공사례를 확인해 주세요.</p>' +
            '<p><a class="btn btn--dark" href="resources.html?type=case">기술자료 목록으로</a></p>'
          : '<h1 class="h2">요청하신 시공사례를 찾을 수 없습니다.</h1>' +
            '<p>주소가 변경되었거나 삭제된 항목일 수 있습니다.</p>' +
            '<p><a class="btn btn--dark" href="resources.html?type=case">기술자료 목록으로</a></p>') +
        '</div>';
      return;
    }
    var p = sorted[idx];
    updateMeta(p.title, p.category + ' — ' + p.summary, img(p.after));

    var rows = [
      ['시공 분야', p.category], ['건축물', p.building], ['현장 위치', p.location],
      ['시공 시기', fmtDate(p.date)], ['작업 기간', p.period]
    ].filter(function (r) { return r[1]; });

    var blocks = [
      ['주요 하자 · 문제점', p.problem], ['적용 공법', p.method], ['시공 결과', p.result]
    ].filter(function (r) { return r[1]; });

    var gallery = (p.images || []).concat(p.before && p.after ? [] : []);

    root.innerHTML =
      '<div class="wrap detail__head">' +
        '<p class="eyebrow">WORKS</p>' +
        '<h1 class="h2">' + esc(p.title) + '</h1>' +
        '<p class="lead">' + esc(p.summary) + '</p>' +
      '</div>' +
      (p.before && p.after ?
        '<div class="wrap"><div class="ba" id="baDetail">' +
          '<img class="ba__img" src="' + esc(p.after) + '" alt="' + esc(p.title) + ' 시공 후" loading="lazy" />' +
          '<img class="ba__img ba__img--before" src="' + esc(p.before) + '" alt="' + esc(p.title) + ' 시공 전" loading="lazy" />' +
          '<span class="ba__divider"></span>' +
          '<span class="ba__label ba__label--before">BEFORE</span>' +
          '<span class="ba__label ba__label--after">AFTER</span>' +
          '<span class="ba__handle"></span>' +
          '<input class="ba__range" type="range" min="0" max="100" value="50" aria-label="시공 전후 비교 슬라이더" />' +
        '</div></div>'
        :
        '<figure class="detail__figure"><img src="' + esc(img(p.after)) + '" alt="' + esc(p.title) + ' 시공 사진" loading="lazy" /></figure>') +
      '<div class="wrap detail__grid">' +
        '<div class="detail__body">' +
          blocks.map(function (b) {
            return '<section class="detail__block"><h2 class="h3">' + esc(b[0]) + '</h2><p>' + esc(b[1]) + '</p></section>';
          }).join('') +
          (gallery.length ? '<div class="detail__gallery">' + gallery.map(function (src) {
            return '<img src="' + esc(src) + '" alt="' + esc(p.title) + ' 추가 사진" loading="lazy" />';
          }).join('') + '</div>' : '') +
        '</div>' +
        '<aside class="detail__side">' +
          '<dl class="spec">' + rows.map(function (r) {
            return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
          }).join('') + '</dl>' +
          '<a class="btn btn--dark btn--block" href="contact.html">같은 유형으로 상담하기</a>' +
        '</aside>' +
      '</div>';

    setupCompare($('#baDetail') || document.createElement('div'));

    // 관련 시공사례
    var rel = $('#relatedWorks');
    if (rel) {
      var related = sorted.filter(function (o) { return o.id !== p.id && o.category === p.category; }).slice(0, 3);
      if (!related.length) related = sorted.filter(function (o) { return o.id !== p.id; }).slice(0, 3);
      rel.innerHTML = related.map(projectCard).join('');
    }
    // 이전 / 다음
    var pager = $('#projectPager');
    if (pager) {
      var prev = sorted[idx - 1], next = sorted[idx + 1];
      pager.innerHTML =
        (prev ? '<a href="project.html?id=' + esc(prev.id) + '">← ' + esc(prev.title) + '</a>' : '<span></span>') +
        (next ? '<a href="project.html?id=' + esc(next.id) + '">' + esc(next.title) + ' →</a>' : '<span></span>');
    }
  }

  /* ── 9. 기술자료 통합 목록 (기술문서 + 시공사례) ────────
     주소 파라미터를 지원합니다.
       ?category=노출콘크리트  (예전 분류명 '인젝션','균열보수' 등도 자동 변환)
       ?type=case | technical
       ?q=검색어                                                        */
  function initContentPage() {
    var grid = $('#contentGrid');
    if (!grid || !hasContent) return;

    var STEP = 12;
    var reqCategory = unifyCategory(qs('category'));
    var reqType = qs('type');
    var state = {
      category: reqCategory || 'all',
      type: CONTENT_TYPES.some(function (t) { return t.value === reqType; }) ? reqType : 'all',
      q: qs('q') || '',
      shown: STEP
    };

    var catBox  = $('#contentFilters');
    var typeBox = $('#contentTypeFilters');
    var search  = $('#contentSearch');
    var countEl = $('#contentCount');
    var scopeEl = $('#contentScope');
    var moreBtn = $('#contentMore');

    function chip(value, label, active) {
      return '<button class="filter' + (active ? ' is-on' : '') + '" type="button" role="tab"' +
             ' aria-selected="' + (active ? 'true' : 'false') + '" data-value="' + esc(value) + '">' +
             esc(label) + '</button>';
    }

    if (catBox) {
      catBox.innerHTML = chip('all', '전체', state.category === 'all') +
        usedUnifiedCategories().map(function (c) {
          return chip(c, c, state.category === c);
        }).join('');
    }
    if (typeBox) {
      typeBox.innerHTML = chip('all', '전체', state.type === 'all') +
        CONTENT_TYPES.map(function (t) {
          return chip(t.value, t.label, state.type === t.value);
        }).join('');
    }
    if (search && state.q) search.value = state.q;

    function filtered() {
      var q = state.q.trim().toLowerCase();
      return CONTENT.filter(function (item) {
        if (state.category !== 'all' && item.category !== state.category) return false;
        if (state.type !== 'all' && item.type !== state.type) return false;
        if (!q) return true;
        return item.searchText.indexOf(q) > -1;
      });
    }

    function render() {
      var list = filtered();
      var view = list.slice(0, state.shown);
      grid.innerHTML = view.length ? view.map(contentCard).join('')
        : emptyState('검색 조건에 맞는 자료가 없습니다. 다른 키워드나 분류를 선택해 보세요.');
      if (countEl) countEl.textContent = list.length;
      if (scopeEl) {
        var nTech = list.filter(function (i) { return i.type === 'technical'; }).length;
        var nCase = list.length - nTech;
        scopeEl.textContent = (nTech && nCase) ? ' · 기술자료 ' + nTech + ' · 시공사례 ' + nCase
          : nCase ? ' · 시공사례' : nTech ? ' · 기술자료' : '';
      }
      if (moreBtn) moreBtn.hidden = state.shown >= list.length;
      initReveal();
    }

    function bind(box, key) {
      if (!box) return;
      box.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-value]');
        if (!btn) return;
        state[key] = btn.getAttribute('data-value');
        state.shown = STEP;
        $$('button', box).forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        render();
      });
    }
    bind(catBox, 'category');
    bind(typeBox, 'type');

    if (search) {
      search.addEventListener('input', function () {
        state.q = search.value;
        state.shown = STEP;
        render();
      });
      search.form && search.form.addEventListener('submit', function (e) { e.preventDefault(); });
    }
    if (moreBtn) moreBtn.addEventListener('click', function () { state.shown += STEP; render(); });

    render();
  }

  /* ── 10. 기술자료 상세 ────────────────────────────────── */
  function initResourceDetail() {
    var root = $('#resourceDetail');
    if (!root || !hasResources) return;
    var id = qs('id');
    var r = null;
    RESOURCES.forEach(function (o) { if (o.id === id) r = o; });

    if (!r) {
      root.innerHTML = '<div class="wrap notfound">' +
        '<h1 class="h2">요청하신 기술자료를 찾을 수 없습니다.</h1>' +
        '<p><a class="btn btn--dark" href="resources.html">기술자료 목록으로</a></p></div>';
      return;
    }
    updateMeta(r.title, r.summary, r.thumbnail || FALLBACK_IMAGE);

    root.innerHTML =
      '<div class="wrap detail__head">' +
        '<p class="eyebrow">TECHNICAL NOTE</p>' +
        '<p class="doc__meta"><span>' + esc(r.category) + '</span><span>' + fmtDate(r.date) + '</span></p>' +
        '<h1 class="h2">' + esc(r.title) + '</h1>' +
        '<p class="lead">' + esc(r.summary) + '</p>' +
      '</div>' +
      (r.thumbnail ? '<figure class="detail__figure"><img src="' + esc(r.thumbnail) + '" alt="' + esc(r.title) + ' 관련 시공 사진" loading="lazy" /></figure>' : '') +
      '<div class="wrap doc__body">' + r.content +
        (r.file ? '<p class="doc__file"><a class="btn btn--line" href="' + esc(r.file) + '" download>자료 내려받기 (PDF)</a></p>' : '') +
        ((r.tags || []).length ? '<ul class="doc__tags">' + r.tags.map(function (t) {
          return '<li>#' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      '</div>';

    var rel = $('#relatedResources');
    if (rel) {
      var related = RESOURCES.filter(function (o) { return o.id !== r.id && o.category === r.category; }).slice(0, 3);
      if (!related.length) related = RESOURCES.filter(function (o) { return o.id !== r.id; }).slice(0, 3);
      rel.innerHTML = related.length ? related.map(resourceRow).join('') : emptyState('관련 자료가 없습니다.');
    }
  }

  /* ── 11. 상담 폼 (메일 앱 연결 — 가짜 전송 없음) ──────── */
  function initQuoteForm() {
    var form = $('#quoteForm');
    if (!form) return;

    if (CONTACT_CHANNELS.externalForm) {
      // 외부 폼(네이버폼/구글폼)이 설정되면 폼 대신 링크로 안내
      form.innerHTML = '<h2 class="form__title">견적문의</h2>' +
        '<p>온라인 견적문의는 아래 폼에서 접수합니다.</p>' +
        '<p><a class="btn btn--dark" href="' + esc(CONTACT_CHANNELS.externalForm) +
        '" target="_blank" rel="noopener noreferrer">견적문의 폼 열기</a></p>';
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = $$('[required]', form);
      var bad = null;
      required.forEach(function (el) {
        var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = el;
      });
      if (bad) {
        bad.focus();
        toast('필수 항목을 입력해 주세요.');
        return;
      }
      var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var body = [
        '성함 / 회사명 : ' + get('name'),
        '연락처 : ' + get('phone'),
        '현장 위치 : ' + get('place'),
        '문의 구분 : ' + get('type'),
        '',
        '현장 상태 / 요청사항',
        get('message'),
        '',
        '— ' + COMPANY.siteUrl + ' 견적문의'
      ].join('\n');

      window.location.href = 'mailto:' + COMPANY.email +
        '?subject=' + encodeURIComponent('[견적문의] ' + get('name') + ' / ' + get('type')) +
        '&body=' + encodeURIComponent(body);
      toast('메일 앱으로 문의 내용을 전달했습니다.');
    });
  }

  /* 상세페이지 메타 갱신 (검색엔진이 항목별로 인식하도록) */
  function updateMeta(title, desc, image) {
    document.title = title + ' | ' + COMPANY.name;
    var set = function (sel, attr, val) {
      var el = $(sel);
      if (el && val) el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', title + ' | ' + COMPANY.name);
    set('meta[property="og:description"]', 'content', desc);
    var absoluteImage = image ? new URL(image, window.location.href).href : '';
    set('meta[property="og:image"]', 'content', absoluteImage);
    var url = window.location.href;
    set('link[rel="canonical"]', 'href', url);
    set('meta[property="og:url"]', 'content', url);
  }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) { alert(msg); return; }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 3200);
  }

  /* ── 부팅 ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initConfigBindings();
    initReveal();

    initWorkLists();
    initResourceLists();

    var page = document.body.getAttribute('data-page');
    if (page === 'home') initHome();
    if (page === 'projects') initProjectsPage();
    if (page === 'project') initProjectDetail();
    if (page === 'resources') initContentPage();
    if (page === 'resource') initResourceDetail();
    initQuoteForm();
    initCompares();
  });
})();
