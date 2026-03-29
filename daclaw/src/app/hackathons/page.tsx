'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutGrid,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Clock,
  Tag,
  Search,
  SlidersHorizontal,
  GitCompare,
  X,
  Trophy,
  Building2,
} from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import type { Hackathon, HackathonStatus, HackathonType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<HackathonType, string> = {
  quantitative: '정량',
  qualitative: '정성',
  hybrid: '혼합',
};

const TYPE_COLORS: Record<HackathonType, string> = {
  quantitative: 'bg-type-quantitative-light text-type-quantitative',
  qualitative: 'bg-type-qualitative-light text-type-qualitative',
  hybrid: 'bg-type-hybrid-light text-type-hybrid',
};

const TYPE_DOT_COLORS: Record<HackathonType, string> = {
  quantitative: 'bg-type-quantitative',
  qualitative: 'bg-type-qualitative',
  hybrid: 'bg-type-hybrid',
};

const TYPE_BAR_COLORS: Record<HackathonType, string> = {
  quantitative: 'bg-type-quantitative',
  qualitative: 'bg-type-qualitative',
  hybrid: 'bg-type-hybrid',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function daysLeft(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const days: (Date | null)[] = [];
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
  return days;
}

function isWithinPeriod(endDate: string, period: string): boolean {
  if (period === 'all') return true;
  const now = new Date();
  const end = new Date(endDate);
  if (period === 'week') {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return end >= now && end <= weekEnd;
  }
  if (period === 'month') {
    const monthEnd = new Date(now);
    monthEnd.setMonth(now.getMonth() + 1);
    return end >= now && end <= monthEnd;
  }
  if (period === '3months') {
    const threeMonthEnd = new Date(now);
    threeMonthEnd.setMonth(now.getMonth() + 3);
    return end >= now && end <= threeMonthEnd;
  }
  return true;
}

// ─── Hackathon Card ───────────────────────────────────────────────────────────

interface HackathonCardProps {
  hackathon: Hackathon;
  bookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  compareSelected: boolean;
  onToggleCompare: (slug: string) => void;
}

function HackathonCard({
  hackathon,
  bookmarked,
  onToggleBookmark,
  compareSelected,
  onToggleCompare,
}: HackathonCardProps) {
  const [hovered, setHovered] = useState(false);
  const remaining = daysLeft(hackathon.endDate);

  let deadlineLabel: string;
  if (hackathon.status === 'ended') {
    deadlineLabel = '종료';
  } else if (hackathon.status === 'upcoming') {
    const d = daysLeft(hackathon.startDate);
    deadlineLabel = d > 0 ? `시작 D-${d}` : '곧 시작';
  } else {
    deadlineLabel = remaining > 0 ? `D-${remaining}` : '마감';
  }

  // K1: Status badge config
  let statusBadge: React.ReactNode = null;
  if (hackathon.status === 'active') {
    statusBadge = (
      <span className="absolute top-3 left-3 bg-success text-text-on-primary text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        진행중
      </span>
    );
  } else if (hackathon.status === 'upcoming') {
    statusBadge = (
      <span className="absolute top-3 left-3 bg-info text-text-on-primary text-xs font-semibold px-2 py-1 rounded-full">
        예정
      </span>
    );
  } else {
    statusBadge = (
      <span className="absolute top-3 left-3 bg-text-secondary text-text-on-primary text-xs font-semibold px-2 py-1 rounded-full">
        종료
      </span>
    );
  }

  function handleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    const { isLoggedIn } = useUserStore.getState();
    if (!isLoggedIn) {
      useUserStore.getState().openAuthModal();
      return;
    }
    onToggleBookmark(hackathon.slug);
  }

  return (
    <div
      data-testid="hackathon-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-surface border border-border rounded-xl shadow-sm hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-background">
        {hackathon.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hackathon.thumbnailUrl}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-border" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* K1: Status badge on top-left overlay */}
        {statusBadge}

        {/* K2: Compare button — hover on desktop, always visible on touch */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleCompare(hackathon.slug);
          }}
          className={`absolute bottom-2 right-2 text-xs font-medium px-2 py-1 rounded-lg transition-all ${
            compareSelected
              ? 'bg-primary text-text-on-primary opacity-100'
              : 'bg-white/80 text-text-primary hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          {compareSelected ? '비교 제거' : '비교에 추가'}
        </button>

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          aria-label={bookmarked ? '북마크 제거' : '북마크 추가'}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4 fill-current text-primary" />
          ) : (
            <Bookmark className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* D4: Organizer info */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          {hackathon.organizerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hackathon.organizerLogo}
              alt={hackathon.organizer}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
          ) : (
            <Building2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">{hackathon.organizer}</span>
        </div>

        <Link href={`/hackathons/${hackathon.slug}`} className="group">
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {hackathon.title}
          </h3>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {hackathon.description}
          </p>
        </Link>

        {/* K1: Type badge in card body */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT_COLORS[hackathon.type]}`} />
          <span className={`text-xs font-medium ${TYPE_COLORS[hackathon.type].split(' ')[1]}`}>
            {TYPE_LABELS[hackathon.type]}
          </span>
        </div>

        {/* Tags */}
        {hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hackathon.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {hackathon.tags.length > 3 && (
              <span className="text-xs text-text-secondary px-1">
                +{hackathon.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="mt-auto flex items-center justify-between text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="font-mono">{hackathon.participantCount.toLocaleString()}</span>명
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {deadlineLabel}
          </span>
          <span className="hidden sm:block">{formatDate(hackathon.endDate)} 마감</span>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

interface CalendarViewProps {
  hackathons: Hackathon[];
}

function CalendarView({ hackathons }: CalendarViewProps) {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const relevantHackathons = useMemo(
    () =>
      hackathons.filter((h) => {
        const start = new Date(h.startDate);
        const end = new Date(h.endDate);
        return start <= monthEnd && end >= monthStart;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hackathons, year, month]
  );

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function getClampedRange(h: Hackathon) {
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    const clampedStart = start < monthStart ? monthStart : start;
    const clampedEnd = end > monthEnd ? monthEnd : end;
    return { startDay: clampedStart.getDate(), endDay: clampedEnd.getDate() };
  }

  return (
    <div data-testid="calendar-view" className="bg-surface border border-border rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          {year}년 {MONTH_NAMES[month]}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-background transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => {
              setYear(today.getFullYear());
              setMonth(today.getMonth());
            }}
            className="px-3 py-1.5 text-sm bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
          >
            오늘
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-background transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-text-secondary py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 border-t border-l border-border">
        {grid.map((date, idx) => {
          const isToday =
            date &&
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          const barsForDay = date
            ? relevantHackathons.filter((h) => {
                const { startDay, endDay } = getClampedRange(h);
                return date.getDate() >= startDay && date.getDate() <= endDay;
              })
            : [];

          return (
            <div
              key={idx}
              className="border-r border-b border-border min-h-[80px] p-1"
            >
              {date && (
                <>
                  <span
                    className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday ? 'bg-primary text-white' : 'text-text-primary'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  <div className="mt-1 flex flex-col gap-0.5">
                    {barsForDay.slice(0, 2).map((h) => {
                      const { startDay } = getClampedRange(h);
                      const isStart = date.getDate() === startDay;
                      return (
                        <button
                          key={h.slug}
                          onClick={() => router.push(`/hackathons/${h.slug}`)}
                          className={`w-full text-left text-[10px] text-white px-1 py-0.5 rounded-sm truncate ${TYPE_BAR_COLORS[h.type]} hover:opacity-80 transition-opacity`}
                          title={h.title}
                        >
                          {isStart ? h.title : '\u00a0'}
                        </button>
                      );
                    })}
                    {barsForDay.length > 2 && (
                      <span className="text-[10px] text-text-secondary px-1">
                        +{barsForDay.length - 2}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {relevantHackathons.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-medium text-text-secondary mb-3">이달의 해커톤</p>
          <div className="flex flex-col gap-2">
            {relevantHackathons.map((h) => (
              <Link
                key={h.slug}
                href={`/hackathons/${h.slug}`}
                className="flex items-center gap-2 text-sm text-text-primary hover:text-primary transition-colors group"
              >
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${TYPE_BAR_COLORS[h.type]}`}
                />
                <span className="truncate group-hover:underline">{h.title}</span>
                <span className="ml-auto text-xs text-text-secondary whitespace-nowrap">
                  {formatDate(h.startDate)} ~ {formatDate(h.endDate)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page (inner — uses useSearchParams) ─────────────────────────────────

type SortKey = 'deadline' | 'newest' | 'participants';
type ViewMode = 'list' | 'calendar';
type PeriodFilter = 'all' | 'week' | 'month' | '3months';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: '전체',
  week: '이번 주',
  month: '이번 달',
  '3months': '3개월',
};

function HackathonsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hackathons, toggleBookmark, isBookmarked, init } = useHackathonStore();

  // E3: View state from URL
  const initialView = (searchParams.get('view') as ViewMode) === 'calendar' ? 'calendar' : 'list';
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  // D1: Multi-select filters
  const [statusFilters, setStatusFilters] = useState<Set<string>>(
    // D2: Default to active + upcoming
    new Set(['active', 'upcoming'])
  );
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());

  // D3: Period filter
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // D4: Organizer filter
  const [organizerFilter, setOrganizerFilter] = useState<string>('all');

  const [tagSearch, setTagSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    init();
  }, [init]);

  // E3: Sync view mode to URL
  function switchView(mode: ViewMode) {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.replace(`?${params.toString()}`);
  }

  // D1: Toggle status filter
  function toggleStatusFilter(key: string) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  // D1: Toggle type filter
  function toggleTypeFilter(key: string) {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleCompare(slug: string) {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        if (next.size >= 3) return prev;
        next.add(slug);
      }
      return next;
    });
  }

  function resetFilters() {
    setStatusFilters(new Set(['active', 'upcoming']));
    setTypeFilters(new Set());
    setPeriodFilter('all');
    setOrganizerFilter('all');
    setTagSearch('');
    setSortKey('deadline');
  }

  // D4: Extract unique organizers
  const organizers = useMemo(() => {
    const set = new Set(hackathons.map((h) => h.organizer));
    return Array.from(set).sort();
  }, [hackathons]);

  const filtered = useMemo(() => {
    let list = [...hackathons];

    // D1: Multi-select status filter
    if (statusFilters.size > 0) {
      list = list.filter((h) => statusFilters.has(h.status));
    }

    // D1: Multi-select type filter
    if (typeFilters.size > 0) {
      list = list.filter((h) => typeFilters.has(h.type));
    }

    // D3: Period filter
    if (periodFilter !== 'all') {
      list = list.filter((h) => isWithinPeriod(h.endDate, periodFilter));
    }

    // D4: Organizer filter
    if (organizerFilter !== 'all') {
      list = list.filter((h) => h.organizer === organizerFilter);
    }

    if (tagSearch.trim()) {
      const q = tagSearch.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.tags.some((t) => t.toLowerCase().includes(q)) ||
          h.title.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortKey === 'deadline') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      if (sortKey === 'newest') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return b.participantCount - a.participantCount;
    });

    return list;
  }, [hackathons, statusFilters, typeFilters, periodFilter, organizerFilter, tagSearch, sortKey]);

  const hasActiveFilters =
    statusFilters.size !== 2 ||
    !statusFilters.has('active') ||
    !statusFilters.has('upcoming') ||
    typeFilters.size > 0 ||
    periodFilter !== 'all' ||
    organizerFilter !== 'all' ||
    tagSearch.trim() !== '';

  const compareArray = Array.from(compareSet);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">해커톤 목록</h1>
            <p className="text-sm text-text-secondary mt-1">
              총{' '}
              <span className="font-mono font-semibold text-primary">
                {hackathons.length}
              </span>
              개의 해커톤
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
            <button
              data-testid="view-toggle-list"
              onClick={() => switchView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-label="카드 보기"
            >
              <LayoutGrid className="w-4 h-4" />
              카드
            </button>
            <button
              data-testid="view-toggle-calendar"
              onClick={() => switchView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-label="캘린더 보기"
            >
              <Calendar className="w-4 h-4" />
              캘린더
            </button>
          </div>
        </div>

        {/* Filters panel */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 mb-6 flex flex-col gap-4">

          {/* D5: Top row — Search (left) + Sort (right) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search input — leftmost */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="태그 또는 제목 검색..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="bg-background border border-border rounded-lg pl-9 pr-9 py-2 text-sm w-full focus:ring-2 focus:ring-primary-light focus:border-primary focus:outline-none text-text-primary placeholder:text-text-secondary"
              />
              {tagSearch && (
                <button
                  onClick={() => setTagSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="검색어 지우기"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* K2: Compare counter badge */}
            {compareSet.size > 0 && (
              <Link
                href={`/compare?slugs=${compareArray.join(',')}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
              >
                <GitCompare className="w-4 h-4" />
                비교하기({compareSet.size})
              </Link>
            )}

            {/* Sort dropdown — rightmost */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-text-secondary hidden sm:block">정렬</span>
              <div className="flex items-center gap-1">
                <button
                  data-testid="sort-deadline"
                  onClick={() => setSortKey('deadline')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortKey === 'deadline'
                      ? 'bg-primary text-text-on-primary'
                      : 'bg-background text-text-secondary hover:bg-interactive-hover'
                  }`}
                >
                  마감임박
                </button>
                <button
                  data-testid="sort-newest"
                  onClick={() => setSortKey('newest')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortKey === 'newest'
                      ? 'bg-primary text-text-on-primary'
                      : 'bg-background text-text-secondary hover:bg-interactive-hover'
                  }`}
                >
                  최신순
                </button>
                <button
                  data-testid="sort-participants"
                  onClick={() => setSortKey('participants')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortKey === 'participants'
                      ? 'bg-primary text-text-on-primary'
                      : 'bg-background text-text-secondary hover:bg-interactive-hover'
                  }`}
                >
                  참가자순
                </button>
              </div>
            </div>
          </div>

          {/* D1/D2: Status filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary flex items-center gap-1 mr-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              상태
            </span>
            {(
              [
                { key: 'active', label: '진행중', testId: 'filter-status-active' },
                { key: 'upcoming', label: '예정', testId: 'filter-status-upcoming' },
                { key: 'ended', label: '종료', testId: 'filter-status-ended' },
              ] as const
            ).map(({ key, label, testId }) => (
              <button
                key={key}
                data-testid={testId}
                onClick={() => toggleStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilters.has(key)
                    ? 'bg-primary text-text-on-primary'
                    : 'bg-background text-text-secondary hover:bg-interactive-hover'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* D1: Type filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary flex items-center gap-1 shrink-0">
              <Tag className="w-3.5 h-3.5" />
              유형
            </span>
            {(
              [
                { key: 'quantitative', label: '정량' },
                { key: 'qualitative', label: '정성' },
                { key: 'hybrid', label: '혼합' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleTypeFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilters.has(key)
                    ? 'bg-primary text-text-on-primary'
                    : 'bg-background text-text-secondary hover:bg-interactive-hover'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* D3 + D4: Period + Organizer dropdowns */}
          <div className="flex items-center gap-3 flex-wrap border-t border-border pt-3">
            {/* D3: Period dropdown */}
            <div className="relative">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                className="appearance-none border border-border rounded-lg bg-surface px-3 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
              >
                {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
                  <option key={key} value={key}>
                    {PERIOD_LABELS[key]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* D4: Organizer dropdown */}
            <div className="relative">
              <select
                value={organizerFilter}
                onChange={(e) => setOrganizerFilter(e.target.value)}
                className="appearance-none border border-border rounded-lg bg-surface px-3 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary cursor-pointer"
              >
                <option value="all">전체 주최</option>
                {organizers.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Result count + reset */}
            <div className="ml-auto flex items-center gap-3 text-xs text-text-secondary">
              <span>
                <span className="font-mono font-semibold text-primary">{filtered.length}</span>
                {' '}/ {hackathons.length} 표시중
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        {viewMode === 'calendar' ? (
          <CalendarView hackathons={filtered} />
        ) : filtered.length === 0 ? (
          <div
            data-testid="empty-state"
            className="bg-surface border border-border rounded-xl shadow-sm p-16 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <Search className="w-8 h-8 text-border" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">
                조건에 맞는 해커톤이 없어요
              </p>
              <p className="text-sm text-text-secondary mt-1">
                필터를 초기화하거나 다른 검색어를 입력해보세요.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="mt-2 px-5 py-2.5 bg-primary text-text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((h) => (
              <HackathonCard
                key={h.slug}
                hackathon={h}
                bookmarked={isBookmarked(h.slug)}
                onToggleBookmark={toggleBookmark}
                compareSelected={compareSet.has(h.slug)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating compare button (shown when 2+ selected) */}
      {compareArray.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <Link
            data-testid="compare-button"
            href={`/compare?slugs=${compareArray.join(',')}`}
            className="pointer-events-auto flex items-center gap-2 bg-primary text-text-on-primary px-6 py-3 rounded-full shadow-xl font-semibold text-sm hover:bg-primary/90 transition-all hover:shadow-2xl hover:scale-105"
          >
            <GitCompare className="w-4 h-4" />
            {compareArray.length}개 해커톤 비교하기
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main Page (exported — wraps inner in Suspense for useSearchParams) ───────

export default function HackathonsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HackathonsPageInner />
    </Suspense>
  );
}
