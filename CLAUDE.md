# DACLAW Project Rules

## Next.js 16 주의사항

이 프로젝트는 Next.js 16을 사용합니다. 기존 버전과 breaking changes가 있을 수 있으므로,
코드 작성 전 `daclaw/node_modules/next/dist/docs/`의 관련 가이드를 확인하세요.

## 프로젝트 구조

```
dacon-vibe-coding-claude/        ← git root
├── docs/                        ← 디자인 시스템, UI 계획, 참고 스크린샷
└── daclaw/                      ← Next.js 앱 (Vercel root directory: daclaw)
    ├── src/app/                 ← 페이지 (10개)
    ├── src/components/          ← 공통 컴포넌트
    ├── src/data/seed.ts         ← Mock 데이터
    ├── src/store/               ← Zustand 상태관리
    └── src/types/index.ts       ← TypeScript 타입 정의
```

## Design System

모든 UI/프론트엔드 작업 전 `docs/designsystem.md`를 반드시 참조하세요.

### 핵심 규칙
- 색상은 `daclaw/src/app/globals.css`의 `@theme` 토큰만 사용 (하드코딩 Tailwind 색상 금지)
- 아이콘은 Lucide React만 사용 (Emoji를 아이콘으로 사용 금지)
- 새 색상이 필요하면 `globals.css`에 토큰을 추가한 뒤 사용
- 컴포넌트 패턴(Card, Badge, Button 등)은 디자인 시스템 문서의 규격을 따름

## Agentation Feedback

브라우저에서 Agentation 어노테이션으로 UI 피드백을 받을 수 있습니다.
- `watch_annotations`로 실시간 감지 → 코드 반영 → `resolve`로 완료
- 상세 워크플로우는 `docs/ui-refinement-plan.md` 참조
