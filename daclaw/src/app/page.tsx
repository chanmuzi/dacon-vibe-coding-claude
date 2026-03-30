'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHackathonStore } from '@/store/hackathon';
import { useCommunityStore } from '@/store/community';
import { useTeamStore } from '@/store/team';
import { useUserStore } from '@/store/user';
import {
  Trophy,
  Users,
  BarChart3,
  Calendar,
  ArrowRight,
  Clock,
  Bookmark,
  BookmarkCheck,
  Flame,
  Target,
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';

function getTimeLeft(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const today =
    now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1;
  return { firstDay, daysInMonth, today };
}

const POST_TYPE_LABEL: Record<string, string> = {
  question: '질문',
  tip: '팁',
  'team-find': '팀 찾기',
  free: '자유',
};

const POST_TYPE_COLOR: Record<string, string> = {
  question: 'bg-type-quantitative/20 text-type-quantitative',
  tip: 'bg-type-qualitative/20 text-type-qualitative',
  'team-find': 'bg-primary/15 text-primary',
  free: 'bg-surface-alt text-text-secondary',
};

export default function HomePage() {
  const { hackathons, isBookmarked, toggleBookmark, initialized, init } =
    useHackathonStore();
  const { posts, initialized: communityInit, init: communityInitFn } =
    useCommunityStore();
  const { teams, initialized: teamInit, init: teamInitFn } = useTeamStore();
  const { isLoggedIn, openAuthModal } = useUserStore();

  useEffect(() => {
    init();
    communityInitFn();
    teamInitFn();
  }, [init, communityInitFn, teamInitFn]);

  const activeHackathons = hackathons.filter((h) => h.status === 'active');
  const [now] = useState(() => Date.now());

  // Find nearest deadline hackathon (L2)
  const imminentHackathon = activeHackathons
    .filter((h) => new Date(h.endDate).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )[0];

  const countdownTarget = imminentHackathon;

  const [timeLeft, setTimeLeft] = useState(
    countdownTarget ? getTimeLeft(countdownTarget.endDate) : null
  );

  useEffect(() => {
    if (!countdownTarget) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(countdownTarget.endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  // E1: Calendar month/year navigation state
  const nowDate = new Date();
  const [calendarYear, setCalendarYear] = useState(nowDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(nowDate.getMonth());

  const { firstDay, daysInMonth, today } = getMonthDays(calendarYear, calendarMonth);

  // E2: Calendar event indicators — both startDate and endDate
  type CalendarEvent = { hackathonTitle: string; color: string };
  const calendarEventsByDay = new Map<number, CalendarEvent[]>();
  hackathons.forEach((h) => {
    const dotColor = h.color || 'var(--color-primary)';
    const addDate = (dateStr: string) => {
      const d = new Date(dateStr);
      if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
        const day = d.getDate();
        const existing = calendarEventsByDay.get(day) ?? [];
        calendarEventsByDay.set(day, [...existing, { hackathonTitle: h.title, color: dotColor }]);
      }
    };
    addDate(h.startDate);
    addDate(h.endDate);
  });

  // E1: dead-line dates for legacy highlight (end dates only)
  const deadlineDates = new Set(
    hackathons
      .map((h) => {
        const d = new Date(h.endDate);
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth)
          return d.getDate();
        return null;
      })
      .filter(Boolean) as number[]
  );

  const monthName = new Date(calendarYear, calendarMonth).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  // E1: navigation handlers
  function prevMonth() {
    if (calendarMonth === 0) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (calendarMonth === 11) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  }

  // Build calendar grid (leading empty cells + days)
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // L1: Top 3 hackathons by participantCount
  const popularHackathons = [...hackathons]
    .sort((a, b) => b.participantCount - a.participantCount)
    .slice(0, 3);

  // L1: Latest 3 community posts
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // L1: 3 open teams
  const openTeams = teams.filter((t) => t.recruitStatus === 'open').slice(0, 3);

  // Bookmark handler with auth gate (F2/B6)
  function handleBookmark(slug: string) {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    toggleBookmark(slug);
  }

  if (!initialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
          해커톤의 모든 것, <span className="text-primary">DACLAW</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-6">
          해커톤 탐색부터 팀 매칭, 제출, 성장 추적까지 — 참가자와 운영자를 위한 올인원 플랫폼
        </p>

        {/* L2: Imminent hackathon highlight */}
        {imminentHackathon && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 mb-4">
              <Flame size={16} className="text-primary" />
              <span className="text-sm font-semibold text-primary">
                {imminentHackathon.title}
              </span>
              {timeLeft && (
                <span className="text-xs text-text-secondary ml-1">
                  D-{timeLeft.days > 0 ? timeLeft.days : '0'} 마감
                </span>
              )}
            </div>
          </div>
        )}

        {/* Countdown Timer */}
        {countdownTarget && timeLeft && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-sm text-text-secondary mb-3">
              <Clock size={14} />
              <span>
                <span className="font-medium text-text-primary">
                  {countdownTarget.title}
                </span>{' '}
                마감까지
              </span>
            </div>
            <div
              data-testid="countdown"
              className="flex justify-center gap-3 sm:gap-5"
            >
              {[
                { label: '일', value: timeLeft.days },
                { label: '시', value: timeLeft.hours },
                { label: '분', value: timeLeft.minutes },
                { label: '초', value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="bg-surface border border-border rounded-xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm min-w-[64px] sm:min-w-[80px]">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-primary leading-none">
                      {pad(value)}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary mt-1.5">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {/* L2: CTA to imminent hackathon */}
          {imminentHackathon && (
            <Link
              href={`/hackathons/${imminentHackathon.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-text-on-primary font-medium hover:bg-primary/90 transition-colors"
            >
              <Trophy size={18} />
              지금 참가하기
              <ArrowRight size={16} />
            </Link>
          )}
          <Link
            href="/hackathons"
            data-testid="explore-hackathons"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-primary-light hover:border-primary-light transition-colors"
          >
            <Trophy size={18} />
            해커톤 탐색하기
          </Link>
          <Link
            href="/camp"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-primary-light hover:border-primary-light transition-colors"
          >
            <Users size={18} />
            팀 찾기
          </Link>
        </div>
      </section>

      {/* Active Hackathons Highlight */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Flame size={22} className="text-primary" /> 진행 중인 해커톤
          </h2>
          <Link
            href="/hackathons"
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            전체보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeHackathons.map((h) => (
            <div key={h.slug} className="relative group">
              <Link
                href={`/hackathons/${h.slug}`}
                data-testid="hackathon-card"
                className="block bg-surface border border-border rounded-xl shadow-sm hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40"
                    style={
                      h.thumbnailUrl
                        ? {
                            backgroundImage: `url(${h.thumbnailUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {}
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                        h.type === 'quantitative'
                          ? 'bg-type-quantitative/90 text-text-on-primary'
                          : h.type === 'qualitative'
                          ? 'bg-type-qualitative/90 text-text-on-primary'
                          : 'bg-type-hybrid/90 text-text-on-primary'
                      }`}
                    >
                      {h.type === 'quantitative'
                        ? '정량 평가'
                        : h.type === 'qualitative'
                        ? '정성 평가'
                        : '혼합 평가'}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
                    {h.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {h.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {h.participantCount}명
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> ~{h.endDate}
                    </span>
                  </div>
                </div>
              </Link>
              {/* Bookmark button (F1, F2, F3) */}
              <button
                onClick={() => handleBookmark(h.slug)}
                title={isBookmarked(h.slug) ? '북마크 해제' : '북마크에 추가'}
                aria-label={isBookmarked(h.slug) ? '북마크 해제' : '북마크에 추가'}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                {isBookmarked(h.slug) ? (
                  <BookmarkCheck size={16} className="fill-current text-primary" />
                ) : (
                  <Bookmark size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* L1: Popular Hackathons */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Trophy size={22} className="text-primary" /> 인기 대회
          </h2>
          <Link
            href="/hackathons"
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            전체보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
          {popularHackathons.map((h) => (
            <Link
              key={h.slug}
              href={`/hackathons/${h.slug}`}
              className="flex-none w-72 bg-surface border border-border rounded-xl p-4 hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-text-primary line-clamp-2 flex-1 mr-2">
                  {h.title}
                </h3>
                <span
                  className={`flex-none inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                    h.status === 'active'
                      ? 'bg-type-qualitative/20 text-type-qualitative'
                      : h.status === 'upcoming'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-alt text-text-secondary'
                  }`}
                >
                  {h.status === 'active' ? '진행 중' : h.status === 'upcoming' ? '예정' : '종료'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {h.participantCount.toLocaleString()}명
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> ~{h.endDate}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* L1: Recent Community Posts */}
      {communityInit && recentPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <MessageSquare size={22} className="text-primary" /> 최근 커뮤니티
            </h2>
            <Link
              href="/community"
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              전체보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href="/community"
                className="block bg-surface border border-border rounded-xl p-4 hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
                      POST_TYPE_COLOR[post.type] ?? 'bg-surface-alt text-text-secondary'
                    }`}
                  >
                    {POST_TYPE_LABEL[post.type] ?? post.type}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary line-clamp-2 mb-2">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
                  <span>{post.authorNickname}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart size={11} /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={11} /> {post.comments.length}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* L1: Active Team Recruitment */}
      {teamInit && openTeams.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Users size={22} className="text-primary" /> 활발한 팀 모집
            </h2>
            <Link
              href="/camp"
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              전체보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {openTeams.map((team) => {
              const relatedHackathon = hackathons.find((h) =>
                team.hackathonSlugs?.includes(h.slug)
              );
              return (
                <Link
                  key={team.id}
                  href="/camp"
                  className="block bg-surface border border-border rounded-xl p-4 hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-text-primary line-clamp-1 flex-1 mr-2">
                      {team.name}
                    </h3>
                    <span className="flex-none inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-type-qualitative/20 text-type-qualitative">
                      모집 중
                    </span>
                  </div>
                  {relatedHackathon && (
                    <p className="text-xs text-text-secondary mb-3 line-clamp-1">
                      {relatedHackathon.title}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Users size={12} />
                    <span>
                      {team.members.length} / {team.maxMembers}명
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Links + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Quick Links (L3) */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold text-text-primary mb-4">빠른 이동</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { href: '/rankings', icon: BarChart3, label: '랭킹', desc: '순위 확인하기' },
              { href: '/camp', icon: Users, label: '팀 모집', desc: 'AI로 팀 매칭' },
              { href: '/community', icon: MessageSquare, label: '커뮤니티', desc: '질문·팁 나누기' },
              { href: '/create', icon: Target, label: '대회 만들기', desc: '직접 주최하기' },
              { href: '/dashboard', icon: LayoutDashboard, label: '내 대시보드', desc: '내 활동 보기' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-surface border border-border rounded-xl p-5 text-center hover:-translate-y-1 hover:border-primary-light hover:shadow-md transition-all duration-200"
              >
                <div className="text-3xl mb-2 flex justify-center">
                  <item.icon size={28} className="text-primary" />
                </div>
                <div className="font-bold text-text-primary text-sm">{item.label}</div>
                <div className="text-xs text-text-secondary mt-1">{item.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Mini Calendar (E1, E2) */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            <span className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              해커톤 일정
            </span>
          </h2>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
            {/* E1: Month navigation header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                aria-label="이전 달"
                className="p-1 rounded-lg hover:bg-primary-light transition-colors text-text-secondary hover:text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-text-primary">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                aria-label="다음 달"
                className="p-1 rounded-lg hover:bg-primary-light transition-colors text-text-secondary hover:text-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-text-secondary py-1"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />;
                }
                const isToday = day === today;
                const isDeadline = deadlineDates.has(day);
                const events = calendarEventsByDay.get(day) ?? [];
                const hasEvents = events.length > 0;
                // Build tooltip text
                const tooltipText = events.map((e) => e.hackathonTitle).join(', ');
                return (
                  <div
                    key={day}
                    title={hasEvents ? tooltipText : undefined}
                    className={`relative text-center text-sm py-1.5 rounded-lg font-mono leading-none cursor-default
                      ${isToday ? 'bg-primary text-text-on-primary font-bold' : ''}
                      ${isDeadline && !isToday ? 'bg-primary-light text-primary font-semibold' : ''}
                      ${!isToday && !isDeadline ? 'text-text-primary' : ''}
                    `}
                  >
                    {day}
                    {/* E2: Colored dots for events */}
                    {hasEvents && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {events.slice(0, 3).map((ev, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full inline-block"
                            style={{ backgroundColor: ev.color }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            {calendarEventsByDay.size > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-secondary">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                해커톤 일정
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
