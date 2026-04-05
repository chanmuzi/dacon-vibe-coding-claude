# DACLAW Design System

이 문서는 DACLAW 프론트엔드의 디자인 규칙을 정의합니다.
모든 UI/프론트엔드 작업 시 이 문서를 참조하세요.

---

## 1. Color Tokens

모든 색상은 `globals.css`의 `@theme` 블록에 CSS 변수로 정의되며,
Tailwind 유틸리티 클래스(`bg-primary`, `text-success` 등)로 사용합니다.

### 1.1 Core Colors

| Token | 용도 | Tailwind class 예시 |
|-------|------|-------------------|
| `--color-primary` | 브랜드 메인 (CTA, 활성 상태, 강조) | `bg-primary`, `text-primary` |
| `--color-primary-light` | Primary의 연한 배경 (hover, 태그, 하이라이트) | `bg-primary-light` |
| `--color-background` | 페이지 전체 배경 | `bg-background` |
| `--color-surface` | 카드, 모달, 패널 배경 | `bg-surface` |
| `--color-border` | 구분선, 카드 테두리 | `border-border` |

### 1.2 Text Colors

| Token | 용도 |
|-------|------|
| `--color-text-primary` | 본문, 제목 (기본 텍스트) |
| `--color-text-secondary` | 보조 텍스트, 메타 정보, placeholder |
| `--color-text-on-primary` | Primary 배경 위 텍스트 (흰색) |

### 1.3 Semantic Colors (상태 표현)

| Token | 용도 | 사용 예시 |
|-------|------|----------|
| `--color-success` | 성공, 완료, 활성 | 완료 배지, 성공 알림 |
| `--color-success-light` | Success 연한 배경 | 성공 배지 배경 |
| `--color-warning` | 주의, 진행 중 | 마감 임박, 보통 난이도 |
| `--color-warning-light` | Warning 연한 배경 | 경고 배지 배경 |
| `--color-error` | 오류, 위험, 어려움 | 에러 메시지, 삭제 |
| `--color-error-light` | Error 연한 배경 | 에러 배지 배경 |
| `--color-info` | 정보, 안내 | 공지, 도움말 |
| `--color-info-light` | Info 연한 배경 | 정보 배지 배경 |

### 1.4 Interactive States (클릭 Affordance)

| Token | 용도 | 사용 예시 |
|-------|------|----------|
| `--color-interactive-hover` | 인터랙티브 요소 hover 배경 | 버튼, 카드, 탭 hover |
| `--color-interactive-active` | 인터랙티브 요소 active/pressed 배경 | 버튼 클릭 시 |
| `--color-interactive-focus` | 포커스 링 색상 | 키보드 네비게이션 |

```
<!-- Interactive element pattern -->
hover:bg-interactive-hover active:bg-interactive-active transition-colors cursor-pointer
```

### 1.5 Type Colors (해커톤 유형)

| Token | 용도 |
|-------|------|
| `--color-type-quantitative` / `--color-type-quantitative-light` | 정량 평가 |
| `--color-type-qualitative` / `--color-type-qualitative-light` | 정성 평가 |
| `--color-type-hybrid` / `--color-type-hybrid-light` | 혼합 평가 |

### 1.6 Grade Colors (사용자 등급)

| Token | 용도 |
|-------|------|
| `--color-grade-rookie` | Rookie 등급 |
| `--color-grade-challenger` | Challenger 등급 |
| `--color-grade-expert` | Expert 등급 |
| `--color-grade-master` | Master 등급 |
| `--color-grade-legend` | Legend 등급 |

---

## 2. Typography

### 2.1 Font Family

| Font | CSS variable | 용도 |
|------|-------------|------|
| Pretendard | `--font-sans` | 본문, UI 전반 |
| JetBrains Mono | `--font-mono` | 숫자, 코드, 카운트다운, 점수 |

### 2.2 Scale

Tailwind 기본 스케일 사용. 주요 패턴:

| 요소 | 클래스 |
|------|--------|
| 페이지 제목 (h1) | `text-2xl font-bold` 또는 `text-4xl font-bold` (Hero) |
| 섹션 제목 (h2) | `text-xl font-bold` 또는 `text-2xl font-bold` |
| 카드 제목 (h3) | `font-semibold` 또는 `font-bold` |
| 본문 | `text-sm` |
| 메타/보조 | `text-xs text-text-secondary` |
| 숫자/점수 | `font-mono font-semibold` |

---

## 3. Spacing & Layout

| 패턴 | 규칙 |
|------|------|
| 페이지 최대폭 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| 페이지 상단 여백 | `py-8` 또는 `py-10` |
| 섹션 간 간격 | `mb-8` ~ `mb-12` |
| 카드 그리드 | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5` |
| 카드 내부 패딩 | `p-4` ~ `p-6` |

---

## 4. Border & Shadow

| 패턴 | 클래스 |
|------|--------|
| 카드 기본 | `border border-border rounded-xl shadow-sm` |
| 카드 모서리 | `rounded-xl` (큰 카드) / `rounded-lg` (작은 요소, 버튼) |
| 카드 hover | `hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200` |
| 모달 | `rounded-2xl shadow-xl` |

---

## 5. Component Patterns

### 5.1 Button

```
<!-- Primary (CTA) -->
px-6 py-3 rounded-lg bg-primary text-text-on-primary font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]

