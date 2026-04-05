'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { Sparkles, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import Modal from '@/components/Modal';
import { useUserStore } from '@/store/user';
import { useHackathonStore } from '@/store/hackathon';
import { ROLE_LABELS } from '@/lib/constants';

// ─── Constants ────────────────────────────────────────────────────────────────

export const ANALYSIS_KEY = 'ai_analysis_last_date';
export const ANALYSIS_RESULT_KEY = 'daclaw-ai-analysis-result';
export const ANALYSIS_HACKATHONS_KEY = 'daclaw-ai-analysis-hackathons';

// ─── Fallback Analysis ────────────────────────────────────────────────────────

export function getFallbackAnalysis(
  user: NonNullable<ReturnType<typeof useUserStore.getState>['user']>,
  hackathons: ReturnType<typeof useHackathonStore.getState>['hackathons'],
): string {
  const active = hackathons.filter((h) => h.status === 'active');
  const matched = active.filter((h) =>
    h.tags.some(
      (tag) =>
        user.techStack.some((t) => tag.toLowerCase().includes(t.toLowerCase())) ||
        user.interests.some((i) => tag.toLowerCase().includes(i.toLowerCase())),
    ),
  );

  let text = `### 프로필 요약\n${ROLE_LABELS[user.role] || user.role} · ${user.grade} 등급 (${user.points}pt)\n- 기술: ${user.techStack.join(', ') || '미설정'}\n- 관심: ${user.interests.join(', ') || '미설정'}\n\n`;

  if (matched.length > 0) {
    text += `### 추천 대회\n`;
    matched.slice(0, 3).forEach((h, i) => {
      text += `${i + 1}. **${h.title}**\n   - 태그: ${h.tags.join(', ')}\n   - 마감: ${h.endDate}\n\n`;
    });
  } else if (active.length > 0) {
    text += `### 현재 진행 중인 대회\n`;
    active.slice(0, 3).forEach((h, i) => {
      text += `${i + 1}. **${h.title}** (마감: ${h.endDate})\n`;
    });
    text += `\n> 프로필의 기술 스택과 관심 분야를 설정하면 더 정확한 추천을 받을 수 있습니다.\n`;
  }

  text += `\n### 성장 조언\n꾸준한 대회 참여와 커뮤니티 활동으로 포인트를 쌓아보세요!`;
  return text;
}

// ─── AI Analysis Modal ────────────────────────────────────────────────────────

