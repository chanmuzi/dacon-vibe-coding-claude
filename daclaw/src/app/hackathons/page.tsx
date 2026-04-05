'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
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
import CustomSelect from '@/components/CustomSelect';
import type { Hackathon, HackathonType } from '@/types';

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
  onToast?: (msg: string) => void;
}

function HackathonCard({
  hackathon,
  bookmarked,
  onToggleBookmark,
  compareSelected,
  onToggleCompare,
  onToast,
}: HackathonCardProps) {
  const [, setHovered] = useState(false);
  const remaining = daysLeft(hackathon.endDate);

  let deadlineLabel: string;
  if (hackathon.status === 'ended') {
    deadlineLabel = '종료';
  } else if (hackathon.status === 'upcoming') {
    const d = daysLeft(hackathon.startDate);
    deadlineLabel = d > 0 ? `${formatDate(hackathon.startDate)} 시작` : '오늘 시작';
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
    onToast?.(bookmarked ? '북마크가 해제되었습니다' : '북마크에 추가되었습니다');
  }

  return (
    <div
      data-testid="hackathon-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-surface border border-border rounded-xl shadow-sm hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Thumbnail — entire image is clickable */}
      <Link href={`/hackathons/${hackathon.slug}`} className="relative h-40 overflow-hidden bg-background block group/thumb">
        {hackathon.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hackathon.thumbnailUrl}
            alt={hackathon.title}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-border" />
          </div>
        )}

        {/* Color-tinted gradient overlay — unique per hackathon */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${hackathon.color || '#6B7280'}90, ${hackathon.color || '#6B7280'}20 50%, transparent)`,
          }}
        />

        {/* K1: Status badge on top-left overlay */}
        {statusBadge}

        {/* K2: Compare button — hover on desktop, always visible on touch */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCompare(hackathon.slug);
          }}
          className={`absolute bottom-2 right-2 text-xs font-medium px-2 py-1 rounded-lg transition-all cursor-pointer ${
            compareSelected
              ? 'bg-primary text-text-on-primary opacity-100'
              : 'bg-white/80 text-text-primary hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          {compareSelected ? '비교 제거' : '비교에 추가'}
        </button>

        {/* Bookmark button — enhanced visibility */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBookmark(e);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all cursor-pointer active:scale-95 ${
            bookmarked
              ? 'bg-primary text-white shadow-md'
              : 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm'
          }`}
          aria-label={bookmarked ? '북마크 제거' : '북마크 추가'}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* D4: Organizer info — prominent with initial avatar */}
        <div className="flex items-center gap-2 text-xs">
          {hackathon.organizerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hackathon.organizerLogo}
              alt={hackathon.organizer || '주최'}
              className="w-5 h-5 rounded-full object-contain shrink-0"
            />
          ) : (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-text-on-primary shrink-0"
              style={{ backgroundColor: hackathon.color || '#6B7280' }}
            >
              {(hackathon.organizer || '?')[0]}
            </span>
          )}
          <span className="font-medium text-text-primary truncate">{hackathon.organizer || '미지정'}</span>
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
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [highlightedSlugs, setHighlightedSlugs] = useState<Set<string>>(new Set());
  const legendRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

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

  function clearHighlights() {
    setHighlightedSlugs(new Set());
  }

  function prevMonth() {
    clearHighlights();
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    clearHighlights();
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

  // Toggle single hackathon highlight
  function handleBarClick(slug: string) {
    setHighlightedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setTimeout(() => {
      legendRefs.current[slug]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  // Toggle all hackathons for a day (used by "+N" overflow)
  function handleDayClick(slugs: string[]) {
    setHighlightedSlugs((prev) => {
      const allSelected = slugs.every((s) => prev.has(s));
      const next = new Set(prev);
      if (allSelected) {
        slugs.forEach((s) => next.delete(s));
      } else {
        slugs.forEach((s) => next.add(s));
      }
      return next;
    });
    setTimeout(() => {
      legendRefs.current[slugs[0]]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
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
            className="p-2 rounded-lg hover:bg-background transition-colors cursor-pointer active:scale-95"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => {
              setYear(today.getFullYear());
              setMonth(today.getMonth());
              clearHighlights();
            }}
            className="px-3 py-1.5 text-sm bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium cursor-pointer active:scale-[0.98]"
          >
            오늘
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-background transition-colors cursor-pointer active:scale-95"
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

      {/* Day grid — all events use consistent bar style */}
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
              className={`border-r border-b border-border min-h-[80px] p-1 transition-colors ${
                barsForDay.length > 0 ? 'hover:bg-primary-light/30' : ''
              }`}
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

                  {/* Continuous strip bars — edge-to-edge for visual continuity */}
                  <div className="mt-1 flex flex-col gap-0.5 -mx-1">
                    {[...barsForDay]
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .slice(0, 3).map((h) => {
                      const realStart = new Date(h.startDate);
                      const realEnd = new Date(h.endDate);
                      const isFirstDay = realStart.getFullYear() === year && realStart.getMonth() === month && realStart.getDate() === date.getDate();
                      const isLastDay = realEnd.getFullYear() === year && realEnd.getMonth() === month && realEnd.getDate() === date.getDate();
                      const isMonthStart = date.getDate() === 1 && realStart < monthStart;
                      const isHL = highlightedSlugs.has(h.slug);
                      const roundL = isFirstDay || isMonthStart ? 'rounded-l-sm ml-1' : '';
                      const roundR = isLastDay ? 'rounded-r-sm mr-1' : '';
                      return (
                        <button
                          key={h.slug}
                          onClick={() => handleBarClick(h.slug)}
                          className={`w-full text-left text-[10px] text-white py-0.5 truncate hover:opacity-80 transition-all cursor-pointer ${roundL} ${roundR} ${
                            isHL ? 'ring-2 ring-primary ring-offset-1' : ''
                          }`}
                          style={{ backgroundColor: h.color || '#6B7280' }}
                          title={`${h.title} — 클릭하면 아래 목록에서 확인`}
                        >
                          {isFirstDay ? <span className="pl-1">{h.title}</span> : '\u00a0'}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend — hackathons for this month, with multi-highlight */}
      {relevantHackathons.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-medium text-text-secondary mb-3">
            이달의 해커톤
            {highlightedSlugs.size > 0 && (
              <button
                onClick={clearHighlights}
                className="ml-2 text-primary hover:underline cursor-pointer"
              >
                선택 해제 ({highlightedSlugs.size})
              </button>
            )}
          </p>
          <div className="flex flex-col gap-1">
            {relevantHackathons.map((h) => {
              const isHL = highlightedSlugs.has(h.slug);
              return (
                <Link
                  key={h.slug}
                  href={`/hackathons/${h.slug}`}
                  ref={(el) => { legendRefs.current[h.slug] = el; }}
                  className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 -mx-1 transition-all group ${
                    isHL
                      ? 'bg-interactive-hover text-primary font-semibold'
                      : 'text-text-primary hover:bg-interactive-hover'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isHL ? 'scale-125' : ''
                    } transition-transform`}
                    style={{ backgroundColor: h.color || '#6B7280' }}
                  />
                  <span className="truncate group-hover:underline">{h.title}</span>
                  <span className="ml-auto text-xs text-text-secondary whitespace-nowrap">
                    {formatDate(h.startDate)} ~ {formatDate(h.endDate)}
                  </span>
                </Link>
              );
            })}
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

  // E3: View state from URL — sync with searchParams changes (e.g. nav click resets query)
  const initialView = (searchParams.get('view') as ViewMode) === 'calendar' ? 'calendar' : 'list';
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  useEffect(() => {
    const urlView = searchParams.get('view') as ViewMode | null;
    setViewMode(urlView === 'calendar' ? 'calendar' : 'list');
  }, [searchParams]);

  // D1: Multi-select filters
  const [statusFilters, setStatusFilters] = useState<Set<string>>(
    // D2: Default to active + upcoming
    new Set(['active', 'upcoming'])
  );
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [bookmarkOnly, setBookmarkOnly] = useState(false);

  // Toast notification for bookmark
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // D3: Period filter
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // D4: Organizer filter
  const [organizerFilter, setOrganizerFilter] = useState<string>('all');

  // Featured banner dismiss — two modes: session close vs day-long hide
  // Initialize as true (SSR-safe), then check localStorage after hydration
  const [showFeatured, setShowFeatured] = useState(true);
  const [featuredClosing, setFeaturedClosing] = useState(false);

  useEffect(() => {
    const dismissedDate = localStorage.getItem('daclaw-featured-dismissed-date');
    if (dismissedDate === new Date().toISOString().split('T')[0]) {
      setShowFeatured(false);
    }
  }, []);

  // Close for this session only (refresh brings it back)
  function closeFeatured() {
    setFeaturedClosing(true);
    setTimeout(() => setShowFeatured(false), 200);
  }

  // Hide for the entire day (localStorage)
  function dismissFeaturedForDay() {
    setFeaturedClosing(true);
    setTimeout(() => {
      setShowFeatured(false);
      localStorage.setItem('daclaw-featured-dismissed-date', new Date().toISOString().split('T')[0]);
    }, 200);
  }

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
    setBookmarkOnly(false);
    setTagSearch('');
    setSortKey('deadline');
  }

  // D4: Extract unique organizers
  const organizers = useMemo(() => {
    const set = new Set(hackathons.map((h) => h.organizer).filter(Boolean));
    return Array.from(set).sort();
  }, [hackathons]);

  // Featured: most popular active hackathon for recommendation banner
  const featured = useMemo(() => {
    const active = hackathons.filter((h) => h.status === 'active');
    if (active.length === 0) return null;
    return [...active].sort((a, b) => b.participantCount - a.participantCount)[0];
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

    // Bookmark filter
    if (bookmarkOnly) {
      list = list.filter((h) => isBookmarked(h.slug));
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
  }, [hackathons, statusFilters, typeFilters, periodFilter, organizerFilter, tagSearch, sortKey, bookmarkOnly, isBookmarked]);

  const hasActiveFilters =
    statusFilters.size !== 2 ||
    !statusFilters.has('active') ||
    !statusFilters.has('upcoming') ||
    typeFilters.size > 0 ||
    periodFilter !== 'all' ||
    organizerFilter !== 'all' ||
    tagSearch.trim() !== '' ||
    bookmarkOnly;

  const compareArray = Array.from(compareSet);

  return (
    <div className="min-h-screen bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-4 flex items-center justify-between gap-4 bg-surface border border-border rounded-xl shadow-sm px-5 py-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">해커톤 목록</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              총{' '}
              <span className="font-mono font-semibold text-primary">
                {hackathons.length}
              </span>
              개의 해커톤
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <button
              data-testid="view-toggle-list"
              onClick={() => switchView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
              }`}
              aria-label="카드 보기"
            >
              <LayoutGrid className="w-4 h-4" />
              카드
            </button>
            <button
              data-testid="view-toggle-calendar"
              onClick={() => switchView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                viewMode === 'calendar'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                    sortKey === 'deadline'
                      ? 'bg-primary text-text-on-primary shadow-sm'
                      : 'bg-background text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                  }`}
                >
                  마감임박
                </button>
                <button
                  data-testid="sort-newest"
                  onClick={() => setSortKey('newest')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                    sortKey === 'newest'
                      ? 'bg-primary text-text-on-primary shadow-sm'
                      : 'bg-background text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                  }`}
                >
                  최신순
                </button>
                <button
                  data-testid="sort-participants"
                  onClick={() => setSortKey('participants')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                    sortKey === 'participants'
                      ? 'bg-primary text-text-on-primary shadow-sm'
                      : 'bg-background text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                  }`}
                >
                  참가자순
                </button>
              </div>
            </div>
          </div>

          {/* D1/D2: Status filter chips + bookmark toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary flex items-center gap-1 mr-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              상태
            </span>
            <button
              onClick={() => setBookmarkOnly((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                bookmarkOnly
                  ? 'bg-primary text-text-on-primary shadow-sm'
                  : 'bg-background text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
              }`}
            >
              {bookmarkOnly ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              북마크
            </button>
            <div className="w-px h-5 bg-border mx-1" />
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  statusFilters.has(key)
                    ? 'bg-primary text-text-on-primary shadow-sm'
                    : 'bg-background text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  typeFilters.has(key)
                    ? 'bg-primary text-text-on-primary shadow-sm'
                    : 'bg-background text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* D3 + D4: Period + Organizer custom dropdowns */}
          <div className="flex items-center gap-3 flex-wrap border-t border-border pt-3">
            {/* D3: Period dropdown */}
            <CustomSelect
              value={periodFilter}
              onChange={(v) => setPeriodFilter(v as PeriodFilter)}
              options={(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => ({
                value: key,
                label: PERIOD_LABELS[key],
                icon: <Clock className="w-3.5 h-3.5 text-text-secondary shrink-0" />,
              }))}
            />

            {/* D4: Organizer dropdown with initial avatars */}
            <CustomSelect
              value={organizerFilter}
              onChange={setOrganizerFilter}
              options={[
                { value: 'all', label: '전체 주최', icon: <Building2 className="w-3.5 h-3.5 text-text-secondary shrink-0" /> },
                ...organizers.map((org) => {
                  const color = hackathons.find((h) => h.organizer === org)?.color ?? '#6B7280';
                  return {
                    value: org,
                    label: org,
                    icon: (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {org[0]}
                      </span>
                    ),
                  };
                }),
              ]}
            />

            {/* Result count + reset */}
            <div className="ml-auto flex items-center gap-3 text-xs text-text-secondary">
              <span>
                <span className="font-mono font-semibold text-primary">{filtered.length}</span>
                {' '}/ {hackathons.length} 표시중
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <X className="w-3 h-3" />
                  필터 초기화
                </button>
              )}
              {featured && !showFeatured && (
                <button
                  onClick={() => {
                    setShowFeatured(true);
                    setFeaturedClosing(false);
                    localStorage.removeItem('daclaw-featured-dismissed-date');
                  }}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <Trophy className="w-3 h-3" />
                  추천 대회 보기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Featured hackathon — below filters, compact dismissible card */}
        {featured && showFeatured && (
          <div
            className={`mb-6 bg-surface border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200 ease-out ${
              featuredClosing
                ? 'opacity-0 max-h-0 mb-0 border-0'
                : 'opacity-100 max-h-[200px] animate-in fade-in-0 slide-in-from-top-2 duration-300'
            }`}
          >
            <div className="flex items-stretch">
              {featured.thumbnailUrl && (
                <Link
                  href={`/hackathons/${featured.slug}`}
                  className="hidden sm:block w-40 shrink-0 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              )}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-warning text-text-on-primary px-2 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3" />
                        추천
                      </span>
                      <span className="text-xs text-text-secondary">{featured.organizer || ''}</span>
                    </div>
                    <Link href={`/hackathons/${featured.slug}`} className="text-base font-bold text-text-primary hover:text-primary transition-colors truncate block">
                      {featured.title}
                    </Link>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-1">{featured.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={dismissFeaturedForDay} className="px-2 py-1 rounded-lg text-[11px] text-text-secondary hover:text-text-primary hover:bg-interactive-hover transition-colors cursor-pointer active:scale-[0.98] whitespace-nowrap" title="오늘 하루 동안 숨기기">
                      오늘 그만 보기
                    </button>
                    <button onClick={closeFeatured} className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-interactive-hover transition-colors cursor-pointer active:scale-95" aria-label="닫기" title="닫기 (새로고침 시 다시 표시)">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Users className="w-3.5 h-3.5" />
                    {featured.participantCount.toLocaleString()}명
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(featured.endDate)} 마감
                  </span>
                  <Link href={`/hackathons/${featured.slug}`} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-[0.98] cursor-pointer shadow-sm">
                    참여하기
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
              className="mt-2 px-5 py-2.5 bg-primary text-text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer active:scale-[0.98]"
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
                onToast={setToastMessage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="pointer-events-auto bg-text-primary text-text-on-primary px-5 py-2.5 rounded-lg shadow-xl text-sm font-medium animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {toastMessage}
          </div>
        </div>
      )}

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