<!-- Secondary (outline) -->
px-6 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-primary-light hover:border-primary-light transition-all duration-200 active:scale-[0.98]

<!-- Filter chip (active) -->
px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-text-on-primary

<!-- Filter chip (inactive) -->
px-3 py-1.5 rounded-lg text-sm font-medium bg-background text-text-secondary hover:text-text-primary hover:bg-interactive-hover cursor-pointer active:scale-[0.98]

<!-- Filter chip (active) -->
px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-text-on-primary shadow-sm cursor-pointer active:scale-[0.98]
```

**Affordance 필수 규칙:**
- 모든 클릭 가능 요소에 `cursor-pointer` 필수
- CTA/필터 버튼: `active:scale-[0.98]`
- 아이콘 버튼: `active:scale-95`
- 비활성 상태: `bg-background` + `hover:bg-interactive-hover` + `hover:text-text-primary` (hover 시 변화 명확)

### 5.2 Card

```
bg-surface border border-border rounded-xl shadow-sm p-6
```

Hover가 필요한 경우:
```
hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200
```

### 5.3 Badge / Tag

```
<!-- Type badge -->
text-xs font-semibold px-2 py-1 rounded-full bg-type-quantitative-light text-type-quantitative

<!-- Tag -->
text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full

<!-- Status badge (active) -->
bg-primary text-text-on-primary text-xs font-semibold px-2 py-1 rounded-full
```

### 5.4 CustomSelect (드롭다운)

native `<select>` 대신 `@/components/CustomSelect` 컴포넌트를 사용합니다.
프로젝트 디자인 토큰과 일관된 스타일을 제공하며, 열릴 때 토글과 드롭다운이 이어져 보입니다.

```tsx
import CustomSelect from '@/components/CustomSelect';

<CustomSelect
  value={value}
  onChange={setValue}
  options={[
    { value: 'all', label: '전체', icon: <Icon /> },  // icon은 선택
    { value: 'option1', label: '옵션 1' },
  ]}
/>
```

| 상태 | 스타일 |
|------|--------|
| 닫힌 상태 | `border border-border rounded-lg bg-surface` |
| 열린 상태 | 토글 `rounded-t-lg rounded-b-none`, 드롭다운 `rounded-b-lg border-t-0` (연결형) |
| 선택된 항목 | `bg-primary-light text-primary font-medium` + 체크마크 |
| hover 항목 | `hover:bg-interactive-hover` |

### 5.5 Toast 알림

간단한 상태 기반 토스트. 2초 후 자동 사라짐.

```tsx
const [toastMessage, setToastMessage] = useState<string | null>(null);
useEffect(() => {
  if (!toastMessage) return;
  const t = setTimeout(() => setToastMessage(null), 2000);
  return () => clearTimeout(t);
}, [toastMessage]);

// 렌더링 (페이지 하단 fixed)
{toastMessage && (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
    <div className="bg-text-primary text-text-on-primary px-5 py-2.5 rounded-lg shadow-xl text-sm font-medium animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {toastMessage}
    </div>
  </div>
)}
```

### 5.6 Dismissible 배너

세션 닫기(X) + 하루 닫기(localStorage) 2단계 dismiss 패턴.

```tsx
// SSR-safe: useState에서 localStorage 읽지 않음
const [show, setShow] = useState(true);
useEffect(() => {
  const dismissed = localStorage.getItem('key');
  if (dismissed === new Date().toISOString().split('T')[0]) setShow(false);
}, []);

// 닫기 애니메이션: opacity + max-h transition (modal-panel 아님)
className={`transition-all duration-200 ease-out ${
  closing ? 'opacity-0 max-h-0' : 'opacity-100 max-h-[200px] animate-in fade-in-0 slide-in-from-top-2 duration-300'
}`}
```

### 5.7 기관 이니셜 아바타

organizer 로고가 없을 때 `hackathon.color` 기반 원형 이니셜 표시.

```tsx
<span
  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-text-on-primary"
  style={{ backgroundColor: hackathon.color || '#6B7280' }}
>
  {(hackathon.organizer || '?')[0]}
</span>
<span className="font-medium text-text-primary truncate">
  {hackathon.organizer || '미지정'}
</span>
```

### 5.8 Input

```
bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary
placeholder:text-text-secondary
focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow
```

### 5.5 Section Header

```html
<div class="flex items-center gap-2 mb-4">
  <LucideIcon class="text-primary" />
  <h2 class="font-semibold text-text-primary">섹션 제목</h2>