export function AIAnalysisModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useUserStore();
  const { hackathons } = useHackathonStore();
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'result' | 'error' | 'limit'>('confirm');
  const [result, setResult] = useState<string | null>(null);
  const [matchedHackathons, setMatchedHackathons] = useState<{ slug: string; title: string }[]>([]);

  // 하루 1회 제한 확인
  const isUsedToday = useCallback(() => {
    const last = localStorage.getItem(ANALYSIS_KEY);
    return last === new Date().toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 저장된 결과가 있으면 바로 result phase로
      const savedResult = localStorage.getItem(ANALYSIS_RESULT_KEY);
      if (savedResult) {
        setResult(savedResult);
        try {
          const savedHackathons = JSON.parse(localStorage.getItem(ANALYSIS_HACKATHONS_KEY) || '[]');
          setMatchedHackathons(savedHackathons);
        } catch {
          setMatchedHackathons([]);
        }
        setPhase('result');
      } else {
        setPhase(isUsedToday() ? 'limit' : 'confirm');
        setResult(null);
        setMatchedHackathons([]);
      }
    }
  }, [isOpen, isUsedToday]);

  function runAnalysis() {
    if (!user) return;
    if (isUsedToday()) {
      setPhase('limit');
      return;
    }
    setPhase('loading');

    const activeHackathons = hackathons.filter((h) => h.status === 'active' || h.status === 'upcoming');

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          role: user.role,
          techStack: user.techStack,
          interests: user.interests,
          grade: user.grade,
          points: user.points,
          badges: user.badges,
        },
        hackathons: activeHackathons.map((h) => ({
          title: h.title,
          type: h.type,
          status: h.status,
          tags: h.tags,
          endDate: h.endDate,
          description: h.description,
        })),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.error === 'NO_API_KEY') {
            const fallback = getFallbackAnalysis(user, hackathons);
            setResult(fallback);
            // 추천 대회 slug 매칭
            const matched = hackathons
              .filter((h) => fallback.includes(h.title))
              .map((h) => ({ slug: h.slug, title: h.title }));
            setMatchedHackathons(matched);
            localStorage.setItem(ANALYSIS_RESULT_KEY, fallback);
            localStorage.setItem(ANALYSIS_HACKATHONS_KEY, JSON.stringify(matched));
            setPhase('result');
            localStorage.setItem(ANALYSIS_KEY, new Date().toISOString().split('T')[0]);
            return;
          }
          throw new Error('분석 요청 실패');
        }
        const data = await res.json();
        setResult(data.result);
        const matched = hackathons
          .filter((h) => (data.result as string).includes(h.title))
          .map((h) => ({ slug: h.slug, title: h.title }));
        setMatchedHackathons(matched);
        localStorage.setItem(ANALYSIS_RESULT_KEY, data.result);
        localStorage.setItem(ANALYSIS_HACKATHONS_KEY, JSON.stringify(matched));
        setPhase('result');
        localStorage.setItem(ANALYSIS_KEY, new Date().toISOString().split('T')[0]);
      })
      .catch(() => setPhase('error'));
  }

  // "다시 분석하기" handler
  function handleReAnalyze() {
    if (isUsedToday()) {
      // 오늘 이미 분석했으면 하루 제한이므로 confirm 대신 limit
      setPhase('limit');
    } else {
      setPhase('confirm');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-text-primary">AI 프로필 분석</h3>
      </div>

      {/* 확인 단계 */}
      {phase === 'confirm' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm text-text-primary font-medium mb-1">현재 프로필을 분석하여 맞춤 대회를 추천합니다</p>
            <p className="text-xs text-text-secondary">기술 스택, 관심 분야, 활동 기록을 기반으로 분석합니다</p>
            <p className="text-xs text-text-secondary mt-1">(하루 1회 이용 가능)</p>
          </div>
          <button
            onClick={runAnalysis}
            className="px-6 py-2 bg-primary text-text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            분석 시작하기
          </button>
        </div>
      )}

      {/* 분석 중 */}
      {phase === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-secondary">프로필을 분석하고 있습니다...</p>
        </div>
      )}

      {/* 하루 제한 */}
      {phase === 'limit' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
          <p className="text-sm text-text-primary font-medium">오늘은 이미 분석을 진행했습니다</p>
          <p className="text-xs text-text-secondary">내일 다시 이용할 수 있습니다</p>
        </div>
      )}

      {/* 에러 */}
      {phase === 'error' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-error">분석 중 오류가 발생했습니다.</p>
          <button
            onClick={runAnalysis}
            className="text-xs text-primary hover:underline cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 결과 */}
      {phase === 'result' && result && (
        <div>
          <div className="prose-content text-sm text-text-primary leading-relaxed max-h-96 overflow-y-auto mb-4 bg-background rounded-xl p-4">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{result}</ReactMarkdown>
          </div>

          {/* 추천 대회 바로가기 */}
          {matchedHackathons.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-text-secondary mb-2">추천 대회 바로가기</p>
              <div className="flex flex-col gap-2">
                {matchedHackathons.map((h) => (
                  <a
                    key={h.slug}
                    href={`/hackathons/${h.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary-light/20 transition-all group cursor-pointer"
                  >
                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors truncate">{h.title}</span>
                    <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-primary shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 다시 분석하기 */}
          <div className="border-t border-border pt-3 mt-3 text-center">
            <button
              onClick={handleReAnalyze}
              className="text-xs text-text-secondary hover:text-primary cursor-pointer active:scale-95 transition-colors"
            >
              다시 분석하기
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── AI Analysis Card (persistent summary on dashboard) ─────────────────────

export function AIAnalysisCard({ onOpenModal }: { onOpenModal: () => void }) {
  const [savedResult, setSavedResult] = useState<string | null>(null);
  const [savedHackathons, setSavedHackathons] = useState<{ slug: string; title: string }[]>([]);
  const [analysisDate, setAnalysisDate] = useState<string | null>(null);

  useEffect(() => {
    const result = localStorage.getItem(ANALYSIS_RESULT_KEY);
    const date = localStorage.getItem(ANALYSIS_KEY);
    if (result) {
      setSavedResult(result);
      setAnalysisDate(date);
      try {
        const hackathons = JSON.parse(localStorage.getItem(ANALYSIS_HACKATHONS_KEY) || '[]');
        setSavedHackathons(hackathons);
      } catch {
        setSavedHackathons([]);
      }
    }
  }, []);

  if (!savedResult) return null;

  // 결과 텍스트에서 첫 2-3줄 요약 추출 (마크다운 헤더 제거)
  const summaryLines = savedResult
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('###') && !line.startsWith('---'))
    .slice(0, 3)
    .join(' ')
    .replace(/\*\*/g, '')
    .replace(/^[-•]\s*/gm, '');
  const summaryText = summaryLines.length > 200 ? summaryLines.slice(0, 200) + '...' : summaryLines;

  return (
    <div className="bg-surface border border-primary/20 rounded-xl shadow-sm p-5 mb-8">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <h3 className="font-semibold text-text-primary text-sm">AI 프로필 분석 결과</h3>
        {analysisDate && (
          <span className="text-xs text-text-secondary font-mono ml-1">{analysisDate}</span>
        )}
        <button
          onClick={onOpenModal}
          className="ml-auto text-xs text-primary hover:text-primary/80 font-medium cursor-pointer active:scale-95 transition-colors flex items-center gap-1 shrink-0"
        >
          자세히 보기
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary text */}
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-3">
        {summaryText}
      </p>

      {/* Recommended hackathon links */}
      {savedHackathons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedHackathons.map((h) => (
            <a
              key={h.slug}
              href={`/hackathons/${h.slug}`}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary-light text-primary font-medium hover:bg-primary hover:text-text-on-primary transition-colors cursor-pointer active:scale-95"
            >
              {h.title}
              <ChevronRight className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
