# UI Refinement Plan (Branch 2: `feat/ui-refinement`)

이 문서는 `feat/design-system-foundation` 머지 후 진행할 UI 개선 작업의 상세 명세입니다.
새 세션에서 이 문서를 읽고 작업을 시작하세요.

---

## 배경

- `feat/daclaw-web`에서 10개 페이지 초기 구현 완료
- 디자인 토큰은 `globals.css`에 정의되어 있으나, 많은 곳에서 하드코딩된 Tailwind 색상 사용
- Emoji가 아이콘으로 혼용됨
- 반복 UI 패턴이 컴포넌트로 추출되지 않음
- 디자인 시스템 규칙은 `docs/designsystem.md` 참조

---

## 작업 1: 하드코딩 색상 → 디자인 토큰 전환

총 **15개 파일, 106건**의 하드코딩된 Tailwind 색상 클래스를 디자인 토큰 기반으로 전환.

### 전환 매핑

| 기존 하드코딩 | → 토큰 기반 |
|-------------|------------|
| `bg-blue-500`, `bg-blue-100`, `text-blue-700` | `bg-type-quantitative`, `bg-type-quantitative-light`, `text-type-quantitative` |
| `bg-purple-500`, `bg-purple-100`, `text-purple-700` | `bg-type-qualitative`, `bg-type-qualitative-light`, `text-type-qualitative` |
| `bg-amber-500`, `bg-amber-100`, `text-amber-700` | `bg-type-hybrid`, `bg-type-hybrid-light`, `text-type-hybrid` |
| `text-emerald-600`, `bg-emerald-50` | `text-success`, `bg-success-light` |
| `text-amber-600`, `bg-amber-50` | `text-warning`, `bg-warning-light` |
| `text-red-600`, `bg-red-50` | `text-error`, `bg-error-light` |
| `bg-yellow-400`, `text-yellow-400` | `text-warning` (북마크 활성 등) |
| `hover:bg-gray-50`, `placeholder:text-gray-400` | `hover:bg-background`, `placeholder:text-text-secondary` |

### 파일별 작업 (건수 많은 순)

1. `src/app/dashboard/page.tsx` — 15건
2. `src/app/monitor/page.tsx` — 19건
3. `src/app/hackathons/[slug]/page.tsx` — 13건
4. `src/app/create/page.tsx` — 8건
5. `src/app/hackathons/page.tsx` — 7건
6. `src/app/rankings/page.tsx` — 7건
7. `src/app/community/page.tsx` — 5건
8. `src/app/compare/page.tsx` — 3건
9. `src/app/page.tsx` — 3건
10. `src/app/camp/page.tsx` — 3건
11. `src/components/layout/Navigation.tsx` — 5건
12. `src/components/GlobalSearch.tsx` — 1건
13. `src/components/QAChatbot.tsx` — 1건
14. `src/data/seed.ts` — 5건 (gradeConfig의 color 필드)

---

## 작업 2: Emoji → Lucide 아이콘 교체

### UI 내 Emoji (~10건)

| 파일 | 위치 | 기존 | → 대체 |
|------|------|------|--------|
| `Navigation.tsx:45` | 로고 | `🦞` | 커스텀 SVG 또는 `Crab` (lucide) — 디자인 논의 필요 |
| `page.tsx:111` | Hero 제목 | `🦞` | 로고와 동일하게 |
| `page.tsx:175` | 섹션 제목 | `🔥` | `Flame` (lucide) |
| `page.tsx:268` | 빠른 이동 | `💬` | `MessageSquare` (lucide) |
| `page.tsx:269` | 빠른 이동 | `🎯` | `Target` (lucide) |
| `camp/page.tsx:241` | 역할 필터 | `✅` | `Check` (lucide) 또는 CSS 스타일 |

### seed.ts 데이터 내 Emoji (~15건)

| 필드 | 기존 | → 대체 방안 |
|------|------|-----------|
| TeamMember.avatar | `🚀📊💬📋` 등 | Lucide 아이콘 이름 문자열로 변경 후 렌더링 시 매핑 |
| Badge.icon | `🎯👑🏆🔥🎪💬` 등 | Lucide 아이콘 이름 문자열로 변경 |
| gradeConfig.icon | `👑🏆` 등 | Lucide 아이콘 이름 문자열로 변경 |

**주의:** avatar/icon을 Lucide 이름 문자열로 바꿀 경우, 렌더링 컴포넌트(아이콘 매퍼)가 필요함.

---

## 작업 3: 공통 컴포넌트 추출

현재 각 페이지에 인라인으로 반복되는 UI 패턴:

### 추출 후보

| 컴포넌트 | 사용처 | 현재 상태 |
|---------|--------|----------|
| `TypeBadge` | hackathons, detail, compare, home | 각 페이지에 색상 매핑 중복 |
| `StatusBadge` | hackathons, detail, dashboard | inline 조건부 스타일 |
| `FilterChipGroup` | hackathons, camp, community, rankings | 동일 패턴 반복 (active/inactive 스타일) |
| `PageHeader` | 모든 페이지 | `max-w-7xl mx-auto` + 제목 + 설명 패턴 |
| `EmptyState` | hackathons, community | 빈 결과 UI |
| `SectionCard` | dashboard (이미 존재하나 지역적) | dashboard 외 확장 가능 |
| `IconMapper` | 전역 | seed.ts emoji → Lucide 렌더링용 |

---

## 작업 4: Agentation 피드백 기반 페이지별 개선

`npm run dev` 실행 후 브라우저에서 Agentation으로 페이지별 어노테이션을 남기면,
`watch_annotations`로 수신하여 즉시 반영하는 루프.

### 워크플로우
1. `npm run dev` 실행
2. 브라우저에서 각 페이지 방문하며 어노테이션 작성
3. Claude가 `watch_annotations`로 감지
4. 피드백 반영 후 `resolve`로 완료 처리
5. 반복

### 우선 확인 페이지 (hot path 기준)
1. `hackathons/[slug]/page.tsx` (9x 접근)
2. `create/page.tsx` (8x 접근)
3. `camp/page.tsx` (7x 접근)
4. `page.tsx` (홈)
5. `hackathons/page.tsx`
6. `dashboard/page.tsx`

---

## 작업 순서 권장

1. 작업 3 (공통 컴포넌트 추출) — 기반이 되므로 먼저
2. 작업 1 (색상 토큰화) — 추출된 컴포넌트에 적용
3. 작업 2 (Emoji 교체) — IconMapper와 함께
4. 작업 4 (Agentation 피드백) — 전체 다듬기
