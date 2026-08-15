/* ============================================================
   case-images.js — 시공기술사례 이미지 역할 정규화 모델
   ------------------------------------------------------------
   ▶ 목적
     시공기술사례의 "대표 / 시공 전 / 시공 후" 이미지 선택 규칙을
     이 파일 한 곳에만 둡니다. 카드·아카이브·상세페이지는
     스스로 이미지를 고르지 않고 여기서 만든 결과만 사용합니다.

   ▶ 분류의 정본은 옵시디언 Raw 노트입니다.

       Raw/노출콘 시공기술사례/노출콘크리트 시공기술사례 - NNN.md
         ## 대표사진 / ## 시공전 / ## 시공중 / ## 시공후
              ↓ tools/rebuild-cases.js
       projects.js
         representative_image / representative_images
         before_images / process_images / after_images

     · 이 파일은 사진을 "고르지" 않습니다. 이미 정해진 역할을 정리만 합니다.
     · 순서는 노트에 적힌 그대로이며 여기서 다시 정렬하지 않습니다.
     · '사진없음' 인 구간은 빈 배열로 넘어오고, 화면에서 통째로 숨깁니다.
     · 파일명만 적으면 해당 사례의 이미지 폴더에서 찾습니다.
       (assets/images/case-studies/case-<번호>-<slug>/)
     · '/' 가 포함된 경로나 http(s) 주소를 적으면 그대로 사용합니다.

   ▶ 이전 데이터 호환 (새 항목이 없어도 절대 깨지지 않습니다)
       representativeImage 우선순위
         1) representative_image      (명시)
         2) after_images[0]           (명시)
         3) thumbnail → after         (기존 로직)
         4) images[0] → before_images[0] → before  (본문 첫 이미지)
         5) ''  → 화면에서 FALLBACK_IMAGE 로 대체

   ▶ 결과 형태
     {
       representativeImage : String,   // 카드 썸네일 = 대표사진 첫 장
       representativeImages: [String], // 대표사진 구간 전체 (보통 1장)
       beforeImages        : [String], // 시공 전
       processImages       : [String], // 시공 중
       afterImages         : [String], // 시공 후
       galleryImages       : [String], // 위에서 쓰이지 않은 나머지 사진
       hasBefore           : Boolean,
       hasProcess          : Boolean,
       hasAfter            : Boolean,
       showComparison      : Boolean,  // 상세페이지 시공 전·중·후 구간 노출 여부
       source              : 'explicit' | 'fallback'  // 대표 이미지 출처
     }
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (root) root.CaseImages = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  /* 경로 정리 — 공백 제거, 윈도우 역슬래시를 슬래시로, './' 접두 제거 */
  function cleanPath(value) {
    if (value == null) return '';
    var s = String(value).trim();
    if (!s) return '';
    s = s.replace(/\\/g, '/');
    while (s.indexOf('./') === 0) s = s.slice(2);
    return s;
  }

  /* 문자열 하나 또는 배열을 받아 빈 값 없는 배열로 만듭니다. */
  function toList(value) {
    var arr;
    if (value == null) arr = [];
    else if (Object.prototype.toString.call(value) === '[object Array]') arr = value;
    else arr = [value];

    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var p = cleanPath(arr[i]);
      if (p && out.indexOf(p) === -1) out.push(p);
    }
    return out;
  }

  /* 여러 후보 중 처음으로 값이 있는 것을 고릅니다. */
  function firstOf() {
    for (var i = 0; i < arguments.length; i++) {
      var p = cleanPath(arguments[i]);
      if (p) return p;
    }
    return '';
  }

  /* 명시적 이미지 역할 항목이 하나라도 있는지 */
  function hasExplicitRoles(c) {
    return !!(cleanPath(c.representative_image) ||
              toList(c.representative_images).length ||
              toList(c.after_images).length ||
              toList(c.process_images).length ||
              toList(c.before_images).length);
  }

  /**
   * 시공기술사례 원본 항목 → 정규화된 이미지 모델
   * @param {Object} caseData PROJECTS 배열의 항목
   */
  function normalize(caseData) {
    var c = caseData || {};

    /* 1. 명시 항목 (Raw 노트의 이미지 분류에서 온 값) */
    var explicitRepList = toList(c.representative_images);
    var explicitRep     = firstOf(c.representative_image, explicitRepList[0]);
    var explicitBefore  = toList(c.before_images);
    var explicitProcess = toList(c.process_images);
    var explicitAfter   = toList(c.after_images);

    /* 2. 시공 전 — 명시값 우선, 없으면 기존 before 필드 */
    var beforeImages = explicitBefore.length ? explicitBefore : toList(c.before);

    /* 3. 시공 중 — 명시값만 씁니다 (예전 데이터에는 없던 구간) */
    var processImages = explicitProcess;

    /* 4. 시공 후 — 명시값 우선, 없으면 기존 after 필드 */
    var afterImages = explicitAfter.length ? explicitAfter : toList(c.after);

    /* 5. 대표 이미지 — 노트의 '대표사진' 이 있으면 무조건 그것입니다.
          아래 후보들은 역할 지정이 아예 없는 예전 데이터를 위한 안전망일 뿐입니다. */
    var representativeImage = firstOf(
      explicitRep,                 // 1) 명시된 대표 이미지
      explicitAfter[0],            // 2) 명시된 시공 후 이미지의 첫 장
      c.thumbnail,                 // 3) 기존 대표 이미지 로직
      c.after,
      (c.images || [])[0],         // 4) 본문에서 쓰이는 첫 이미지
      beforeImages[0]
    );
    /* 5) 값이 없으면 '' — 화면에서 FALLBACK_IMAGE 로 대체됩니다. */

    var representativeImages = explicitRepList.length
      ? explicitRepList
      : (representativeImage ? [representativeImage] : []);

    /* 6. 나머지 사진 — 대표/전/중/후 어디에도 쓰이지 않은 것만 */
    var used = {};
    representativeImages.concat(beforeImages, processImages, afterImages)
      .forEach(function (p) { used[p] = true; });

    var galleryImages = toList(c.images).filter(function (p) { return !used[p]; });

    /* 7. 상세페이지 시공 전·중·후 구간 노출 판단
          - 시공 전 또는 시공 중 사진이 있으면 항상 노출
          - 시공 후 사진이 여러 장이면 노출
          - 시공 후 사진이 대표 이미지와 다른 사진이면 노출
          (= 대표 이미지 한 장뿐인 사례를 두 번 보여 주지 않습니다) */
    var hasBefore  = beforeImages.length > 0;
    var hasProcess = processImages.length > 0;
    var hasAfter   = afterImages.length > 0;
    var showComparison = hasBefore || hasProcess ||
      afterImages.length > 1 ||
      (afterImages.length === 1 && afterImages[0] !== representativeImage);

    return {
      representativeImage: representativeImage,
      representativeImages: representativeImages,
      beforeImages: beforeImages,
      processImages: processImages,
      afterImages: afterImages,
      galleryImages: galleryImages,
      hasBefore: hasBefore,
      hasProcess: hasProcess,
      hasAfter: hasAfter,
      showComparison: showComparison,
      source: hasExplicitRoles(c) ? 'explicit' : 'fallback'
    };
  }

  /* 카드/목록에서 자주 쓰는 축약 — 대표(완성) 이미지 한 장 */
  function representativeOf(caseData) {
    return normalize(caseData).representativeImage;
  }

  return {
    normalize: normalize,
    representativeOf: representativeOf,
    cleanPath: cleanPath,
    toList: toList
  };
});
