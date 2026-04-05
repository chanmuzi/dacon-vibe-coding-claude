import type {
  Hackathon, Team, Submission, Leaderboard, RankingEntry,
  CommunityPost, Badge, DailyMission, Message, UserProfile,
} from '@/types';

export const SEED_VERSION = 9;

export const seedHackathons: Hackathon[] = [
  {
    slug: 'ai-image-generation',
    title: 'AI 이미지 생성 챌린지',
    description: '최신 생성형 AI 모델을 활용하여 주어진 프롬프트에 가장 적합한 고품질 이미지를 생성하는 대회입니다. CLIP Score와 FID를 기반으로 자동 채점됩니다.',
    organizer: '삼성전자',
    color: '#2563EB',
    type: 'quantitative',
    status: 'active',
    tags: ['AI', '이미지 생성', 'Diffusion', 'Computer Vision'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    startDate: '2026-03-20',
    endDate: '2026-04-30',
    resultDate: '2026-05-10',
    prizes: [
      { rank: 1, label: '1등', amount: '500만원' },
      { rank: 2, label: '2등', amount: '300만원' },
      { rank: 3, label: '3등', amount: '100만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 4 },
    participantCount: 342,
    metrics: ['CLIP Score', 'FID'],
    evaluationCriteria: [
      { name: 'CLIP Score', weight: 70, description: '생성 이미지와 프롬프트 간의 의미적 유사도 (0~100, 높을수록 좋음)', examples: ['프롬프트의 핵심 키워드가 이미지에 정확히 반영됨', '구도, 색감, 오브젝트 배치가 프롬프트 의도와 일치'] },
      { name: 'FID', weight: 30, description: '생성 이미지의 품질과 다양성 (0~100 역스케일, 낮을수록 좋음)', examples: ['자연스러운 질감과 디테일이 실제 이미지 수준', '생성 이미지 간 충분한 다양성 확보'] },
    ],
    rules: [
      '하루 최대 10회 제출 가능(매일 자정 리셋)',
      '제출 이미지는 반드시 PNG 형식, 512x512 또는 768x768 해상도',
      '기학습 모델(Stable Diffusion, DALL-E 3 등) 사용 가능, 단 상업 라이선스 확인 필수',
      '대회 시작 전 공개된 공개 데이터만 학습 데이터로 사용 가능',
      '대회 프롬프트셋과 평가셋은 대회 기간 중 외부 공개 금지',
      '프롬프트 엔지니어링 및 모델 파인튜닝 허용, 단 대회 데이터셋으로만 가능',
      '부정행위(점수 조작, 타인 작품 도용 등) 적발 시 즉시 실격 및 상금 몰수',
    ],
    faq: [
      { question: 'CLIP Score와 FID 점수는 어떻게 계산되나요?', answer: 'CLIP Score는 생성 이미지와 프롬프트 간의 의미적 유사도를, FID는 생성 이미지의 실제성과 다양성을 측정합니다. 최종 점수는 CLIP 70% + FID 30%로 가중 평균합니다.' },
      { question: '한 번에 몇 개 이미지까지 제출할 수 있나요?', answer: '하루에 최대 10회 제출 가능합니다. 각 제출마다 평가셋의 전체 프롬프트에 대해 이미지를 생성해야 합니다.' },
      { question: '이전 대회의 생성 데이터셋을 학습 데이터로 사용해도 되나요?', answer: '불가능합니다. 대회 시작 전 공개된 공개 데이터만 사용 가능하며, 대회 프롬프트나 평가셋은 외부 학습에 사용할 수 없습니다.' },
      { question: 'GPU 자원이 부족합니다. 클라우드 리소스를 사용해도 되나요?', answer: '네, AWS, Google Cloud, Azure 등 모든 상용 클라우드 GPU 서비스 사용 가능합니다.' },
    ],
    prizeNote: '상금은 제세공과금(22%) 공제 후 지급됩니다. 결과 발표일로부터 10영업일 내 계좌이체됩니다. 부정행위 적발 시 상금 지급이 취소되며, 팀 참가 시 대표자 명의로 지급됩니다.',
    submissionFormat: {
      type: 'csv',
      columns: ['image_id', 'prompt', 'generated_url'],
      maxRows: 100,
      maxFileSize: 50000,
      description: '생성한 이미지와 프롬프트를 CSV로 제출합니다. 각 행은 image_id(고유값), 프롬프트, 생성 이미지 URL을 포함해야 합니다.',
      sampleContent: 'image_id,prompt,generated_url\nimg_001,"a cat sitting on a chair",output/img_001.png\nimg_002,"sunset over mountains",output/img_002.png\nimg_003,"futuristic city skyline",output/img_003.png',
    },
    notices: [
      { id: 'n1', title: '데이터셋 v2 업데이트', content: '평가용 프롬프트 세트가 업데이트되었습니다. 기존 제출물은 재채점됩니다.', pinned: true, createdAt: '2026-03-20', category: 'update' },
      { id: 'n2', title: '제출 형식 안내', content: 'PNG 형식, 512x512 해상도로 제출해주세요.', pinned: false, createdAt: '2026-03-16', category: 'rule' },
      { id: 'n1-1', title: '외부 모델 사용 안내', content: 'Stable Diffusion, DALL-E 3, Midjourney 등 기학습 모델 사용 가능합니다. 단, 상업 라이선스 확인 후 사용하세요.', pinned: false, createdAt: '2026-03-22', category: 'rule' },
      { id: 'n1-2', title: '채점 시간 및 재평가 안내', content: '제출 후 채점은 24시간 이내 완료됩니다. CLIP Score와 FID 점수는 실시간으로 리더보드에 반영됩니다.', pinned: false, createdAt: '2026-03-25', category: 'update' },
      { id: 'n1-3', title: '프롬프트 공개 및 추가 평가셋', content: '4월 1일부터 중간 평가셋(추가 50개 프롬프트)이 공개됩니다.', pinned: false, createdAt: '2026-03-28', category: 'announcement' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-03-15', done: true },
      { label: '중간 평가', date: '2026-03-30', done: false },
      { label: '제출 마감', date: '2026-04-15', done: false },
      { label: '결과 발표', date: '2026-04-20', done: false },
    ],
  },
  {
    slug: 'vibe-coding-challenge',
    title: '바이브 코딩 대회 2026',
    description: 'AI 도구를 활용한 창의적 웹서비스 개발 대회입니다. 아이디어의 독창성, 구현 완성도, UI/UX 품질을 심사위원이 종합 평가합니다.',
    organizer: 'DACLAW 🦞',
    color: '#7C3AED',
    type: 'qualitative',
    status: 'active',
    tags: ['웹개발', 'AI', '바이브코딩', 'UI/UX'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
    startDate: '2026-03-10',
    endDate: '2026-04-24',
    resultDate: '2026-05-10',
    prizes: [
      { rank: 1, label: '대상', amount: '1000만원' },
      { rank: 2, label: '최우수상', amount: '500만원' },
      { rank: 3, label: '우수상', amount: '200만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 5 },
    participantCount: 567,
    evaluationCriteria: [
      {
        name: '기본 구현',
        weight: 30,
        description: '필수 기능 구현 및 데이터 기반 렌더링',
        examples: [
          'CRUD 기능(생성, 조회, 수정, 삭제)이 모두 정상 작동하며, 데이터베이스에서 불러온 데이터가 웹페이지에 올바르게 렌더링됨',
          '사용자 입력 양식이 유효성 검사를 수행하고, 성공/실패 상태를 명확하게 피드백함',
          'API 연동이 안정적으로 작동하며 네트워크 오류 시 사용자 친화적인 에러 메시지 표시',
        ],
      },
      {
        name: '확장/아이디어',
        weight: 30,
        description: '차별화된 기능과 창의적 아이디어',
        examples: [
          '사용자 선호도 기반 AI 추천 시스템(Zustand 상태관리 + 알고리즘)을 구현하여 개인화 기능 제공',
          '실시간 협업 기능(다중 사용자 동시 편집) 또는 공유 대시보드 제공',
          '소셜 기능(북마크, 좋아요, 댓글) 추가로 커뮤니티 활성화',
        ],
      },
      {
        name: '완성도',
        weight: 25,
        description: 'UI/UX 품질, 안정성, 성능',
        examples: [
          '모바일(320px~480px), 태블릿(768px~1024px), 데스크톱(1200px 이상) 모두에서 반응형 디자인이 완벽히 작동',
          '로딩 중 스켈레톤 UI, 에러 상태, 빈 상태(Empty State)가 모두 처리되어 있음',
          '버튼, 폼, 네비게이션 등 모든 인터랙션 요소에 시각적 피드백(active:scale, hover 효과) 적용',
        ],
      },
      {
        name: '문서',
        weight: 15,
        description: 'README, 코드 구조 설명',
        examples: [
          'README에 프로젝트 목표, 기술 스택, 폴더 구조, 설치 및 실행 명령어가 명확히 작성되어 있음',
          '아키텍처 다이어그램(컴포넌트 관계, 상태 흐름)이 포함되어 있고, 주요 함수/컴포넌트에 JSDoc 주석이 작성됨',
          '배포 방법(Vercel), 환경 변수 설정 가이드, 기여 가이드라인이 제시됨',
        ],
      },
    ],
    rules: [
      '팀 구성: 1~5명, 개인 참가 가능',
      '웹링크 제출(4/6)은 배포 가능한 상태여야 함(localhost 불가)',
      'PDF 제출(4/13): README.md, 아키텍처, 개발 일지, AI 도구 사용 현황 포함',
      'Git commit history에 모든 팀원의 이름과 기여 내역 명시 필수',
      '오픈소스 라이선스 표기 및 외부 템플릿 사용 시 출처 명시 필수',
      'AI 도구 활용(ChatGPT, Claude, Copilot 등)을 README에 투명하게 공개',
    ],
    faq: [
      { question: '평가 기준 100점 중에 각 항목별 구체적인 채점 방식이 있나요?', answer: '기본구현(30점): 필수 페이지·기능 완성도 | 확장/아이디어(30점): 추가 기능의 참신성과 실용성 | 완성도(25점): UI/UX 일관성, 성능, 버그 없음 | 문서(15점): README, 코드 주석, 아키텍처 설명.' },
      { question: '외부 템플릿이나 오픈소스 프레임워크를 기반으로 개발해도 되나요?', answer: '네, 가능합니다. 단 README에 기반한 프레임워크/템플릿을 명시하고, 본인의 창의적 추가·수정 부분을 명확히 구분해야 합니다.' },
      { question: '결과 발표 후 심사 이의를 제기할 수 있나요?', answer: '네, 발표일로부터 5일 내에 공식 이메일로 이의 신청이 가능합니다.' },
      { question: '대회 중간에 팀원이 탈퇴하면 어떻게 되나요?', answer: '최대 3명까지만 변경 가능합니다(4월 1일까지). 그 이후 팀원 변경은 운영진 승인이 필요합니다.' },
    ],
    prizeNote: '상금은 제세공과금(22%) 공제 후 지급됩니다. 팀 참가 시 대표자에게 일괄 지급되며, 팀 내 분배는 팀원 간 협의합니다. 부정행위 적발(코드 도용, 타인 작품 표절 등) 시 상금 몰수 및 차기 대회 참가 제한됩니다.',
    submissionFormat: {
      type: 'markdown',
      minChars: 500,
      maxChars: 10000,
      description: '프로젝트 기획서 및 개발 보고서를 마크다운 형식으로 작성하여 제출합니다. 프로젝트 개요, 핵심 기능, 기술 스택, 시연 링크, 개선 계획 등을 포함하세요.',
      sampleContent: '# 바이브 코딩 프로젝트: [프로젝트명]\n\n## 1. 프로젝트 개요\n\n이 프로젝트는 [프로젝트의 목적 및 문제 해결 방향을 200자 이상 작성]\n\n## 2. 핵심 기능\n\n- 기능 1: [기능 설명]\n- 기능 2: [기능 설명]\n- 기능 3: [기능 설명]\n\n## 3. 기술 스택\n\n**Frontend**: Next.js 16, TypeScript, Tailwind CSS\n**Backend**: [사용한 백엔드 기술]\n**Deploy**: Vercel / [배포 플랫폼]\n\n## 4. 아키텍처\n\n[파일 구조, 컴포넌트 관계도 등 설명]\n\n## 5. 시연 링크\n\n- 웹사이트: [배포된 웹사이트 URL]\n- GitHub: [소스코드 리포지토리 URL]\n\n## 6. 개선 계획\n\n향후 추가할 기능이나 개선 사항:\n- [개선사항 1]\n- [개선사항 2]',
    },
    notices: [
      { id: 'n3', title: '심사 기준 상세 안내', content: '기본 구현(30점) + 확장/아이디어(30점) + 완성도(25점) + 문서(15점) = 100점 만점입니다.', pinned: true, createdAt: '2026-03-12', category: 'announcement' },
      { id: 'n2-1', title: '심사 자료 제출 안내', content: '웹링크 제출(4/24) 후 추가로 PDF(5/1)를 제출해야 합니다. 모든 심사위원이 접근 가능하도록 링크는 공개 상태여야 합니다.', pinned: false, createdAt: '2026-03-18', category: 'rule' },
      { id: 'n2-2', title: 'AI 도구 활용 사항 공개 요청', content: 'README에 사용한 AI 도구, 활용 범위, 최종 코드 기여도를 명시해주세요. 투명성은 평가의 중요 요소입니다.', pinned: false, createdAt: '2026-03-20', category: 'rule' },
      { id: 'n2-3', title: '모바일 반응형 디자인 평가 기준', content: '완성도(25점) 평가에서 모바일·태블릿·데스크톱 반응형 지원이 포함됩니다.', pinned: false, createdAt: '2026-03-28', category: 'update' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-03-10', done: true },
      { label: '중간 발표', date: '2026-03-25', done: true },
      { label: '웹링크 제출', date: '2026-04-24', done: false },
      { label: 'PDF 제출', date: '2026-05-01', done: false },
      { label: '결과 발표', date: '2026-05-10', done: false },
    ],
  },
  {
    slug: 'data-science-hackathon',
    title: '데이터 사이언스 인수인계 해커톤',
    description: '데이터 분석과 모델 성능(자동 채점) + 분석 보고서 품질(심사위원 평가)을 종합하여 평가하는 혼합형 대회입니다.',
    organizer: '네이버',
    color: '#059669',
    type: 'hybrid',
    status: 'active',
    tags: ['데이터 분석', 'ML', '보고서', '인수인계'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    startDate: '2026-04-10',
    endDate: '2026-05-10',
    resultDate: '2026-05-20',
    prizes: [
      { rank: 1, label: '1등', amount: '300만원' },
      { rank: 2, label: '2등', amount: '150만원' },
      { rank: 3, label: '3등', amount: '50만원' },
    ],
    teamPolicy: { solo: false, maxMembers: 3 },
    participantCount: 189,
    metrics: ['RMSE', 'R²'],
    evaluationCriteria: [
      {
        name: '모델 성능',
        weight: 50,
        description: 'RMSE 기반 자동 채점',
        examples: [
          'RMSE 값이 0.15 이하로 유지되면서, 테스트 셋에서 학습 셋과 유사한 수준의 성능 달성(과적합 없음)',
          'feature engineering을 통해 예측력 있는 새로운 변수를 생성하고, 모델 해석 가능성 제공',
          '앙상블 기법(Random Forest + XGBoost 조합) 또는 스태킹을 활용하여 성능 극대화',
        ],
      },
      {
        name: '분석 보고서',
        weight: 30,
        description: '데이터 인사이트와 논리적 구성',
        examples: [
          'EDA에서 데이터 분포, 결측치, 이상치를 시각화로 명확히 설명하고, 데이터 전처리 단계와 근거 제시',
          '모델 선택 이유와 하이퍼파라미터 튜닝 과정을 상세히 기록하여 재현 가능성 확보',
          'Feature Importance 분석으로 어떤 변수가 예측에 가장 영향을 미치는지 비즈니스 관점으로 해석',
        ],
      },
      {
        name: '코드 품질',
        weight: 20,
        description: '재현 가능성과 문서화',
        examples: [
          'Jupyter Notebook이나 Python 스크립트가 모듈화되어 있고, 주석과 함수 설명(docstring)이 충실함',
          '데이터 전처리, 모델 학습, 평가 코드가 분리되어 단계별로 실행 가능',
          'requirements.txt가 제공되어 다른 환경에서도 동일한 결과 재현 가능',
        ],
      },
    ],
    rules: [
      '팀 구성: 1~3명(최대 3인)',
      'train.csv로 모델 학습, test.csv로 성능 평가(자동 채점)',
      '제공 데이터셋 외 외부 데이터 사용 시 보고서에 명시 필수',
      '분석 보고서: PDF 형식, 10~30페이지, EDA부터 결론까지 포함',
      '모든 코드는 Python 또는 R로 작성(머신러닝 라이브러리 자유)',
      'requirements.txt 또는 environment.yml 필수 제출(재현 환경 명시)',
    ],
    faq: [
      { question: 'train.csv로 학습하고 test.csv로 평가하나요?', answer: '네. train.csv(700개 샘플)로 모델을 학습하고, test.csv(300개 샘플)에 대한 RMSE를 자동 계산합니다.' },
      { question: 'RMSE 점수가 높으면(나쁘면) 보고서 품질로 따라잡을 수 있나요?', answer: '일부 가능합니다. 탁월한 인사이트와 명확한 재현성이 있으면 높은 총점을 받을 수 있습니다.' },
      { question: '앙상블이나 스태킹 모델은 하나의 모델로 취급되나요?', answer: '네, 최종 제출 모델이 앙상블이든 단일 모델이든 상관없습니다. 보고서에서 모델 구성을 명확히 설명하면 됩니다.' },
    ],
    prizeNote: '상금은 제세공과금(22%) 공제 후 지급됩니다. 팀 참가 시 대표자에게 일괄 지급되며, 팀 내 분배는 팀원 간 협의합니다.',
    submissionFormat: {
      type: 'csv',
      columns: ['id', 'predicted_value'],
      maxRows: 5000,
      maxFileSize: 10000,
      description: '모델의 예측값을 CSV 형식으로 제출합니다. 각 행은 데이터 ID와 예측값(실수값)을 포함합니다. RMSE와 R² 메트릭으로 자동 평가됩니다.',
      sampleContent: 'id,predicted_value\n1,45.32\n2,67.89\n3,52.14\n4,71.05\n5,48.76',
    },
    notices: [
      { id: 'n4', title: '데이터셋 공개', content: 'train.csv와 test.csv가 공개되었습니다. 다운로드 후 분석을 시작하세요.', pinned: true, createdAt: '2026-04-10', category: 'announcement' },
      { id: 'n3-1', title: '하이브리드 평가 방식 상세 안내', content: '모델 성능(RMSE, 자동 채점 50%)과 분석 보고서(심사위원 평가 30%) + 코드 품질(20%)로 평가됩니다.', pinned: false, createdAt: '2026-04-08', category: 'rule' },
      { id: 'n3-2', title: '외부 데이터 사용 가능 범위', content: '대회 시작 전 공개된 공개 데이터셋은 보조 정보로 사용 가능하나, 최종 모델 학습은 제공 train.csv로만 해야 합니다.', pinned: false, createdAt: '2026-04-12', category: 'rule' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-04-10', done: false },
      { label: '제출 마감', date: '2026-05-10', done: false },
      { label: '결과 발표', date: '2026-05-20', done: false },
    ],
  },
  {
    slug: 'nlp-sentiment-analysis',
    title: 'NLP 감성 분석 챌린지',
    description: '한국어 리뷰 데이터의 감성을 분류하는 NLP 모델 대회입니다. Macro F1 Score로 자동 평가됩니다.',
    organizer: 'LG AI Research',
    color: '#DC2626',
    type: 'quantitative',
    status: 'upcoming',
    tags: ['NLP', '감성 분석', '한국어', 'Transformer'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop',
    startDate: '2026-04-20',
    endDate: '2026-05-20',
    resultDate: '2026-05-30',
    prizes: [
      { rank: 1, label: '1등', amount: '200만원' },
      { rank: 2, label: '2등', amount: '100만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 3 },
    participantCount: 0,
    metrics: ['Macro F1'],
    evaluationCriteria: [
      { name: 'Macro F1 Score', weight: 100, description: '긍정/부정 각 클래스의 F1 Score 평균 (0~1, 높을수록 좋음)', examples: ['클래스 불균형에도 양쪽 모두 높은 재현율 달성', 'Precision과 Recall의 균형 잡힌 모델'] },
    ],
    rules: [
      '개인 또는 팀(최대 3명) 참가 가능',
      'train.csv로 모델 학습, test.csv에 대해 Macro F1 Score 자동 채점',
      '사전학습 모델(KcBERT, KoELECTRA 등) 파인튜닝 허용',
      '외부 리뷰 데이터 사용 불가(대회 시작 전 공개된 공개 데이터만 허용)',
      '하루 최대 5회 제출 가능',
      '제출 형식: CSV(text_id, sentiment_label 컬럼 필수)',
    ],
    faq: [
      { question: 'Macro F1 Score는 어떻게 계산되나요?', answer: '긍정과 부정 각각의 F1 Score를 계산한 후 평균을 냅니다. 클래스 불균형 환경에서 모델의 전체적인 성능을 공정하게 평가합니다.' },
      { question: '사전학습 모델을 파인튜닝할 때 몇 epoch을 돌아야 하나요?', answer: '고정된 기준은 없습니다. 검증 데이터의 F1 Score가 수렴할 때까지 학습하면 됩니다.' },
      { question: '여러 모델의 예측을 앙상블하면 점수가 올라가나요?', answer: '보통 올라갑니다. 다양한 아키텍처를 결합하면 F1 Score가 개선되는 경향이 있습니다.' },
    ],
    prizeNote: '상금은 제세공과금(22%) 공제 후 지급됩니다. 팀 참가 시 대표자에게 지급되며 팀 내 분배는 팀원 간 협의합니다.',
    submissionFormat: {
      type: 'csv',
      columns: ['text_id', 'sentiment_label', 'confidence'],
      maxRows: 10000,
      maxFileSize: 20000,
      description: '리뷰 텍스트의 감성 분류 결과를 CSV로 제출합니다. 각 행은 text_id, 감성 레이블(positive/negative/neutral), 신뢰도 점수(0~1)를 포함합니다.',
      sampleContent: 'text_id,sentiment_label,confidence\ntext_001,positive,0.95\ntext_002,negative,0.87\ntext_003,neutral,0.72\ntext_004,positive,0.91\ntext_005,negative,0.88',
    },
    notices: [
      { id: 'n4-1', title: '대회 개요 및 데이터셋 설명', content: '한국어 상품 리뷰의 감성을 긍정/부정으로 분류하는 과제입니다. 데이터셋은 4월 20일 공개됩니다.', pinned: true, createdAt: '2026-04-15', category: 'announcement' },
      { id: 'n4-2', title: '사전학습 모델 사용 안내', content: 'KcBERT, KoELECTRA, KLUE-BERT 등 한국어 사전학습 모델 사용 가능합니다.', pinned: false, createdAt: '2026-04-16', category: 'rule' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-04-20', done: false },
      { label: '제출 마감', date: '2026-05-20', done: false },
      { label: '결과 발표', date: '2026-05-30', done: false },
    ],
  },
  {
    slug: 'creative-ai-art',
    title: 'Creative AI 아트 공모전',
    description: 'AI를 활용한 예술 작품 공모전입니다. 심사위원단이 예술성, 기술 활용도, 독창성을 종합 평가합니다.',
    organizer: 'DACLAW 🦞',
    color: '#EC4899',
    type: 'qualitative',
    status: 'ended',
    tags: ['AI 아트', '생성형 AI', '예술', '창작'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=400&fit=crop',
    startDate: '2026-02-01',
    endDate: '2026-03-01',
    resultDate: '2026-03-15',
    prizes: [
      { rank: 1, label: '대상', amount: '300만원' },
      { rank: 2, label: '우수상', amount: '100만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 2 },
    participantCount: 421,
    evaluationCriteria: [
      {
        name: '예술성',
        weight: 40,
        description: '작품의 미적 완성도',
        examples: [
          '작품의 색감, 구도, 질감이 미학적으로 통일되어 있고, 시각적 임팩트가 강함',
          '전체 작품이 명확한 시각적 계층 구조를 가지고 있어 관람자의 시선 흐름이 자연스러움',
          '작품 속 요소들이 조화를 이루면서도 개성 있는 표현으로 매력적인 분위기 조성',
        ],
      },
      {
        name: 'AI 활용도',
        weight: 35,
        description: 'AI 도구 활용의 독창성',
        examples: [
          'Stable Diffusion의 다양한 모델(realistic, artistic, anime 등)을 비교하여 가장 효과적인 것을 선택 및 활용',
          '프롬프트 엔지니어링(음수 프롬프트, 가중치 조절, 시드 값 고정)으로 의도한 결과를 정교하게 도출',
          '여러 AI 도구 조합(생성 + 초고해상도화 + 스타일 변환)으로 창의적인 작업 프로세스 구축',
        ],
      },
      {
        name: '독창성',
        weight: 25,
        description: '컨셉의 참신함',
        examples: [
          '기존 AI 아트 공모전 수상작들과 차별되는 새로운 주제나 표현 방식 제시',
          '문화, 사회, 과학 등 깊이 있는 개념을 AI와 결합하여 메시지 전달',
          '여러 예술 장르(회화, 사진, 일러스트)의 특징을 AI로 창의적으로 혼합',
        ],
      },
    ],
    rules: [
      '개인 또는 2인 팀 참가 가능',
      'AI 도구를 활용한 예술 작품만 제출(최소 50% AI 생성)',
      '수작업 후처리 최대 30% 허용(모든 수정 사항 명시 필수)',
      '저작권 침해 및 기존 유명 작품 직접 모방 금지',
      '작가 노트 필수(A4 1~2페이지, 제작 의도·AI 도구·프롬프트 포함)',
      '제출 형식: JPEG 또는 PNG, 1MB 이상, 최대 10MB',
    ],
    faq: [
      { question: '예술성, AI 활용도, 독창성은 각각 몇 점씩 배점되나요?', answer: '예술성(40점), AI 활용도(35점), 독창성(25점). 총 100점 만점입니다.' },
      { question: 'AI가 생성한 이미지만 제출해야 하나요?', answer: 'AI 생성 이미지의 후처리(색감 조정 등)는 최대 30% 범위 내에서 허용됩니다.' },
      { question: '여러 AI 도구를 조합하면 AI 활용도 점수가 올라가나요?', answer: '조합만으로는 아닙니다. 각 도구의 역할이 명확하고, 최종 결과물에서 창의적으로 통합되어야 합니다.' },
    ],
    prizeNote: '상금은 제세공과금(22%) 공제 후 지급됩니다. 상금 지급은 결과 발표일로부터 10영업일 내 이루어집니다.',
    submissionFormat: {
      type: 'markdown',
      minChars: 300,
      maxChars: 5000,
      description: 'AI 아트 작품의 개념, 제작 과정, AI 도구 활용 설명을 마크다운으로 작성합니다. 작품 이미지 링크와 함께 예술적 의도를 명확히 설명하세요.',
      sampleContent: '# AI 아트 작품: [작품명]\n\n## 작품 이미지\n\n![작품 이미지](image_url)\n\n## 1. 작품 개념\n\n이 작품은 [작품의 예술적 의도와 컨셉을 설명]\n\n## 2. 제작 과정\n\n1. 초기 아이디어: [아이디어 출처]\n2. AI 도구 선정: [사용한 AI 도구명, 예: Stable Diffusion, DALL-E 3]\n3. 생성 프롬프트: "[최종 사용 프롬프트]"\n4. 후처리: [이미지 보정, 추가 작업]\n\n## 3. AI 활용도\n\n[AI를 어떻게 창의적으로 활용했는지 설명]\n\n## 4. 메시지\n\n이 작품을 통해 전달하고 싶은 메시지: [메시지 설명]',
    },
    notices: [
      { id: 'n5', title: '수상작 발표', content: '심사가 완료되어 수상작을 발표합니다. 축하합니다!', pinned: true, createdAt: '2026-03-15', category: 'announcement' },
      { id: 'n5-1', title: '수상작 전시회 안내', content: '상위 10개 수상작이 4월 1일부터 DACLAW 갤러리 페이지에서 전시됩니다.', pinned: false, createdAt: '2026-03-16', category: 'announcement' },
      { id: 'n5-2', title: '수상자 인터뷰 및 후속 기회', content: '대상·최우수상 수상자를 대상으로 4월 8일 온라인 인터뷰를 진행합니다.', pinned: false, createdAt: '2026-03-18', category: 'announcement' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-02-01', done: true },
      { label: '제출 마감', date: '2026-03-01', done: true },
      { label: '결과 발표', date: '2026-03-15', done: true },
    ],
  },
  {
    slug: 'ml-model-optimization',
    title: 'ML 모델 경량화 챌린지',
    description: '주어진 모델을 최대한 경량화하면서 정확도를 유지하는 대회입니다. 모델 크기와 추론 속도를 종합 평가합니다.',
    organizer: '과학기술정보통신부',
    color: '#0891B2',
    type: 'quantitative',
    status: 'ended',
    tags: ['ML', '경량화', '최적화', 'Edge AI'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    resultDate: '2026-03-10',
    prizes: [
      { rank: 1, label: '1등', amount: '400만원' },
      { rank: 2, label: '2등', amount: '200만원' },
      { rank: 3, label: '3등', amount: '100만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 4 },
    participantCount: 256,
    metrics: ['Accuracy', 'Model Size (MB)', 'Latency (ms)'],
    evaluationCriteria: [
      {
        name: '정확도 유지',
        weight: 40,
        description: '원본 모델 대비 정확도 손실 최소화',
        examples: [
          '원본 모델 대비 정확도 손실을 3% 이내로 제한하면서, 모델 크기를 50% 이상 감소',
          '양자화(Quantization) 기법으로 Float32 → Int8 변환 시 정확도 저하 최소화',
          '지식 증류(Knowledge Distillation)를 통해 가벼운 student 모델이 teacher 모델의 성능을 근접하게 재현',
        ],
      },
      {
        name: '모델 크기 감소',
        weight: 30,
        description: '모델 파라미터 수 및 파일 크기 최소화',
        examples: [
          '프루닝(Pruning)으로 불필요한 뉴런/연결 제거하여 100MB → 20MB 이하로 경량화',
          '저랭크 분해(Low-Rank Decomposition)로 행렬 곱셈 연산량 감소',
          '네스트된 모델 아키텍처 설계(MobileNet, SqueezeNet 등 경량화 설계 활용)',
        ],
      },
      {
        name: '추론 속도 개선',
        weight: 30,
        description: '추론 레이턴시 감소',
        examples: [
          'INT8 양자화로 GPU/CPU 추론 속도 3~4배 향상',
          '배치 정규화 폴딩, 연속 연산 통합으로 레이턴시 30% 이상 감소',
          'TensorRT(NVIDIA) 또는 ONNX Runtime으로 최적화된 추론 엔진 구축',
        ],
      },
    ],
    rules: [
      '개인 또는 팀(최대 4명) 참가 가능',
      '제공된 base_model.pth를 경량화(입출력 스펙 유지 필수)',
      '양자화, 가지치기, 지식 증류, 저랭크 분해 등 모든 경량화 기법 허용',
      '최종 모델은 PyTorch 또는 TensorFlow 형식으로 제출',
      'Latency는 NVIDIA Tesla V100 GPU에서 측정(표준 환경)',
      '모든 경량화 과정과 하이퍼파라미터를 기술 보고서에 상세 기록',
    ],
    faq: [
      { question: 'Accuracy, Model Size, Latency는 어떻게 종합 평가되나요?', answer: '정규화된 점수로 각각 40%, 30%, 30% 가중치를 부여합니다.' },
      { question: '양자화와 가지치기를 동시에 적용하면 점수가 올라가나요?', answer: '일반적으로 올라갑니다. 다만 과도한 경량화는 정확도 손실로 이어질 수 있으므로, 세밀한 튜닝이 필요합니다.' },
      { question: 'TensorRT, ONNX Runtime 등 최적화 엔진 사용해도 되나요?', answer: '네, 가능합니다. 최종 제출 모델은 PyTorch 또는 TensorFlow 형식이어야 합니다.' },
    ],
    prizeNote: '상금은 제세공과금(22%) 공제 후 지급됩니다. 팀 참가 시 대표자에게 지급되며, 팀 내 분배는 팀원 간 협의합니다.',
    submissionFormat: {
      type: 'json',
      maxFileSize: 5000,
      description: '경량화된 모델의 성능 지표를 JSON 형식으로 제출합니다. 원본 모델과의 비교, 최적화 기법, 성능 메트릭을 포함해야 합니다.',
      sampleContent: '{"model_name": "optimized_resnet50", "original_accuracy": 0.925, "optimized_accuracy": 0.918, "original_size_mb": 102.4, "optimized_size_mb": 24.8, "original_latency_ms": 45.2, "optimized_latency_ms": 12.1, "optimization_techniques": ["quantization", "pruning", "knowledge_distillation"], "hardware_target": "ARM Cortex-A72"}',
    },
    notices: [
      { id: 'n6', title: '최종 결과 발표', content: '모든 심사가 완료되었습니다. 수상자 여러분 축하합니다!', pinned: true, createdAt: '2026-03-10', category: 'announcement' },
      { id: 'n6-1', title: '경량화 기법별 사용 현황 분석', content: '우수팀들의 사용 기법: 양자화(56%), 가지치기(44%), 지식 증류(28%). 복합 기법 사용 팀의 평균 순위가 더 높았습니다.', pinned: false, createdAt: '2026-03-11', category: 'update' },
      { id: 'n6-2', title: '대회 경험 공유 세션', content: '4월 15일 온라인 기술 세미나를 개최합니다. 상위 3팀의 경량화 노하우를 공유합니다.', pinned: false, createdAt: '2026-03-14', category: 'announcement' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-01-15', done: true },
      { label: '제출 마감', date: '2026-02-28', done: true },
      { label: '결과 발표', date: '2026-03-10', done: true },
    ],
  },
];

export const seedTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Alpha Creators',
    description: 'AI 이미지 생성에 열정적인 팀입니다. Stable Diffusion과 DALL-E 경험자 환영!',
    hackathonSlugs: ['ai-image-generation'],
    requirements: 'Diffusion 모델 경험자 우대',
    techStack: ['Python', 'PyTorch', 'Stable Diffusion'],
    teamScore: 425,
    hackathonCount: 1,
    submissionCount: 2,
    members: [
      { userId: 'user-2', nickname: '김데이터', role: 'data-scientist' },
      { userId: 'user-3', nickname: '이디자인', role: 'designer' },
    ],
    maxMembers: 4,
    recruitRoles: ['developer', 'data-scientist'],
    recruitStatus: 'open',
    createdAt: '2026-03-16',
  },
  {
    id: 'team-2',
    name: 'Vibe Builders',
    description: '바이브 코딩으로 멋진 웹서비스를 만들어봐요! React/Next.js 경험자 우대.',
    hackathonSlugs: ['vibe-coding-challenge'],
    requirements: '프론트엔드 경험 필수',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    teamScore: 310,
    hackathonCount: 1,
    submissionCount: 1,
    members: [
      { userId: 'user-4', nickname: '박프론트', role: 'developer' },
    ],
    maxMembers: 5,
    recruitRoles: ['developer', 'designer', 'planner'],
    recruitStatus: 'open',
    createdAt: '2026-03-11',
  },
  {
    id: 'team-3',
    name: 'Data Wizards',
    description: '데이터 사이언스 전문가 팀. Kaggle 경험자들이 모였습니다.',
    hackathonSlugs: ['data-science-hackathon'],
    requirements: '데이터 분석 경험 필수, Python 능숙자',
    techStack: ['Python', 'XGBoost', 'Pandas', 'Scikit-learn'],
    teamScore: 280,
    hackathonCount: 1,
    submissionCount: 1,
    members: [
      { userId: 'user-5', nickname: '최분석', role: 'data-scientist' },
      { userId: 'user-6', nickname: '정머신', role: 'data-scientist' },
    ],
    maxMembers: 3,
    recruitRoles: ['data-scientist'],
    recruitStatus: 'open',
    createdAt: '2026-03-21',
  },
  {
    id: 'team-4',
    name: 'NLP 마스터즈',
    description: 'NLP와 Transformer 모델에 관심 있는 분들을 찾습니다!',
    hackathonSlugs: ['nlp-sentiment-analysis'],
    requirements: 'NLP 관련 프로젝트 경험자',
    techStack: ['Python', 'Transformers', 'BERT', 'KoNLPy'],
    teamScore: 150,
    hackathonCount: 1,
    submissionCount: 0,
    members: [
      { userId: 'user-7', nickname: '한언어', role: 'data-scientist' },
    ],
    maxMembers: 3,
    recruitRoles: ['developer', 'data-scientist'],
    recruitStatus: 'open',
    createdAt: '2026-03-25',
  },
  {
    id: 'team-5',
    name: 'Creative Minds',
    description: '디자인과 기획이 강한 팀! 함께 대상을 노려봐요.',
    hackathonSlugs: ['vibe-coding-challenge', 'creative-ai-art'],
    techStack: ['React', 'Figma', 'AI Art Tools'],
    teamScore: 520,
    hackathonCount: 2,
    submissionCount: 2,
    members: [
      { userId: 'user-8', nickname: '오기획', role: 'planner' },
      { userId: 'user-9', nickname: '유예술', role: 'designer' },
      { userId: 'user-10', nickname: '강개발', role: 'developer' },
    ],
    maxMembers: 5,
    recruitRoles: ['developer'],
    recruitStatus: 'open',
    createdAt: '2026-03-12',
  },
  {
    id: 'team-6',
    name: 'Speed Coders',
    description: '빠르고 정확한 구현이 강점! 이미지 생성 파이프라인 구축 경험 있습니다.',
    hackathonSlugs: ['ai-image-generation'],
    techStack: ['Python', 'DALL-E', 'ComfyUI'],
    teamScore: 680,
    hackathonCount: 1,
    submissionCount: 2,
    members: [
      { userId: 'user-11', nickname: '윤스피드', role: 'developer' },
      { userId: 'user-12', nickname: '신코더', role: 'developer' },
      { userId: 'user-13', nickname: '임사이언스', role: 'data-scientist' },
    ],
    maxMembers: 4,
    recruitRoles: [],
    recruitStatus: 'closed',
    createdAt: '2026-03-15',
  },
  {
    id: 'team-7',
    name: 'WebFlow Innovators',
    description: '모던 웹 개발과 UX 최적화에 전문성이 있는 팀입니다. 이전 해커톤에서 완성도 우수상을 수상했습니다. 풀스택 개발자와 UI/UX 디자이너를 찾고 있어요!',
    hackathonSlugs: ['vibe-coding-challenge'],
    requirements: 'Next.js 경험자 필수, TypeScript 능숙자 우대',
    techStack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Zustand'],
    teamScore: 0,
    hackathonCount: 1,
    submissionCount: 0,
    members: [
      { userId: 'user-11', nickname: '한풀스택', role: 'developer' },
      { userId: 'user-12', nickname: '이UX', role: 'designer' },
    ],
    maxMembers: 5,
    recruitRoles: ['developer', 'designer'],
    recruitStatus: 'open',
    createdAt: '2026-03-28',
  },
  {
    id: 'team-8',
    name: 'Design Excellence',
    description: '디자인 주도의 개발 팀! 기획부터 구현까지 사용자 경험을 최우선으로 생각합니다. 아름답고 기능적인 UI를 함께 만들어봐요.',
    hackathonSlugs: ['vibe-coding-challenge'],
    requirements: '디자인 센스 있는 분들, 협업을 좋아하는 분들',
    techStack: ['React', 'Figma', 'Tailwind CSS', 'Next.js'],
    teamScore: 0,
    hackathonCount: 1,
    submissionCount: 0,
    members: [
      { userId: 'user-13', nickname: '조디자인', role: 'designer' },
      { userId: 'user-14', nickname: '윤기획', role: 'planner' },
    ],
    maxMembers: 5,
    recruitRoles: ['developer', 'developer'],
    recruitStatus: 'open',
    createdAt: '2026-03-30',
  },
];

export const seedSubmissions: Submission[] = [
  { id: 'sub-1', hackathonSlug: 'ai-image-generation', teamId: 'team-1', version: 1, content: 'Stable Diffusion XL 기반 파인튜닝 모델', memo: 'v1: 기본 모델', score: 78.5, createdAt: '2026-03-18' },
  { id: 'sub-2', hackathonSlug: 'ai-image-generation', teamId: 'team-1', version: 2, content: 'LoRA 적용 + 프롬프트 최적화', memo: 'v2: LoRA 적용', score: 85.2, createdAt: '2026-03-22' },
  { id: 'sub-3', hackathonSlug: 'ai-image-generation', teamId: 'team-6', version: 1, content: 'DALL-E 3 + 후처리 파이프라인', memo: 'v1: 초기 제출', score: 82.1, createdAt: '2026-03-17' },
  { id: 'sub-4', hackathonSlug: 'ai-image-generation', teamId: 'team-6', version: 2, content: '앙상블 + 초해상도 적용', memo: 'v2: 앙상블', score: 91.3, createdAt: '2026-03-25' },
  { id: 'sub-5', hackathonSlug: 'vibe-coding-challenge', teamId: 'team-2', version: 1, content: 'Next.js 기반 AI 협업 툴', memo: 'v1: 기본 구현 완료', createdAt: '2026-03-20' },
  { id: 'sub-6', hackathonSlug: 'vibe-coding-challenge', teamId: 'team-5', version: 1, content: '실시간 코드 리뷰 플랫폼', memo: 'v1: MVP', createdAt: '2026-03-22' },
  { id: 'sub-7', hackathonSlug: 'data-science-hackathon', teamId: 'team-3', version: 1, content: 'XGBoost + Feature Engineering', memo: 'v1: 베이스라인', score: 72.4, createdAt: '2026-03-25' },
  { id: 'sub-8', hackathonSlug: 'creative-ai-art', teamId: 'team-5', version: 1, content: 'AI 기반 추상화 시리즈', memo: '최종 제출', score: 88.0, createdAt: '2026-02-28' },
];

export const seedLeaderboards: Leaderboard[] = [
  {
    hackathonSlug: 'ai-image-generation',
    status: 'live',
    entries: [
      { teamId: 'team-6', teamName: 'Speed Coders', score: 91.3, rank: 1, submissionCount: 2, lastSubmittedAt: '2026-03-25' },
      { teamId: 'team-1', teamName: 'Alpha Creators', score: 85.2, rank: 2, submissionCount: 2, lastSubmittedAt: '2026-03-22' },
    ],
  },
  {
    hackathonSlug: 'vibe-coding-challenge',
    status: 'pending-review',
    entries: [
      { teamId: 'team-5', teamName: 'Creative Minds', score: 0, rank: 1, submissionCount: 1, lastSubmittedAt: '2026-03-22' },
      { teamId: 'team-2', teamName: 'Vibe Builders', score: 0, rank: 2, submissionCount: 1, lastSubmittedAt: '2026-03-20' },
    ],
  },
  {
    hackathonSlug: 'data-science-hackathon',
    status: 'live',
    entries: [
      { teamId: 'team-3', teamName: 'Data Wizards', score: 72.4, rank: 1, submissionCount: 1, lastSubmittedAt: '2026-03-25' },
    ],
  },
  {
    hackathonSlug: 'creative-ai-art',
    status: 'finalized',
    entries: [
      { teamId: 'team-5', teamName: 'Creative Minds', score: 88.0, rank: 1, submissionCount: 1, lastSubmittedAt: '2026-02-28' },
    ],
  },
  {
    hackathonSlug: 'ml-model-optimization',
    status: 'finalized',
    entries: [],
  },
];

export const seedRankings: RankingEntry[] = [
  { userId: 'user-11', nickname: '윤스피드', role: 'developer', grade: 'legend', badges: ['first-submit', 'team-leader', '3-wins'], totalScore: 5200, competitionScore: 4100, communityScore: 1100 },
  { userId: 'user-5', nickname: '최분석', role: 'data-scientist', grade: 'challenger', badges: ['first-submit', '10-hackathons'], totalScore: 1800, competitionScore: 1400, communityScore: 400 },
  { userId: 'user-8', nickname: '오기획', role: 'planner', grade: 'master', badges: ['first-submit', 'team-leader', 'popular-author'], totalScore: 1180, competitionScore: 700, communityScore: 480 },
  { userId: 'user-2', nickname: '김데이터', role: 'data-scientist', grade: 'master', badges: ['first-submit', '7-day-streak'], totalScore: 980, competitionScore: 750, communityScore: 230 },
  { userId: 'user-4', nickname: '박프론트', role: 'developer', grade: 'expert', badges: ['first-submit'], totalScore: 450, competitionScore: 300, communityScore: 150 },
  { userId: 'user-9', nickname: '유예술', role: 'designer', grade: 'expert', badges: ['first-submit', 'creator'], totalScore: 380, competitionScore: 200, communityScore: 180 },
  { userId: 'user-3', nickname: '이디자인', role: 'designer', grade: 'expert', badges: ['first-submit'], totalScore: 310, competitionScore: 200, communityScore: 110 },
  { userId: 'user-7', nickname: '한언어', role: 'data-scientist', grade: 'expert', badges: ['first-submit'], totalScore: 250, competitionScore: 180, communityScore: 70 },
  { userId: 'user-6', nickname: '정머신', role: 'data-scientist', grade: 'rookie', badges: ['first-submit'], totalScore: 95, competitionScore: 80, communityScore: 15 },
  { userId: 'user-10', nickname: '강개발', role: 'developer', grade: 'rookie', badges: [], totalScore: 60, competitionScore: 50, communityScore: 10 },
];

export const seedCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1', type: 'tip', title: 'Stable Diffusion XL 파인튜닝 팁 공유', summary: '이미지 생성 대회 준비 중 알게 된 LoRA 활용과 프롬프트 엔지니어링 팁을 공유합니다.', content: '이번 이미지 생성 대회를 준비하면서 알게 된 팁을 공유합니다.\n\n## 1. LoRA 활용\nLoRA를 사용하면 적은 데이터로도 효과적인 파인튜닝이 가능합니다.\n\n## 2. 프롬프트 엔지니어링\nnegative prompt를 적극 활용하세요.',
    authorId: 'user-2', authorNickname: '김데이터', hackathonTag: 'ai-image-generation', likes: 24, likedBy: ['user-4', 'user-5'], comments: [
      { id: 'c1', authorId: 'user-4', authorNickname: '박프론트', content: '좋은 팁 감사합니다! LoRA 설정 값도 공유해주실 수 있나요?', createdAt: '2026-03-19' },
    ], createdAt: '2026-03-18',
  },
  {
    id: 'post-2', type: 'question', title: '바이브 코딩 대회 제출 형식 질문', summary: '바이브 코딩 대회 제출 시 Vercel 배포 링크만 제출하면 되는지, GitHub 리포지토리도 함께 제출해야 하는지 묻는 질문입니다.', content: '웹링크 제출 시 Vercel 배포 링크만 제출하면 되나요? 아니면 GitHub 리포지토리도 함께 제출해야 하나요?',
    authorId: 'user-4', authorNickname: '박프론트', hackathonTag: 'vibe-coding-challenge', likes: 8, likedBy: [], comments: [
      { id: 'c2', authorId: 'user-8', authorNickname: '오기획', content: '공지사항에 Vercel 링크만 제출하면 된다고 나와있어요!', createdAt: '2026-03-14' },
    ], createdAt: '2026-03-13',
  },
  {
    id: 'post-3', type: 'team-find', title: '[바이브 코딩] 프론트엔드 개발자 구합니다', summary: '바이브 코딩 대회에서 React/Next.js 경험 있는 프론트엔드 개발자 2명을 구하는 팀원 모집 글입니다.', content: 'React/Next.js 경험 있는 개발자를 찾습니다.\n- 현재 인원: 기획 1, 디자인 1\n- 필요 역할: 프론트엔드 개발 2명\n- 사용 기술: Next.js, Tailwind CSS, tw-animate-css',
    authorId: 'user-8', authorNickname: '오기획', hackathonTag: 'vibe-coding-challenge', teamId: 'team-5', likes: 12, likedBy: [], comments: [
      { id: 'c3', authorId: 'user-4', authorNickname: '박프론트', content: '관심 있습니다! DM 드려도 될까요?', createdAt: '2026-03-13' },
    ], createdAt: '2026-03-12',
  },
  {
    id: 'post-4', type: 'tip', title: 'XGBoost Feature Engineering 가이드', summary: '데이터 사이언스 해커톤을 위한 결측치 처리, 범주형 변수 인코딩, 시계열 특성 추출 등 Feature Engineering 팁을 정리한 가이드입니다.', content: '데이터 사이언스 해커톤을 위한 Feature Engineering 팁입니다.\n\n1. 결측치 처리: 중앙값 대체보다 모델 기반 imputation이 효과적\n2. 범주형 변수: Target Encoding 활용\n3. 시계열 특성: lag features와 rolling statistics 추가',
    authorId: 'user-5', authorNickname: '최분석', hackathonTag: 'data-science-hackathon', likes: 31, likedBy: ['user-2', 'user-6'], comments: [], createdAt: '2026-03-22',
  },
  {
    id: 'post-5', type: 'free', title: '해커톤 처음 참가하는데 조언 부탁드려요', summary: '독학 6개월 차 개발자가 처음 해커톤 참가를 앞두고 어떤 대회부터 시작하면 좋을지 조언을 구하는 글입니다.', content: '프로그래밍을 독학한 지 6개월 됐는데, 처음으로 해커톤에 참가해보려 합니다. 어떤 대회부터 시작하면 좋을까요?',
    authorId: 'user-10', authorNickname: '강개발', likes: 5, likedBy: [], comments: [
      { id: 'c4', authorId: 'user-11', authorNickname: '윤스피드', content: '바이브 코딩 대회부터 시작해보세요! AI 도구를 활용하면 경험이 적어도 충분히 참가할 수 있어요.', createdAt: '2026-03-21' },
      { id: 'c5', authorId: 'user-8', authorNickname: '오기획', content: '팀에 합류하면 더 많이 배울 수 있어요. /camp에서 팀을 찾아보세요!', createdAt: '2026-03-21' },
    ], createdAt: '2026-03-20',
  },
  {
    id: 'post-6', type: 'tip', title: 'CSS 순수 애니메이션으로 부드러운 UI 만들기', summary: 'tw-animate-css를 활용해 JS 없이 부드러운 모달·페이지 전환 애니메이션을 구현하는 방법을 코드와 함께 공유합니다.', content: 'tw-animate-css를 활용한 CSS 순수 애니메이션 구현 방법을 공유합니다. JS 런타임 비용 없이 부드러운 모션을 만들 수 있어요!\n\n```tsx\n// 페이지 진입 애니메이션\n<div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">\n  {children}\n</div>\n\n// 모달 오픈 애니메이션\n<div className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">\n  {content}\n</div>\n```',
    authorId: 'user-4', authorNickname: '박프론트', hackathonTag: 'vibe-coding-challenge', likes: 18, likedBy: ['user-8', 'user-9'], comments: [], createdAt: '2026-03-19',
  },
  {
    id: 'post-7', type: 'question', title: 'NLP 감성 분석 대회 데이터셋 사전 공개?', summary: '4월에 시작하는 NLP 감성 분석 대회의 데이터셋이 사전에 공개되는지 묻는 질문입니다.', content: '4월에 시작하는 NLP 감성 분석 대회의 데이터셋이 사전 공개되나요? 미리 준비하고 싶습니다.',
    authorId: 'user-7', authorNickname: '한언어', hackathonTag: 'nlp-sentiment-analysis', likes: 3, likedBy: [], comments: [], createdAt: '2026-03-26',
  },
  {
    id: 'post-8', type: 'free', title: 'Creative AI 아트 공모전 수상 후기', summary: 'AI 아트 공모전 대상 수상자가 준비 과정과 느낀 점을 공유하며, AI를 도구로 활용하되 자신만의 예술적 비전을 담는 것이 핵심이었다고 소개합니다.', content: '이번 AI 아트 공모전에서 대상을 수상했습니다! 준비 과정과 느낀 점을 공유합니다.\n\n가장 중요한 것은 AI를 도구로 활용하되, 본인만의 예술적 비전을 담는 것이었습니다.',
    authorId: 'user-9', authorNickname: '유예술', hackathonTag: 'creative-ai-art', likes: 42, likedBy: ['user-2', 'user-3', 'user-4', 'user-5'], comments: [
      { id: 'c6', authorId: 'user-3', authorNickname: '이디자인', content: '축하합니다! 작품 정말 인상적이었어요.', createdAt: '2026-03-16' },
    ], createdAt: '2026-03-15',
  },
  {
    id: 'post-9', type: 'team-find', title: '[데이터 사이언스] 분석가 1명 급구!', summary: '데이터 사이언스 해커톤 참가 중 팀원이 빠져 데이터 분석 및 시각화 가능한 분석가 1명을 급히 구하는 글입니다.', content: '데이터 사이언스 해커톤 참가 중인데, 팀원 1명이 급하게 빠져서 분석가를 구합니다.\n- 현재: 데이터 사이언티스트 2명\n- 필요: 데이터 분석 + 시각화 가능하신 분',
    authorId: 'user-5', authorNickname: '최분석', hackathonTag: 'data-science-hackathon', teamId: 'team-3', likes: 6, likedBy: [], comments: [], createdAt: '2026-03-23',
  },
  {
    id: 'post-10', type: 'tip', title: '해커톤 시간 관리 노하우', summary: '여러 해커톤 경험을 바탕으로 첫 날 기획 집중, MVP 우선, 매일 제출, 팀 소통 등 실전 시간 관리 노하우를 공유하는 글입니다.', content: '여러 해커톤을 경험하면서 배운 시간 관리 팁입니다.\n\n1. **첫 날은 기획에 집중** — 바로 코딩하지 말고 전체 계획을 세우세요\n2. **MVP 우선** — 핵심 기능 먼저, 부가 기능은 나중에\n3. **매일 제출** — 미완성이어도 중간 제출로 안전망 확보\n4. **팀 소통** — 매일 10분 스탠드업 미팅',
    authorId: 'user-11', authorNickname: '윤스피드', likes: 35, likedBy: ['user-2', 'user-4', 'user-5', 'user-8'], comments: [
      { id: 'c7', authorId: 'user-2', authorNickname: '김데이터', content: '매일 제출 팁이 정말 유용해요. 작년에 마감 직전 서버 터져서 고생했거든요.', createdAt: '2026-03-18' },
    ], createdAt: '2026-03-17',
  },
];

export const seedBadges: Badge[] = [
  { id: 'first-submit', name: '첫 제출', type: 'achievement', icon: 'Target', condition: '첫 번째 제출 완료' },
  { id: 'team-leader', name: '팀 리더', type: 'achievement', icon: 'Crown', condition: '팀 생성 및 리더 역할' },
  { id: '3-wins', name: '3연속 입상', type: 'achievement', icon: 'Trophy', condition: '3회 연속 대회 입상' },
  { id: 'popular-author', name: '인기 작성자', type: 'activity', icon: 'Star', condition: '좋아요 50개 이상 받기' },
  { id: '7-day-streak', name: '7일 연속 로그인', type: 'activity', icon: 'Flame', condition: '7일 연속 로그인' },
  { id: '10-hackathons', name: '10개 대회 참가', type: 'activity', icon: 'Tent', condition: '10개 이상 해커톤 참가' },
  { id: 'creator', name: '대회 창작자', type: 'special', icon: 'Palette', condition: '나만의 대회 1개 이상 생성' },
  { id: 'beta-tester', name: '베타 테스터', type: 'special', icon: 'FlaskConical', condition: 'DACLAW 베타 테스트 참여' },
  { id: '50-comments', name: '50개 댓글', type: 'activity', icon: 'MessageSquare', condition: '커뮤니티 댓글 50개 이상 작성' },
];

export const seedDailyMissions: DailyMission[] = [
  { id: 'dm-1', title: '해커톤 1개 북마크하기', description: '관심 있는 해커톤을 북마크해보세요', points: 5, difficulty: 'easy', completed: false, date: '2026-03-29' },
  { id: 'dm-2', title: '커뮤니티 댓글 1개 작성', description: '다른 사용자의 게시글에 댓글을 달아보세요', points: 10, difficulty: 'easy', completed: false, date: '2026-03-29' },
  { id: 'dm-3', title: '제출 1회 완료', description: '참가 중인 대회에 제출해보세요', points: 20, difficulty: 'medium', completed: false, date: '2026-03-29' },
  { id: 'dm-4', title: '팀에 참가 신청하기', description: 'AI 추천 팀에 참가 신청을 보내보세요', points: 15, difficulty: 'medium', completed: false, date: '2026-03-29' },
  { id: 'dm-5', title: '게시글 1개 작성', description: '커뮤니티에 팁이나 질문을 공유해보세요', points: 15, difficulty: 'medium', completed: false, date: '2026-03-29' },
];

export const seedMessages: Message[] = [
  { id: 'msg-1', from: 'user-4', to: 'user-8', content: '안녕하세요! 프론트엔드 개발자 구하신다고 해서 연락드려요. Next.js 2년 경험 있습니다.', type: 'team-request', teamId: 'team-5', read: true, createdAt: '2026-03-13T09:30' },
  { id: 'msg-2', from: 'user-10', to: 'user-2', content: '팀에 합류하고 싶습니다! 아직 경험은 적지만 열심히 하겠습니다.', type: 'team-request', teamId: 'team-1', read: false, createdAt: '2026-03-20T14:20' },
  // DM conversations
  { id: 'msg-3', from: 'user-11', to: 'user-5', content: '최분석님, 이번 NLP 챌린지 데이터 전처리 어떻게 하셨어요?', type: 'dm', read: true, createdAt: '2026-03-25T10:15' },
  { id: 'msg-4', from: 'user-5', to: 'user-11', content: 'KoNLPy로 형태소 분석 후 TF-IDF 벡터화했어요. 코드 공유해드릴까요?', type: 'dm', read: true, createdAt: '2026-03-25T10:22' },
  { id: 'msg-5', from: 'user-11', to: 'user-5', content: '네! 감사합니다. 저도 EDA 노트북 공유 가능해요.', type: 'dm', read: true, createdAt: '2026-03-25T10:30' },
  { id: 'msg-6', from: 'user-5', to: 'user-11', content: '좋아요! 그럼 내일 오후에 화상으로 코드 리뷰 할까요?', type: 'dm', read: false, createdAt: '2026-03-25T11:05' },
  { id: 'msg-7', from: 'user-8', to: 'user-2', content: '김데이터님, 이번 대회 같이 나가실 생각 있으신가요?', type: 'dm', read: true, createdAt: '2026-03-26T09:00' },
  { id: 'msg-8', from: 'user-2', to: 'user-8', content: '관심 있어요! 어떤 대회인가요?', type: 'dm', read: true, createdAt: '2026-03-26T09:15' },
  { id: 'msg-9', from: 'user-8', to: 'user-2', content: 'AI 이미지 생성 챌린지요. 기획은 제가 하고 모델링 부분 도움 주시면 좋겠어요.', type: 'dm', read: false, createdAt: '2026-03-26T09:20' },
  { id: 'msg-10', from: 'user-7', to: 'user-11', content: '윤스피드님 랭킹 1위 축하드려요! 비결이 뭔가요?', type: 'dm', read: true, createdAt: '2026-03-27T15:00' },
  { id: 'msg-11', from: 'user-11', to: 'user-7', content: '감사합니다! 꾸준히 대회 참가하면서 커뮤니티 활동도 열심히 했어요 ㅎㅎ', type: 'dm', read: false, createdAt: '2026-03-27T15:10' },
];

export const defaultUserProfile: UserProfile = {
  id: 'user-1',
  nickname: '',
  email: '',
  role: 'developer',
  techStack: [],
  interests: [],
  grade: 'rookie',
  badges: [],
  points: 0,
  joinedAt: '2026-03-29',
  loginStreak: 1,
};

export function getGradeFromPoints(points: number): string {
  if (points >= 5000) return 'legend';
  if (points >= 1500) return 'challenger';
  if (points >= 500) return 'master';
  if (points >= 100) return 'expert';
  return 'rookie';
}

// Grade hierarchy (highest → lowest): Legend > Challenger > Master > Expert > Rookie
export const gradeConfig: Record<string, { label: string; icon: string; color: string; min: number; max: number }> = {
  rookie: { label: 'Rookie', icon: 'Sprout', color: 'var(--color-grade-rookie)', min: 0, max: 99 },
  expert: { label: 'Expert', icon: 'Gem', color: 'var(--color-grade-expert)', min: 100, max: 499 },
  master: { label: 'Master', icon: 'Crown', color: 'var(--color-grade-master)', min: 500, max: 1499 },
  challenger: { label: 'Challenger', icon: 'Swords', color: 'var(--color-grade-challenger)', min: 1500, max: 4999 },
  legend: { label: 'Legend', icon: 'Trophy', color: 'var(--color-grade-legend)', min: 5000, max: Infinity },
};

export const GRADE_ORDER = Object.keys(gradeConfig);
