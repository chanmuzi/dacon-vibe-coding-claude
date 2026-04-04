# DACLAW Project Rules

## Next.js 16 주의사항

이 프로젝트는 Next.js 16을 사용합니다. 기존 버전과 breaking changes가 있을 수 있으므로,
코드 작성 전 `daclaw/node_modules/next/dist/docs/`의 관련 가이드를 확인하세요.

## 프로젝트 구조

```
dacon-vibe-coding-claude/        ← git root
├── docs/                        ← 디자인 시스템, 참고 스크린샷
└── daclaw/                      ← Next.js 앱 (Vercel root directory: daclaw)
    ├── src/app/                 ← 페이지 (14개, 동적 라우트 4개 포함)
    ├── src/components/          ← 공통 컴포넌트 (14개, Modal 포함)
    ├── src/data/seed.ts         ← Mock 데이터
    ├── src/store/               ← Zustand 상태관리 (8개 스토어)
    └── src/types/index.ts       ← TypeScript 타입 정의
```

## 대회 심사 기준

| 항목 | 배점 |
|---|---|
| 기본 구현 | 30 |
| 확장/아이디어 | 30 |
| 완성도 | 25 |
| 문서 | 15 |

## 기술 스택

Next.js 16 App Router, TypeScript, Tailwind CSS v4, tw-animate-css, Zustand, Recharts, Fuse.js, react-markdown, rehype-katex

## 데이터 아키텍처

- localStorage 기반 mock 인증 (서버 없음)
- 클라이언트 사이드 시드 데이터 (`src/data/seed.ts`)

## Design System

모든 UI/프론트엔드 작업 전 `docs/designsystem.md`를 반드시 참조하세요.

### 핵심 규칙
- 색상은 `daclaw/src/app/globals.css`의 `@theme` 토큰만 사용 (하드코딩 Tailwind 색상 금지)
- 아이콘은 Lucide React만 사용 (UI 컴포넌트에서 Emoji 아이콘 금지, 파비콘/브랜딩은 예외)
- 새 색상이 필요하면 `globals.css`에 토큰을 추가한 뒤 사용
- 컴포넌트 패턴(Card, Badge, Button 등)은 디자인 시스템 문서의 규격을 따름

### 애니메이션 규칙
- **JS 애니메이션 라이브러리 사용 금지** (framer-motion 등) — CSS 순수 애니메이션만 사용
- 모달은 반드시 `@/components/Modal` 컴포넌트 사용 (인라인 overlay div 금지)
- 모달/패널 진입·퇴장: `globals.css`의 `.modal-panel` + `.modal-overlay` CSS transition 사용
- 페이지 진입 애니메이션: `animate-in fade-in-0 slide-in-from-bottom-2 duration-500` (tw-animate-css)
- 버튼 촉감: CTA 버튼 `active:scale-[0.98]`, 아이콘 버튼 `active:scale-95`
- 타이밍 기준: 모달 열기 200ms, 닫기 150ms, 페이지 진입 500ms (모두 ease-out)

## Agentation Feedback

브라우저에서 Agentation 어노테이션으로 UI 피드백을 받을 수 있습니다.
- `watch_annotations`로 실시간 감지 → 코드 반영 → `resolve`로 완료
