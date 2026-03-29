'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHackathonStore } from '@/store/hackathon';
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

function getCurrentMonthDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { year, month, firstDay, daysInMonth, today: now.getDate() };
}

export default function HomePage() {
  const { hackathons, isBookmarked, toggleBookmark, initialized, init } =
    useHackathonStore();

  useEffect(() => {
    init();
  }, [init]);

  const activeHackathons = hackathons.filter((h) => h.status === 'active');

  // Find nearest deadline hackathon
  const countdownTarget = activeHackathons
    .filter((h) => new Date(h.endDate).getTime() > Date.now())
    .sort(
      (a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )[0];

  const [timeLeft, setTimeLeft] = useState(
    countdownTarget ? getTimeLeft(countdownTarget.endDate) : null
  );

  useEffect(() => {
    if (!countdownTarget) return;
    setTimeLeft(getTimeLeft(countdownTarget.endDate));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(countdownTarget.endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  // Calendar data
  const { year, month, firstDay, daysInMonth, today } = getCurrentMonthDays();
  const deadlineDates = new Set(
    activeHackathons
      .map((h) => {
        const d = new Date(h.endDate);
        if (d.getFullYear() === year && d.getMonth() === month)
          return d.getDate();
        return null;
      })
      .filter(Boolean) as number[]
  );

  const monthName = new Date(year, month).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  // Build calendar grid (leading empty cells + days)
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

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
          해커톤의 모든 것, <span className="text-primary">DACLAW</span> 🦞
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          해커톤 탐색부터 팀 매칭, 제출, 성장 추적까지 — 참가자와 운영자를 위한 올인원 플랫폼
        </p>

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
          <Link
            href="/hackathons"
            data-testid="explore-hackathons"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-text-on-primary font-medium hover:bg-primary/90 transition-colors"
          >
            <Trophy size={18} />
            해커톤 탐색하기
            <ArrowRight size={16} />
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
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Flame size={22} className="text-primary" /> 진행 중인 해커톤</h2>
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
              {/* Bookmark button (outside Link to prevent nested anchor) */}
              <button
                onClick={() => toggleBookmark(h.slug)}
                aria-label={isBookmarked(h.slug) ? '북마크 해제' : '북마크'}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors"
              >
                {isBookmarked(h.slug) ? (
                  <BookmarkCheck size={16} />
                ) : (
                  <Bookmark size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Quick Links */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold text-text-primary mb-4">빠른 이동</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/rankings', icon: BarChart3, label: '랭킹', desc: '종합 리더보드' },
              { href: '/camp', icon: Users, label: '팀 모집', desc: 'AI 매칭' },
              { href: '/community', icon: MessageSquare, label: '커뮤니티', desc: '토론 & 팁' },
              { href: '/create', icon: Target, label: '대회 만들기', desc: '나만의 대회' },
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

        {/* Mini Calendar */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            <span className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              {monthName}
            </span>
          </h2>
          <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
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
                return (
                  <div
                    key={day}
                    className={`relative text-center text-sm py-1.5 rounded-lg font-mono leading-none
                      ${isToday ? 'bg-primary text-text-on-primary font-bold' : ''}
                      ${isDeadline && !isToday ? 'bg-primary-light text-primary font-semibold' : ''}
                      ${!isToday && !isDeadline ? 'text-text-primary' : ''}
                    `}
                  >
                    {day}
                    {isDeadline && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            {deadlineDates.size > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-secondary">
                <span className="inline-block w-3 h-3 rounded-sm bg-primary-light border border-primary/30" />
                해커톤 마감일
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
