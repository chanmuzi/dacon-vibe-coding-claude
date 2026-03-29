import type {
  Hackathon, Team, Submission, Leaderboard, RankingEntry,
  CommunityPost, Badge, DailyMission, Message, UserProfile,
} from '@/types';

export const seedHackathons: Hackathon[] = [
  {
    slug: 'ai-image-generation',
    title: 'AI 이미지 생성 챌린지',
    description: '최신 생성형 AI 모델을 활용하여 주어진 프롬프트에 가장 적합한 고품질 이미지를 생성하는 대회입니다. CLIP Score와 FID를 기반으로 자동 채점됩니다.',
    type: 'quantitative',
    status: 'active',
    tags: ['AI', '이미지 생성', 'Diffusion', 'Computer Vision'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    resultDate: '2026-04-20',
    prizes: [
      { rank: 1, label: '1등', amount: '500만원' },
      { rank: 2, label: '2등', amount: '300만원' },
      { rank: 3, label: '3등', amount: '100만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 4 },
    participantCount: 342,
    metrics: ['CLIP Score', 'FID'],
    notices: [
      { id: 'n1', title: '데이터셋 v2 업데이트', content: '평가용 프롬프트 세트가 업데이트되었습니다. 기존 제출물은 재채점됩니다.', pinned: true, createdAt: '2026-03-20' },
      { id: 'n2', title: '제출 형식 안내', content: 'PNG 형식, 512x512 해상도로 제출해주세요.', pinned: false, createdAt: '2026-03-16' },
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
    type: 'qualitative',
    status: 'active',
    tags: ['웹개발', 'AI', '바이브코딩', 'UI/UX'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
    startDate: '2026-03-10',
    endDate: '2026-04-13',
    resultDate: '2026-04-25',
    prizes: [
      { rank: 1, label: '대상', amount: '1000만원' },
      { rank: 2, label: '최우수상', amount: '500만원' },
      { rank: 3, label: '우수상', amount: '200만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 5 },
    participantCount: 567,
    evaluationCriteria: [
      { name: '기본 구현', weight: 30, description: '필수 기능 구현 및 데이터 기반 렌더링' },
      { name: '확장/아이디어', weight: 30, description: '차별화된 기능과 창의적 아이디어' },
      { name: '완성도', weight: 25, description: 'UI/UX 품질, 안정성, 성능' },
      { name: '문서', weight: 15, description: 'README, 코드 구조 설명' },
    ],
    notices: [
      { id: 'n3', title: '심사 기준 상세 안내', content: '기본 구현(30점) + 확장/아이디어(30점) + 완성도(25점) + 문서(15점) = 100점 만점입니다.', pinned: true, createdAt: '2026-03-12' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-03-10', done: true },
      { label: '중간 발표', date: '2026-03-25', done: true },
      { label: '웹링크 제출', date: '2026-04-06', done: false },
      { label: 'PDF 제출', date: '2026-04-13', done: false },
      { label: '결과 발표', date: '2026-04-25', done: false },
    ],
  },
  {
    slug: 'data-science-hackathon',
    title: '데이터 사이언스 인수인계 해커톤',
    description: '데이터 분석과 모델 성능(자동 채점) + 분석 보고서 품질(심사위원 평가)을 종합하여 평가하는 혼합형 대회입니다.',
    type: 'hybrid',
    status: 'active',
    tags: ['데이터 분석', 'ML', '보고서', '인수인계'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    startDate: '2026-03-20',
    endDate: '2026-04-20',
    resultDate: '2026-04-30',
    prizes: [
      { rank: 1, label: '1등', amount: '300만원' },
      { rank: 2, label: '2등', amount: '150만원' },
      { rank: 3, label: '3등', amount: '50만원' },
    ],
    teamPolicy: { solo: false, maxMembers: 3 },
    participantCount: 189,
    metrics: ['RMSE', 'R²'],
    evaluationCriteria: [
      { name: '모델 성능', weight: 50, description: 'RMSE 기반 자동 채점' },
      { name: '분석 보고서', weight: 30, description: '데이터 인사이트와 논리적 구성' },
      { name: '코드 품질', weight: 20, description: '재현 가능성과 문서화' },
    ],
    notices: [
      { id: 'n4', title: '데이터셋 공개', content: 'train.csv와 test.csv가 공개되었습니다. 다운로드 후 분석을 시작하세요.', pinned: true, createdAt: '2026-03-20' },
    ],
    milestones: [
      { label: '대회 시작', date: '2026-03-20', done: true },
      { label: '제출 마감', date: '2026-04-20', done: false },
      { label: '결과 발표', date: '2026-04-30', done: false },
    ],
  },
  {
    slug: 'nlp-sentiment-analysis',
    title: 'NLP 감성 분석 챌린지',
    description: '한국어 리뷰 데이터의 감성을 분류하는 NLP 모델 대회입니다. Macro F1 Score로 자동 평가됩니다.',
    type: 'quantitative',
    status: 'upcoming',
    tags: ['NLP', '감성 분석', '한국어', 'Transformer'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop',
    startDate: '2026-04-01',
    endDate: '2026-05-01',
    resultDate: '2026-05-10',
    prizes: [
      { rank: 1, label: '1등', amount: '200만원' },
      { rank: 2, label: '2등', amount: '100만원' },
    ],
    teamPolicy: { solo: true, maxMembers: 3 },
    participantCount: 0,
    metrics: ['Macro F1'],
    notices: [],
    milestones: [
      { label: '대회 시작', date: '2026-04-01', done: false },
      { label: '제출 마감', date: '2026-05-01', done: false },
      { label: '결과 발표', date: '2026-05-10', done: false },
    ],
  },
  {
    slug: 'creative-ai-art',
    title: 'Creative AI 아트 공모전',
    description: 'AI를 활용한 예술 작품 공모전입니다. 심사위원단이 예술성, 기술 활용도, 독창성을 종합 평가합니다.',
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
      { name: '예술성', weight: 40, description: '작품의 미적 완성도' },
      { name: 'AI 활용도', weight: 35, description: 'AI 도구 활용의 독창성' },
      { name: '독창성', weight: 25, description: '컨셉의 참신함' },
    ],
    notices: [
      { id: 'n5', title: '수상작 발표', content: '심사가 완료되어 수상작을 발표합니다. 축하합니다!', pinned: true, createdAt: '2026-03-15' },
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
    notices: [
      { id: 'n6', title: '최종 결과 발표', content: '모든 심사가 완료되었습니다. 수상자 여러분 축하합니다!', pinned: true, createdAt: '2026-03-10' },
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
    hackathonSlug: 'ai-image-generation',
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
    hackathonSlug: 'vibe-coding-challenge',
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
    hackathonSlug: 'data-science-hackathon',
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
    hackathonSlug: 'nlp-sentiment-analysis',
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
    hackathonSlug: 'vibe-coding-challenge',
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
    hackathonSlug: 'ai-image-generation',
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
  { userId: 'user-11', nickname: '윤스피드', role: 'developer', grade: 'master', badges: ['first-submit', 'team-leader', '3-wins'], totalScore: 2850, competitionScore: 2200, communityScore: 650 },
  { userId: 'user-5', nickname: '최분석', role: 'data-scientist', grade: 'expert', badges: ['first-submit', '10-hackathons'], totalScore: 1420, competitionScore: 1100, communityScore: 320 },
  { userId: 'user-8', nickname: '오기획', role: 'planner', grade: 'expert', badges: ['first-submit', 'team-leader', 'popular-author'], totalScore: 1180, competitionScore: 700, communityScore: 480 },
  { userId: 'user-2', nickname: '김데이터', role: 'data-scientist', grade: 'expert', badges: ['first-submit', '7-day-streak'], totalScore: 980, competitionScore: 750, communityScore: 230 },
  { userId: 'user-4', nickname: '박프론트', role: 'developer', grade: 'challenger', badges: ['first-submit'], totalScore: 450, competitionScore: 300, communityScore: 150 },
  { userId: 'user-9', nickname: '유예술', role: 'designer', grade: 'challenger', badges: ['first-submit', 'creator'], totalScore: 380, competitionScore: 200, communityScore: 180 },
  { userId: 'user-3', nickname: '이디자인', role: 'designer', grade: 'challenger', badges: ['first-submit'], totalScore: 310, competitionScore: 200, communityScore: 110 },
  { userId: 'user-7', nickname: '한언어', role: 'data-scientist', grade: 'challenger', badges: ['first-submit'], totalScore: 250, competitionScore: 180, communityScore: 70 },
  { userId: 'user-6', nickname: '정머신', role: 'data-scientist', grade: 'rookie', badges: ['first-submit'], totalScore: 95, competitionScore: 80, communityScore: 15 },
  { userId: 'user-10', nickname: '강개발', role: 'developer', grade: 'rookie', badges: [], totalScore: 60, competitionScore: 50, communityScore: 10 },
];

export const seedCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1', type: 'tip', title: 'Stable Diffusion XL 파인튜닝 팁 공유', content: '이번 이미지 생성 대회를 준비하면서 알게 된 팁을 공유합니다.\n\n## 1. LoRA 활용\nLoRA를 사용하면 적은 데이터로도 효과적인 파인튜닝이 가능합니다.\n\n## 2. 프롬프트 엔지니어링\nnegative prompt를 적극 활용하세요.',
    authorId: 'user-2', authorNickname: '김데이터', hackathonTag: 'ai-image-generation', likes: 24, likedBy: ['user-4', 'user-5'], comments: [
      { id: 'c1', authorId: 'user-4', authorNickname: '박프론트', content: '좋은 팁 감사합니다! LoRA 설정 값도 공유해주실 수 있나요?', createdAt: '2026-03-19' },
    ], createdAt: '2026-03-18',
  },
  {
    id: 'post-2', type: 'question', title: '바이브 코딩 대회 제출 형식 질문', content: '웹링크 제출 시 Vercel 배포 링크만 제출하면 되나요? 아니면 GitHub 리포지토리도 함께 제출해야 하나요?',
    authorId: 'user-4', authorNickname: '박프론트', hackathonTag: 'vibe-coding-challenge', likes: 8, likedBy: [], comments: [
      { id: 'c2', authorId: 'user-8', authorNickname: '오기획', content: '공지사항에 Vercel 링크만 제출하면 된다고 나와있어요!', createdAt: '2026-03-14' },
    ], createdAt: '2026-03-13',
  },
  {
    id: 'post-3', type: 'team-find', title: '[바이브 코딩] 프론트엔드 개발자 구합니다', content: 'React/Next.js 경험 있는 개발자를 찾습니다.\n- 현재 인원: 기획 1, 디자인 1\n- 필요 역할: 프론트엔드 개발 2명\n- 사용 기술: Next.js, Tailwind CSS, Framer Motion',
    authorId: 'user-8', authorNickname: '오기획', hackathonTag: 'vibe-coding-challenge', likes: 12, likedBy: [], comments: [
      { id: 'c3', authorId: 'user-4', authorNickname: '박프론트', content: '관심 있습니다! DM 드려도 될까요?', createdAt: '2026-03-13' },
    ], createdAt: '2026-03-12',
  },
  {
    id: 'post-4', type: 'tip', title: 'XGBoost Feature Engineering 가이드', content: '데이터 사이언스 해커톤을 위한 Feature Engineering 팁입니다.\n\n1. 결측치 처리: 중앙값 대체보다 모델 기반 imputation이 효과적\n2. 범주형 변수: Target Encoding 활용\n3. 시계열 특성: lag features와 rolling statistics 추가',
    authorId: 'user-5', authorNickname: '최분석', hackathonTag: 'data-science-hackathon', likes: 31, likedBy: ['user-2', 'user-6'], comments: [], createdAt: '2026-03-22',
  },
  {
    id: 'post-5', type: 'free', title: '해커톤 처음 참가하는데 조언 부탁드려요', content: '프로그래밍을 독학한 지 6개월 됐는데, 처음으로 해커톤에 참가해보려 합니다. 어떤 대회부터 시작하면 좋을까요?',
    authorId: 'user-10', authorNickname: '강개발', likes: 5, likedBy: [], comments: [
      { id: 'c4', authorId: 'user-11', authorNickname: '윤스피드', content: '바이브 코딩 대회부터 시작해보세요! AI 도구를 활용하면 경험이 적어도 충분히 참가할 수 있어요.', createdAt: '2026-03-21' },
      { id: 'c5', authorId: 'user-8', authorNickname: '오기획', content: '팀에 합류하면 더 많이 배울 수 있어요. /camp에서 팀을 찾아보세요!', createdAt: '2026-03-21' },
    ], createdAt: '2026-03-20',
  },
  {
    id: 'post-6', type: 'tip', title: 'Framer Motion으로 멋진 페이지 전환 만들기', content: 'Next.js App Router에서 Framer Motion을 활용한 페이지 전환 애니메이션 구현 방법을 공유합니다.\n\n```tsx\nimport { motion } from "framer-motion";\n\nexport default function Template({ children }) {\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      transition={{ ease: "easeOut", duration: 0.3 }}\n    >\n      {children}\n    </motion.div>\n  );\n}\n```',
    authorId: 'user-4', authorNickname: '박프론트', hackathonTag: 'vibe-coding-challenge', likes: 18, likedBy: ['user-8', 'user-9'], comments: [], createdAt: '2026-03-19',
  },
  {
    id: 'post-7', type: 'question', title: 'NLP 감성 분석 대회 데이터셋 사전 공개?', content: '4월에 시작하는 NLP 감성 분석 대회의 데이터셋이 사전 공개되나요? 미리 준비하고 싶습니다.',
    authorId: 'user-7', authorNickname: '한언어', hackathonTag: 'nlp-sentiment-analysis', likes: 3, likedBy: [], comments: [], createdAt: '2026-03-26',
  },
  {
    id: 'post-8', type: 'free', title: 'Creative AI 아트 공모전 수상 후기', content: '이번 AI 아트 공모전에서 대상을 수상했습니다! 준비 과정과 느낀 점을 공유합니다.\n\n가장 중요한 것은 AI를 도구로 활용하되, 본인만의 예술적 비전을 담는 것이었습니다.',
    authorId: 'user-9', authorNickname: '유예술', hackathonTag: 'creative-ai-art', likes: 42, likedBy: ['user-2', 'user-3', 'user-4', 'user-5'], comments: [
      { id: 'c6', authorId: 'user-3', authorNickname: '이디자인', content: '축하합니다! 작품 정말 인상적이었어요.', createdAt: '2026-03-16' },
    ], createdAt: '2026-03-15',
  },
  {
    id: 'post-9', type: 'team-find', title: '[데이터 사이언스] 분석가 1명 급구!', content: '데이터 사이언스 해커톤 참가 중인데, 팀원 1명이 급하게 빠져서 분석가를 구합니다.\n- 현재: 데이터 사이언티스트 2명\n- 필요: 데이터 분석 + 시각화 가능하신 분',
    authorId: 'user-5', authorNickname: '최분석', hackathonTag: 'data-science-hackathon', likes: 6, likedBy: [], comments: [], createdAt: '2026-03-23',
  },
  {
    id: 'post-10', type: 'tip', title: '해커톤 시간 관리 노하우', content: '여러 해커톤을 경험하면서 배운 시간 관리 팁입니다.\n\n1. **첫 날은 기획에 집중** — 바로 코딩하지 말고 전체 계획을 세우세요\n2. **MVP 우선** — 핵심 기능 먼저, 부가 기능은 나중에\n3. **매일 제출** — 미완성이어도 중간 제출로 안전망 확보\n4. **팀 소통** — 매일 10분 스탠드업 미팅',
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
  { id: 'msg-1', from: 'user-4', to: 'user-8', content: '안녕하세요! 프론트엔드 개발자 구하신다고 해서 연락드려요. Next.js 2년 경험 있습니다.', type: 'team-request', teamId: 'team-5', read: true, createdAt: '2026-03-13' },
  { id: 'msg-2', from: 'user-10', to: 'user-2', content: '팀에 합류하고 싶습니다! 아직 경험은 적지만 열심히 하겠습니다.', type: 'team-request', teamId: 'team-1', read: false, createdAt: '2026-03-20' },
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
  if (points >= 1500) return 'master';
  if (points >= 500) return 'expert';
  if (points >= 100) return 'challenger';
  return 'rookie';
}

export const gradeConfig: Record<string, { label: string; icon: string; color: string; min: number; max: number }> = {
  rookie: { label: 'Rookie', icon: 'Sprout', color: 'var(--color-grade-rookie)', min: 0, max: 99 },
  challenger: { label: 'Challenger', icon: 'Swords', color: 'var(--color-grade-challenger)', min: 100, max: 499 },
  expert: { label: 'Expert', icon: 'Gem', color: 'var(--color-grade-expert)', min: 500, max: 1499 },
  master: { label: 'Master', icon: 'Crown', color: 'var(--color-grade-master)', min: 1500, max: 4999 },
  legend: { label: 'Legend', icon: 'Trophy', color: 'var(--color-grade-legend)', min: 5000, max: Infinity },
};
