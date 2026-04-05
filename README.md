# DACLAW - 해커톤 올인원 플랫폼

해커톤 탐색부터 팀 매칭, 제출, 성장 추적, 대회 운영까지 -- 참가자와 운영자 모두를 위한 해커톤 플랫폼.

> Dacon 바이브코딩 대회 출품작

## 프로젝트 개요

DACLAW는 해커톤 참가자의 전체 여정을 지원하는 플랫폼입니다.
대회 탐색, AI 팀 매칭, 실시간 제출/리더보드, 커뮤니티, 그리고 나만의 대회 만들기까지 통합 제공합니다.

## 실행 방법

```bash
cd daclaw
npm install
npm run dev
```

`http://localhost:3000`으로 접속합니다.

### 환경 변수 (선택)

AI 기능(대회 추천, 팀 매칭, QA 챗봇, 대회 생성 보조)을 사용하려면:

```bash
# daclaw/.env.local
OPENAI_API_KEY=sk-...
```

AI 기능 없이도 모든 핵심 기능은 정상 동작합니다.

## 배포

Vercel 배포 시 Root Directory를 `daclaw`로 설정하세요.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 App Router / React 19 |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 + tw-animate-css |
| 상태관리 | Zustand 5 |
| 차트 | Recharts |
| 검색 | Fuse.js (클라이언트 퍼지 검색) |
| 마크다운 | react-markdown + remark-gfm + rehype-katex |
| 아이콘 | Lucide React |
| AI | OpenAI gpt-4o-mini (4개 API 라우트) |
| 데이터 | localStorage 기반 mock (서버리스) |

## 프로젝트 구조

```
dacon-vibe-coding-claude/
├── docs/                          # 디자인 시스템, 참고 스크린샷
└── daclaw/                        # Next.js 앱 (Vercel root directory)
    ├── src/app/                   # 페이지 (15개, 동적 라우트 4개)
    │   ├── api/                   # API 라우트 (4개)
    │   │   ├── chat/              # QA 챗봇 (스트리밍)
    │   │   ├── analyze/           # AI 프로필 분석 + 대회 추천
    │   │   ├── recommend-teams/   # AI 팀 매칭
    │   │   └── generate-hackathon/# AI 대회 생성 보조
    │   ├── hackathons/            # 대회 목록 + 상세 + 비교
    │   ├── create/                # 나만의 대회 만들기 (5단계 위자드)
    │   ├── dashboard/             # 내 대시보드
    │   ├── community/             # 커뮤니티
    │   ├── camp/                  # 팀 모집
    │   └── ...
    ├── src/components/            # 공통 컴포넌트 (16개 + create/ 8개)
    │   ├── create/                # 대회 생성 위자드 컴포넌트
    │   ├── dashboard/             # 대시보드 전용 컴포넌트
    │   └── layout/                # 레이아웃 (Navigation)
    ├── src/store/                 # Zustand 스토어 (8개)
    ├── src/data/seed.ts           # 시드 데이터 (6개 대회, 버전 관리)
    └── src/types/index.ts         # TypeScript 타입 정의
```

## 주요 기능

### 해커톤 탐색 및 참여
- 대회 목록 (카드뷰 / 캘린더뷰 전환)
- 상태별(진행중/예정/종료), 유형별(정량/정성/혼합), 기간별, 주최자별 필터
- 대회 비교 (최대 3개 동시 비교)
- 상세 페이지: 규칙, 평가 기준, 상금, FAQ, 마일스톤
- 제출 시스템: CSV/JSON/Markdown 파일 업로드 + 실시간 검증
- 리더보드: 실시간 순위 + 점수 시각화

### 나만의 대회 만들기
- 5단계 위자드: 평가방식 -> 기본정보 -> 평가&제출 -> 규칙&운영 -> 미리보기
- AI 대회 생성 보조: 제목/방식/일정 입력 -> 규칙, 평가기준, FAQ 자동 생성
- 배너 색상 팔레트 (8종 그라데이션) 또는 이미지 URL
- 월 2회 생성 제한, 대시보드에서 내 대회 관리

### AI 기능 (gpt-4o-mini)
- **QA 챗봇**: 대회별 컨텍스트 기반 실시간 질의응답 (스트리밍)
- **프로필 분석**: 사용자 역할/기술스택/등급 기반 맞춤 대회 추천
- **팀 매칭**: 프로필-팀 호환성 분석 + 매치 점수 (0-100)
- **대회 생성 보조**: 자연어 입력으로 대회 설정 자동 생성

### 팀 매칭 및 캠프
- 팀 생성/모집/신청
- 역할별(개발자/디자이너/기획자/데이터 사이언티스트) 필터
- AI 팀 추천 (기술스택 + 관심분야 매칭)

### 커뮤니티
- 게시글 유형: 질문, 팁, 팀 찾기, 자유
- 좋아요, 댓글, 검색/필터/정렬
- CRUD (본인 게시글/댓글 수정/삭제)

### 게이미피케이션
- **등급 시스템**: Rookie -> Challenger -> Expert -> Master -> Legend
- **배지 시스템**: 업적/활동/특별 배지 (대시보드에서 4개까지 선택 표시)
- **일일 미션**: 5개 미션 (북마크, 댓글, 제출, 팀 신청, 게시글 작성)
- **포인트**: 활동별 포인트 적립 + 히스토리 차트

### 대시보드
- 프로필 편집 (역할, 기술스택, 관심분야)
- AI 프로필 분석 + 대회 추천 (결과 영속)
- 내 대회 관리 (생성/삭제)
- 북마크한 해커톤, 팀 멤버십, 포인트 히스토리
- 제출 통계 차트, 배지 컬렉션, 일일 미션

### 기타
- 통합 검색 (Fuse.js: 대회, 팀, 게시글, 사용자)
- 메시지 시스템 (DM, 팀 신청 알림)
- 실시간 랭킹 (종합/대회/커뮤니티)
- 모니터 (제출 현황)
- 반응형 디자인 (모바일/태블릿/데스크톱)

## 아키텍처

```
사용자 -> Next.js App Router (CSR)
              |
              ├─ Zustand Store ─── localStorage (영속)
              │    (8개 스토어)         (시드 데이터 버전 관리)
              │
              └─ API Routes ──── OpenAI gpt-4o-mini
                   (4개)             (rate limiting)
```

- **서버리스 아키텍처**: 별도 백엔드 없이 localStorage + API Routes로 동작
- **시드 데이터 버전 관리**: `SEED_VERSION`으로 스키마 변경 시 자동 마이그레이션, 커스텀 데이터 보존
- **디자인 시스템**: CSS 변수 기반 토큰 + Tailwind 유틸리티 (docs/designsystem.md)

## AI 도구 활용

이 프로젝트는 AI 도구(Claude)를 활용하여 개발되었습니다.

- **코드 작성**: Claude Code를 사용한 컴포넌트/페이지/API 구현
- **디자인 시스템**: AI 지원으로 색상 토큰, 컴포넌트 패턴 정의
- **코드 리뷰**: AI 기반 보안/품질 리뷰 후 반영
- **최종 코드 기여도**: AI 보조 90% + 수동 검수/피드백 반영

## 문서

- [디자인 시스템](docs/designsystem.md) - 색상 토큰, 타이포그래피, 컴포넌트 패턴
- [UI 개선 계획](docs/ui-refinement-plan.md)
- [참고 스크린샷](docs/screenshots/)
