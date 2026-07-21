/* ============================================================
   projects.js — 시공사례 데이터
   ------------------------------------------------------------
   ▶ 새 시공사례를 추가하려면 아래 배열 맨 앞에 항목 하나를 추가하세요.
     (배열 순서 = 화면 노출 순서. date 기준 최신순 정렬도 자동 적용됩니다)

   필드 설명
     id        : 영문 소문자·숫자·하이픈. 상세페이지 주소가 됩니다
                 → project.html?id=여기값
     title     : 공사명
     location  : 지역 (제주시 / 서귀포시 / 성산읍 / 애월읍 …)
     building  : 건축물 종류 (공공청사, 근린생활시설, 주택 …)
     category  : '노출콘크리트' | '균열보수' | '인젝션' | '특수방수' | '안전시설'
     date      : 'YYYY-MM'  (정렬 기준)
     period    : 작업 기간 (예: '4일') — 모르면 '' 로 두면 표시되지 않음
     summary   : 한 줄 요약 (목록 카드에 노출)
     problem   : 주요 하자 / 문제점
     method    : 적용 공법
     result    : 시공 결과
     thumbnail : 목록용 이미지 (없으면 after 사용)
     after     : 시공 후 사진 (대표 이미지)
     before    : 시공 전 사진 ('' 이면 Before/After 비교가 표시되지 않음)
     images    : 추가 사진 배열
     featured  : true 이면 메인페이지 대표 시공사례에 노출
   ============================================================ */

