# DACLAW Project Rules

## Next.js 16 주의사항

이 프로젝트는 Next.js 16을 사용합니다. 기존 버전과 breaking changes가 있을 수 있으므로,
코드 작성 전 `daclaw/node_modules/next/dist/docs/`의 관련 가이드를 확인하세요.

## 프로젝트 구조

```
dacon-vibe-coding-claude/        ← git root
├── docs/                        ← 디자인 시스템, 참고 스크린샷
└── daclaw/                      ← Next.js 앱 (Vercel root directory: daclaw)
    ├── src/app/                 ← 페이지 (15개, 동적 라우트 4개 포함)
    ├── src/components/          ← 공통 컴포넌트 (15개, Modal, CustomSelect 포함)
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
- `.map(h => h.field)` 사용 시 `.filter(Boolean)`으로 undefined/null 방어 (localStorage 데이터는 스키마 미보장)
- 시드 데이터 변경 시 `SEED_VERSION`을 올리고, 해당 스토어 `init()`에 버전 체크 로직 필수 (`hackathon`, `community`, `message` 스토어 참고)
- localStorage 필드 접근 시 `??` 대신 `||` 사용 — `??`는 빈 문자열(`''`)을 통과시키므로, `h.organizer || '미지정'` 패턴 사용

## Design System

모든 UI/프론트엔드 작업 전 `docs/designsystem.md`를 반드시 참조하세요.

### 핵심 규칙
- 색상은 `daclaw/src/app/globals.css`의 `@theme` 토큰만 사용 (하드코딩 Tailwind 색상 금지)
- 아이콘은 Lucide React만 사용 (UI 컴포넌트에서 Emoji 아이콘 금지, 파비콘/브랜딩은 예외)
- 새 색상이 필요하면 `globals.css`에 토큰을 추가한 뒤 사용
- 컴포넌트 패턴(Card, Badge, Button 등)은 디자인 시스템 문서의 규격을 따름
- **native `<select>` 사용 금지** → `@/components/CustomSelect` 사용 (디자인 일관성)
- **모든 클릭 가능 요소에 `cursor-pointer` 필수** + `active:scale` 촉감 효과
- **`border-l-*` 왼쪽 줄 카드 스타일 사용 절대 금지** — 카드 강조는 `border` 색상 또는 `bg` 배경색으로만 표현

### 애니메이션 규칙
- **JS 애니메이션 라이브러리 사용 금지** (framer-motion 등) — CSS 순수 애니메이션만 사용
- 모달은 반드시 `@/components/Modal` 컴포넌트 사용 (인라인 overlay div 금지)
- 모달/패널 진입·퇴장: `globals.css`의 `.modal-panel` + `.modal-overlay` CSS transition 사용
- 페이지 진입 애니메이션: `animate-in fade-in-0 slide-in-from-bottom-2 duration-500` (tw-animate-css)
- 버튼 촉감: CTA 버튼 `active:scale-[0.98]`, 아이콘 버튼 `active:scale-95`
- 타이밍 기준: 모달 열기 200ms, 닫기 150ms, 페이지 진입 500ms (모두 ease-out)

## 완료 검증 규칙

작업 완료를 보고하기 전 반드시 아래 체크리스트를 통과해야 합니다:

1. **빌드 검증**: `npx next build` 또는 `npx tsc --noEmit` 성공 확인
2. **런타임 검증**: dev 서버 로그(`daclaw/.next/dev/logs/next-development.log`)에서 에러 없음 확인
3. **접속 검증**: 변경된 페이지에 `curl` 또는 브라우저 접속하여 렌더링 정상 확인
4. **방어 코딩**: localStorage 데이터는 스키마 미보장이므로, 모든 필드 접근 시 optional chaining(`?.`) 또는 fallback 처리
5. **IME 한글 입력 보호**: `onKeyDown`에서 Enter로 전송하는 모든 textarea에 `onCompositionStart/End` + `isComposing` 가드 필수 (한글 조합 중 Enter 시 이중 입력 방지)
6. **Hydration 검증**: `useState` 초기값에서 `typeof window`, `localStorage`, `sessionStorage`, `Date.now()` 등 서버/클라이언트 분기 사용 금지. 브라우저 전용 값은 반드시 `useEffect` 내에서 읽을 것 (SSR 초기값 = 클라이언트 초기값 일치 필수). 네비게이션 `href`에 query param 포함 시 `pathname` 비교 로직과 충돌 가능 — `href`는 경로만, query는 페이지 내부에서 처리.
7. **Hydration 자동 검증**: 변경된 파일에 대해 `grep -n 'useState.*typeof window\|useState.*localStorage\|useState.*sessionStorage\|useState.*Date.now'` 실행하여 위반 패턴 사전 차단. `next build`는 hydration 에러를 잡지 못하므로 코드 패턴 검사가 필수.

빌드만 통과하고 런타임/Hydration 에러가 있는 상태에서 "완료"로 보고하지 말 것.

## Agentation Feedback

브라우저에서 Agentation 어노테이션으로 UI 피드백을 받을 수 있습니다.
- `watch_annotations`로 실시간 감지 → 코드 반영 → `resolve`로 완료
