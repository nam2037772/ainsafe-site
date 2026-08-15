/* ============================================================
   config.js — 회사 정보 · 외부 채널 · 상담 채널 설정
   ------------------------------------------------------------
   ▶ 이 파일 하나만 고치면 사이트 전체(헤더/푸터/상담버튼/구조화데이터)에
     반영됩니다. 전화번호·주소·SNS 주소가 바뀌면 여기만 수정하세요.
   ▶ TODO 주석이 달린 항목은 실제 주소가 확정되면 교체해야 합니다.
   ============================================================ */

const COMPANY = {
  name: '주식회사 아인산업안전',          // 법인 등기상 정식 회사명 (회사정보 표기용)
  shortName: '아인산업안전',
  nameEn: 'JEJU CONCRETE RESTORATION',
  slogan: '노출콘크리트 면보수 · 특수방수 전문',
  tel: '1660-4019',
  telHref: 'tel:16604019',
  email: 'ainsafe@naver.com',
  address: '제주특별자치도 서귀포시 성산읍 풍천로 142, 103호',
  addressRegion: '제주특별자치도',
  addressLocality: '서귀포시',
  streetAddress: '성산읍 풍천로 142, 103호',
  hours: '평일 08:00 – 18:00 (현장 상담 예약제)',
  businessNumber: '', // TODO: 사업자등록번호 확정 시 입력 (빈 값이면 화면에 표시하지 않음)
  siteUrl: 'https://nam2037772.github.io/ainsafe-site/'
};

/* 외부 채널 — 새 탭으로 열림 (target=_blank, rel=noopener noreferrer)
   ※ shop 은 일반 쇼핑몰이 아니라 '시공에 쓰는 자재를 파는 곳'으로만 안내합니다.
     '온라인몰' 같은 일반 명칭은 쓰지 않고, 무엇을 살 수 있는지 드러나는 문구를 씁니다. */
const EXTERNAL_LINKS = {
  shop: {
    url: 'https://ainsafety.com/',
    label: '노출콘크리트 · 방수 자재 구매',
    desc: '보수재, 방수재, 발수제 등 시공에 쓰는 자재를 직접 구매하실 수 있습니다.'
  },
  blog: {
    url: 'https://blog.naver.com/ainsafe',
    label: '네이버 블로그',
    desc: '현장에서 기록한 시공 과정과 보수 노하우를 정리해 올립니다.'
  },
  youtube: {
    url: 'https://www.youtube.com/@%EC%95%84%EC%9D%B8%EC%82%B0%EC%97%85%EC%95%88%EC%A0%84',
    label: '유튜브',
    desc: '실제 시공 장면과 공법 시연을 영상으로 확인할 수 있습니다.'
  },
  instagram: {
    url: 'https://www.instagram.com/ericswallart/',
    label: '인스타그램',
    desc: '완성된 노출콘크리트 면과 디테일 사진을 짧게 기록합니다.'
  }
};

/* 상담 채널 — 실제로 동작하는 수단만 사용합니다(정적 사이트, 자체 서버 없음) */
const CONTACT_CHANNELS = {
  /* 전화 상담 */
  phone: COMPANY.telHref,

  /* 사진 상담: 현재는 메일 앱 연결.
     TODO: 카카오톡 채널이 개설되면 kakao 값에 채널 주소를 넣고 usePhotoChannel 을 'kakao' 로 변경 */
  kakao: '', // 예: 'https://pf.kakao.com/_xxxxxx/chat'
  sms: 'sms:16604019',
  usePhotoChannel: 'email', // 'email' | 'kakao' | 'sms'

  /* 견적문의: 자체 서버가 없으므로 메일 본문 자동 작성 방식.
     TODO: 네이버폼/구글폼을 사용할 경우 externalForm 에 주소를 넣으면
     견적문의 버튼이 해당 폼으로 연결됩니다. */
  externalForm: ''
};

/* 시공사례 · 기술자료 원본 분류 (글을 쓸 때 적는 이름).
   화면 필터는 assets/js/content.js 의 UNIFIED_CATEGORIES 를 씁니다. */
const RESOURCE_CATEGORIES = ['노출콘크리트', '균열보수', '인젝션', '특수방수', '표면보호'];

/* 이미지가 없을 때 사용할 대체 이미지 (경로는 각 페이지 기준 상대경로로 보정됨) */
const FALLBACK_IMAGE = 'assets/images/hero/concrete-detail.jpg';
