@AGENTS.md

## Design System

모든 UI/프론트엔드 작업 전 `docs/designsystem.md`를 반드시 참조하세요.

### 핵심 규칙
- 색상은 `globals.css`의 `@theme` 토큰만 사용 (하드코딩 Tailwind 색상 금지)
- 아이콘은 Lucide React만 사용 (Emoji를 아이콘으로 사용 금지)
- 새 색상이 필요하면 `globals.css`에 토큰을 추가한 뒤 사용
- 컴포넌트 패턴(Card, Badge, Button 등)은 디자인 시스템 문서의 규격을 따름

## Agentation Feedback

브라우저에서 Agentation 어노테이션으로 UI 피드백을 받을 수 있습니다.
- `watch_annotations`로 실시간 감지 → 코드 반영 → `resolve`로 완료
- 상세 워크플로우는 `docs/ui-refinement-plan.md` 참조