const PROJECTS = [
  {
    id: 'jeju-starlight-park-001',
    title: '제주 별빛누리공원 노출콘크리트 복원공사',
    location: '제주시',
    building: '공공 문화시설',
    category: '노출콘크리트',
    date: '2025-09',
    period: '',
    summary: '외부 노출콘크리트 면보수 및 마감 복원. 해풍에 노출된 외벽의 색상 편차를 조정했습니다.',
    problem: '해풍과 자외선에 장기간 노출되어 표면이 백화되고, 부분 보수 이력으로 색상 편차가 뚜렷했습니다.',
    method: '표면 세정 후 곰보·기포 충전, 주변 면과 동일한 톤으로 색상·질감 재현, 발수제 도포로 표면 보호.',
    result: '보수 부위와 기존 면의 경계가 드러나지 않도록 전체 톤을 정리했습니다.',
    thumbnail: 'assets/images/projects/starry-park-after-thumb.jpg',
    after: 'assets/images/projects/starry-park-after.jpg',
    before: 'assets/images/projects/starry-park-before.jpg',
    images: [],
    featured: true
  },
  {
    id: 'jeju-parking-injection-001',
    title: '지하주차장 누수 인젝션 특수방수',
    location: '제주시',
    building: '지하주차장',
    category: '인젝션',
    date: '2025-06',
    period: '',
    summary: '슬래브 균열·조인트를 따라 발생한 누수를 우레탄 인젝션으로 차단했습니다.',
    problem: '천장 슬래브 균열과 시공 조인트를 따라 지속적으로 물이 떨어지고 백태가 발생했습니다.',
    method: '누수 경로 추적 → 패커 설치 → 우레탄 인젝션 주입 → 잔여 습기 확인 후 표면 정리.',
    result: '주입 후 재차 강우 시 누수 재발 여부를 확인하고 마감했습니다.',
    thumbnail: 'assets/images/projects/parking-after-thumb.jpg',
    after: 'assets/images/projects/parking-after.jpg',
    before: 'assets/images/projects/parking-before.jpg',
    images: [],
    featured: true
  },
  {
    id: 'jeju-wall-crack-001',
    title: '건물 벽체 균열보수 및 마감공사',
    location: '제주시',
    building: '근린생활시설',
    category: '균열보수',
    date: '2024-11',
    period: '',
    summary: '외벽 균열부를 정밀 보수하고 주변 면과 동일하게 마감했습니다.',
    problem: '외벽에 수직 균열이 진행되어 우수 침투와 오염이 발생하고 있었습니다.',
    method: '균열 폭·거동 조사 후 V컷 충전 및 저압 에폭시 주입, 단면 정리 후 색상 매칭 마감.',
    result: '균열선이 보이지 않도록 정리하고 재발 여부를 관찰할 수 있도록 기록했습니다.',
    thumbnail: 'assets/images/projects/crack-after-thumb.jpg',
    after: 'assets/images/projects/crack-after.jpg',
    before: 'assets/images/projects/crack-before.jpg',
    images: [],
    featured: true
  },
  {
    id: 'seogwipo-nh-001',
    title: '서귀포농협 지점 외벽 면보수 공사',
    location: '서귀포시',
    building: '금융시설',
    category: '노출콘크리트',
    date: '2024-08',
    period: '',
    summary: '외벽 노출콘크리트 곰보 보수 및 층조인트 단차 제거.',
    problem: '타설 시 발생한 곰보와 층간 단차로 외관이 고르지 않았습니다.',
    method: '결함부 치핑 후 폴리머 모르타르 충전, 층조인트 라인 정리, 표면 질감 재현.',
    result: '층조인트 라인이 일정하게 정리되어 건물 인상이 정돈되었습니다.',
    thumbnail: 'assets/images/projects/seogwipo-nh-thumb.jpg',
    after: 'assets/images/projects/seogwipo-nh.jpg',
    before: '',
    images: [],
    featured: true
  },
  {
    id: 'seongsan-sincheon-ivory-001',
    title: '신천리 아이보리 노출콘크리트 면보수',
    location: '서귀포시 성산읍',
    building: '단독주택',
    category: '노출콘크리트',
    date: '2024-05',
    period: '',
    summary: '아이보리 톤 유로폼 노출면의 곰보와 색상 이질감을 해소했습니다.',
    problem: '유로폼 노출면에 곰보가 다수 발생하고 부분별 색 차이가 컸습니다.',
    method: '결함 충전 후 아이보리 톤에 맞춘 색상 조색, 폼타이 자국까지 동일 간격으로 재현.',
    result: '보수 부위를 특정하기 어려울 정도로 전체 면이 균일해졌습니다.',
    thumbnail: 'assets/images/projects/sincheon-ivory-thumb.jpg',
    after: 'assets/images/projects/sincheon-ivory.jpg',
    before: '',
    images: [],
    featured: true
  },
  {
    id: 'jeju-kcg-office-001',
    title: '관할 청사 외벽 균열 보수 및 면 복원',
    location: '제주시',
    building: '공공청사',
    category: '균열보수',
    date: '2023-10',
    period: '',
    summary: '청사 외부 균열 주입 후 노출콘크리트 외벽 면을 복원했습니다.',
    problem: '외벽 균열과 함께 부분 탈락이 확인되었습니다.',
    method: '균열 인젝션 후 단면복구, 주변 면과 동일한 질감으로 마감.',
    result: '구조 보강과 외관 복원을 한 번의 공정으로 정리했습니다.',
    thumbnail: 'assets/images/projects/kcg-repair-thumb.jpg',
    after: 'assets/images/projects/kcg-repair.jpg',
    before: '',
    images: [],
    featured: true
  },
  {
    id: 'jisan-lightgray-001',
    title: '지산 라이트그레이 노출콘크리트 복원공사',
    location: '경기',
    building: '근린생활시설',
    category: '노출콘크리트',
    date: '2024-03',
    period: '',
    summary: '라이트그레이 톤 노출콘크리트 면보수 및 미적 복원.',
    problem: '기존 보수 이력으로 색상이 얼룩덜룩하게 남아 있었습니다.',
    method: '전면 톤 조정 후 라이트그레이 색상 재현, 표면 보호 마감.',
    result: '단일 톤으로 정리되어 노출콘크리트 본래의 인상을 회복했습니다.',
    thumbnail: 'assets/images/projects/jisan-lightgray-thumb.jpg',
    after: 'assets/images/projects/jisan-lightgray.jpg',
    before: '',
    images: [],
    featured: false
  },

  /* ── 이하 시공 기록 (Before/After 보유) ───────────────────── */
  {
    id: 'jeju-surface-001', title: '제주 노출콘크리트 면보수 기록 #1', location: '제주', building: '', category: '노출콘크리트',
    date: '2025-08', period: '', summary: '표면 곰보·기포 충전 후 색상과 질감을 재현한 면보수 기록입니다.',
    problem: '표면 곰보와 기포가 넓게 분포했습니다.', method: '결함 충전 후 주변 면과 동일한 톤으로 질감 재현.', result: '보수 경계가 드러나지 않도록 정리했습니다.',
    thumbnail: 'assets/images/projects/1-1-thumb.jpg', after: 'assets/images/projects/1-1.jpg', before: 'assets/images/projects/1-2.jpg', images: [], featured: false
  },
  {
    id: 'jeju-surface-002', title: '제주 노출콘크리트 면보수 기록 #2', location: '제주', building: '', category: '노출콘크리트',
    date: '2025-07', period: '', summary: '층조인트 라인을 정리하고 단차를 보정한 면보수 기록입니다.',
    problem: '층조인트 단차와 라인 흐트러짐이 있었습니다.', method: '단차 연마 후 조인트 라인 재설정, 색상 조정.', result: '수평 라인이 일정하게 정리되었습니다.',
    thumbnail: 'assets/images/projects/2-1-thumb.jpg', after: 'assets/images/projects/2-1.jpg', before: 'assets/images/projects/2-2.jpg', images: [], featured: false
  },
  {
    id: 'jeju-surface-003', title: '제주 노출콘크리트 면보수 기록 #3', location: '제주', building: '', category: '노출콘크리트',
    date: '2025-05', period: '', summary: '부분 탈락면을 복구하고 전체 톤을 맞춘 기록입니다.',
    problem: '부분 탈락과 오염으로 면이 고르지 않았습니다.', method: '탈락부 단면복구 후 전면 색상 조정.', result: '전체 면이 균일한 톤으로 정리되었습니다.',
    thumbnail: 'assets/images/projects/3-1-thumb.jpg', after: 'assets/images/projects/3-1.jpg', before: 'assets/images/projects/3-2.jpg', images: [], featured: false
  },
  {
    id: 'jeju-crack-004', title: '제주 콘크리트 균열보수 기록 #4', location: '제주', building: '', category: '균열보수',
    date: '2025-04', period: '', summary: '균열부 충전 후 표면을 복원한 균열보수 기록입니다.',
    problem: '균열을 따라 오염과 누수 흔적이 있었습니다.', method: 'V컷 충전 및 주입 후 표면 마감.', result: '균열선이 노출되지 않도록 마감했습니다.',
    thumbnail: 'assets/images/projects/4-1-thumb.jpg', after: 'assets/images/projects/4-1.jpg', before: 'assets/images/projects/4-2.jpg', images: [], featured: false
  },
  {
    id: 'jeju-injection-005', title: '제주 인젝션 특수방수 기록 #5', location: '제주', building: '', category: '인젝션',
    date: '2025-03', period: '', summary: '균열 주입으로 누수를 차단한 인젝션 기록입니다.',
    problem: '균열을 따라 지속적인 누수가 있었습니다.', method: '패커 설치 후 우레탄 인젝션 주입.', result: '주입 후 누수가 멈춘 것을 확인했습니다.',
    thumbnail: 'assets/images/projects/5-1-thumb.jpg', after: 'assets/images/projects/5-1.jpg', before: 'assets/images/projects/5-2.jpg', images: [], featured: false
  },
  {
    id: 'jeju-surface-006', title: '제주 노출콘크리트 면보수 기록 #6', location: '제주', building: '', category: '노출콘크리트',
    date: '2025-02', period: '', summary: '외벽 전면 면보수 및 발수 처리 기록입니다.',
    problem: '표면 오염과 백화가 진행되었습니다.', method: '세정 후 결함 보수, 발수제 도포.', result: '오염 재부착을 늦추는 표면 상태로 정리했습니다.',
    thumbnail: 'assets/images/projects/6-1-thumb.jpg', after: 'assets/images/projects/6-1.jpg', before: 'assets/images/projects/6-2.jpg', images: [], featured: false
  },
  {
    id: 'jeju-crack-007', title: '제주 콘크리트 균열보수 기록 #7', location: '제주', building: '', category: '균열보수',
    date: '2024-12', period: '', summary: '구조부 균열 보수 및 마감 복원 기록입니다.',
    problem: '균열 폭이 넓어 우수 침투가 우려되었습니다.', method: '균열 조사 후 주입·충전, 단면 정리.', result: '침투 경로를 차단하고 외관을 복원했습니다.',
    thumbnail: 'assets/images/projects/7-1-thumb.jpg', after: 'assets/images/projects/7-1.jpg', before: 'assets/images/projects/7-2.jpg', images: [], featured: false
  },

  /* ── 시공 기록 (완료 사진) ───────────────────────────────── */
  { id: 'jeju-surface-008', title: '제주 노출콘크리트 면보수 기록 #8', location: '제주', building: '', category: '노출콘크리트', date: '2024-11', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/8-1-thumb.jpg', after: 'assets/images/projects/8-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-009', title: '제주 노출콘크리트 면보수 기록 #9', location: '제주', building: '', category: '노출콘크리트', date: '2024-10', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/9-1-thumb.jpg', after: 'assets/images/projects/9-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-010', title: '제주 노출콘크리트 면보수 기록 #10', location: '제주', building: '', category: '노출콘크리트', date: '2024-09', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/10-1-thumb.jpg', after: 'assets/images/projects/10-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-011', title: '제주 노출콘크리트 면보수 기록 #11', location: '제주', building: '', category: '노출콘크리트', date: '2024-08', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/11-1-thumb.jpg', after: 'assets/images/projects/11-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-012', title: '제주 노출콘크리트 면보수 기록 #12', location: '제주', building: '', category: '노출콘크리트', date: '2024-07', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/12-1-thumb.jpg', after: 'assets/images/projects/12-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-013', title: '제주 노출콘크리트 면보수 기록 #13', location: '제주', building: '', category: '노출콘크리트', date: '2024-06', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/13-1-thumb.jpg', after: 'assets/images/projects/13-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-014', title: '제주 노출콘크리트 면보수 기록 #14', location: '제주', building: '', category: '노출콘크리트', date: '2024-05', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/14-1-thumb.jpg', after: 'assets/images/projects/14-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-surface-015', title: '제주 노출콘크리트 면보수 기록 #15', location: '제주', building: '', category: '노출콘크리트', date: '2024-04', period: '', summary: '노출콘크리트 외벽 면보수 완료 기록입니다.', problem: '', method: '결함 충전 후 색상·질감 재현.', result: '', thumbnail: 'assets/images/projects/15-1-thumb.jpg', after: 'assets/images/projects/15-1.jpg', before: '', images: [], featured: false },

  { id: 'jeju-crack-016', title: '제주 콘크리트 균열보수 기록 #16', location: '제주', building: '', category: '균열보수', date: '2024-03', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/16-1-thumb.jpg', after: 'assets/images/projects/16-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-017', title: '제주 콘크리트 균열보수 기록 #17', location: '제주', building: '', category: '균열보수', date: '2024-02', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/17-1-thumb.jpg', after: 'assets/images/projects/17-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-018', title: '제주 콘크리트 균열보수 기록 #18', location: '제주', building: '', category: '균열보수', date: '2024-01', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/18-1-thumb.jpg', after: 'assets/images/projects/18-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-019', title: '제주 콘크리트 균열보수 기록 #19', location: '제주', building: '', category: '균열보수', date: '2023-12', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/19-1-thumb.jpg', after: 'assets/images/projects/19-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-020', title: '제주 콘크리트 균열보수 기록 #20', location: '제주', building: '', category: '균열보수', date: '2023-11', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/20-1-thumb.jpg', after: 'assets/images/projects/20-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-021', title: '제주 콘크리트 균열보수 기록 #21', location: '제주', building: '', category: '균열보수', date: '2023-10', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/21-1-thumb.jpg', after: 'assets/images/projects/21-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-022', title: '제주 콘크리트 균열보수 기록 #22', location: '제주', building: '', category: '균열보수', date: '2023-09', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/22-1-thumb.jpg', after: 'assets/images/projects/22-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-crack-023', title: '제주 콘크리트 균열보수 기록 #23', location: '제주', building: '', category: '균열보수', date: '2023-08', period: '', summary: '콘크리트 균열 보수 완료 기록입니다.', problem: '', method: 'V컷 충전 및 주입 후 표면 마감.', result: '', thumbnail: 'assets/images/projects/23-1-thumb.jpg', after: 'assets/images/projects/23-1.jpg', before: '', images: [], featured: false },

  { id: 'jeju-injection-024', title: '제주 인젝션 특수방수 기록 #24', location: '제주', building: '', category: '인젝션', date: '2023-07', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/24-1-thumb.jpg', after: 'assets/images/projects/24-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-025', title: '제주 인젝션 특수방수 기록 #25', location: '제주', building: '', category: '인젝션', date: '2023-06', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/25-1-thumb.jpg', after: 'assets/images/projects/25-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-026', title: '제주 인젝션 특수방수 기록 #26', location: '제주', building: '', category: '인젝션', date: '2023-05', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/26-1-thumb.jpg', after: 'assets/images/projects/26-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-027', title: '제주 인젝션 특수방수 기록 #27', location: '제주', building: '', category: '인젝션', date: '2023-04', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/27-1-thumb.jpg', after: 'assets/images/projects/27-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-028', title: '제주 인젝션 특수방수 기록 #28', location: '제주', building: '', category: '인젝션', date: '2023-03', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/28-1-thumb.jpg', after: 'assets/images/projects/28-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-029', title: '제주 인젝션 특수방수 기록 #29', location: '제주', building: '', category: '인젝션', date: '2023-02', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/29-1-thumb.jpg', after: 'assets/images/projects/29-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-030', title: '제주 인젝션 특수방수 기록 #30', location: '제주', building: '', category: '인젝션', date: '2023-01', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/30-1-thumb.jpg', after: 'assets/images/projects/30-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-031', title: '제주 인젝션 특수방수 기록 #31', location: '제주', building: '', category: '인젝션', date: '2022-12', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/31-1-thumb.jpg', after: 'assets/images/projects/31-1.jpg', before: '', images: [], featured: false },
  { id: 'jeju-injection-032', title: '제주 인젝션 특수방수 기록 #32', location: '제주', building: '', category: '인젝션', date: '2022-11', period: '', summary: '누수 부위 인젝션 주입 완료 기록입니다.', problem: '', method: '패커 설치 후 우레탄 인젝션 주입.', result: '', thumbnail: 'assets/images/projects/32-1-thumb.jpg', after: 'assets/images/projects/32-1.jpg', before: '', images: [], featured: false }
];