</div>
```

---

## 6. Icons

**UI 컴포넌트에서는 Lucide React 아이콘만 사용합니다. Emoji를 아이콘으로 사용하지 마세요.**
브랜딩 자산(파비콘, 앱 아이콘 등)은 예외로 Emoji 사용을 허용합니다.

```tsx
import { Trophy, Users, BarChart3 } from 'lucide-react';

// 크기 가이드
<Icon size={14} />  // 메타 정보 옆 작은 아이콘
<Icon size={16} />  // 버튼 내 아이콘
<Icon size={18} />  // 네비게이션, 섹션 헤더
<Icon size={20} />  // 검색, 주요 액션
<Icon className="w-8 h-8" />  // 큰 일러스트/빈 상태
```

### 6.1 아이콘 매핑 가이드

| 용도 | 아이콘 |
|------|--------|
| 해커톤 | `Trophy` |
| 팀/사용자 | `Users` / `User` |
| 랭킹/통계 | `BarChart3` |
| 커뮤니티/채팅 | `MessageSquare` |
| 대시보드 | `LayoutDashboard` |
| 대회 만들기 | `Target` |
| 검색 | `Search` |
| 캘린더/일정 | `Calendar` |
| 북마크 | `Bookmark` / `BookmarkCheck` |
| 시계/마감 | `Clock` |
| 불꽃/인기 | `Flame` |
| 알림 | `Bell` |

---

## 7. Animation & Transition

CSS 순수 애니메이션 기반. `tw-animate-css` (Tailwind v4 전용)를 사용합니다.
JS 애니메이션 라이브러리(framer-motion 등)는 사용하지 않습니다.

### 7.1 전환 (Transition)

| 패턴 | 클래스 |
|------|--------|
| 카드 hover | `transition-all duration-200` |
| 색상 변화 | `transition-colors` |
| 그림자 변화 | `transition-shadow` |
| 버튼 클릭 피드백 | `transition-all duration-200 active:scale-[0.98]` |
| 아이콘 버튼 클릭 | `transition-all duration-200 active:scale-95` |

### 7.2 페이지 진입 애니메이션 (tw-animate-css)

| 패턴 | 클래스 | 타이밍 |
|------|--------|--------|
| 페이지 진입 | `animate-in fade-in-0 slide-in-from-bottom-2 duration-500` | 500ms |
| 모바일 메뉴 | `animate-in fade-in-0 slide-in-from-top-2 duration-200` | 200ms |

### 7.3 모달/패널 트랜지션 (CSS transition + @starting-style)

모달과 챗봇 팝업은 tw-animate-css 클래스 스왑 대신 **CSS transition**을 사용합니다.
`globals.css`에 정의된 `.modal-overlay` / `.modal-panel` 클래스 + `.entering` 토글 방식.

| 요소 | 열기 | 닫기 | 방식 |
|------|------|------|------|
| 모달 오버레이 | 200ms ease-out | 150ms ease-out | `.modal-overlay.entering` |
| 모달 콘텐츠 | 200ms ease-out (fade+zoom+slide) | 150ms ease-out | `.modal-panel.entering` |
| 챗봇 팝업 | 200ms ease-out | 150ms ease-out | `.modal-panel.entering` |

`@starting-style` 규칙이 초기 마운트 시 트랜지션 시작점을 제공하여 flickering을 방지합니다.

### 7.4 커스텀 keyframes (globals.css)

| 유틸리티 | 용도 |
|---------|------|
| `animate-pulse-dot` | 알림 점 깜박임 (2s) |
| `animate-breathing` | 카드 호흡 효과 (3s) |
| `shimmer` keyframe | Skeleton 로딩 shimmer (1.8s) |

### 7.5 Modal 컴포넌트

모든 모달은 `@/components/Modal` 컴포넌트를 사용합니다.
인라인 overlay div 직접 작성은 금지 — 반드시 이 컴포넌트를 사용하세요.

```tsx
import Modal from '@/components/Modal';

<Modal
  isOpen={show}                    // 필수: 열림 상태
  onClose={() => setShow(false)}   // 필수: 닫기 콜백 (overlay 클릭, ESC, 닫기 버튼)
  maxWidth="max-w-md"              // 선택: 기본 "max-w-sm"
  showCloseButton={true}           // 선택: 기본 true
  zIndex={50}                      // 선택: 기본 50, 중첩 모달은 60+
  className=""                     // 선택: content div에 추가 클래스
>
  {children}
</Modal>
```

---

## 8. Responsive

Mobile-first 접근. 주요 breakpoint:

| Breakpoint | Tailwind prefix | 용도 |
|-----------|----------------|------|
| < 640px | (default) | 모바일 |
| 640px | `sm:` | 작은 태블릿 |
| 768px | `md:` | 태블릿, 네비 전환 |
| 1024px | `lg:` | 데스크톱 |
| 1280px | `xl:` | 와이드 데스크톱 |
