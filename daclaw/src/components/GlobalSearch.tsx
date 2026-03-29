'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, X, Trophy, Users, MessageSquare } from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useCommunityStore } from '@/store/community';

interface SearchResult {
  category: '해커톤' | '팀' | '커뮤니티';
  title: string;
  description: string;
  href: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const hackathons = useHackathonStore((s) => s.hackathons);
  const teams = useTeamStore((s) => s.teams);
  const posts = useCommunityStore((s) => s.posts);

  const search = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      const hackathonItems = hackathons.map((h) => ({
        category: '해커톤' as const,
        title: h.title,
        description: h.description.slice(0, 80),
        href: `/hackathons/${h.slug}`,
        _search: `${h.title} ${h.description} ${h.tags.join(' ')}`,
      }));

      const teamItems = teams.map((t) => ({
        category: '팀' as const,
        title: t.name,
        description: t.description.slice(0, 80),
        href: t.hackathonSlugs.length > 0 ? `/hackathons/${t.hackathonSlugs[0]}` : '/camp',
        _search: `${t.name} ${t.description}`,
      }));

      const postItems = posts.map((p) => ({
        category: '커뮤니티' as const,
        title: p.title,
        description: p.content.slice(0, 80),
        href: `/community`,
        _search: `${p.title} ${p.content}`,
      }));

      const allItems = [...hackathonItems, ...teamItems, ...postItems];

      const fuse = new Fuse(allItems, {
        keys: ['_search'],
        threshold: 0.4,
        includeScore: true,
      });

      const fuseResults = fuse.search(q).slice(0, 12);
      setResults(fuseResults.map((r) => ({
        category: r.item.category,
        title: r.item.title,
        description: r.item.description,
        href: r.item.href,
      })));
    },
    [hackathons, teams, posts]
  );

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  const categoryIcon = (cat: string) => {
    if (cat === '해커톤') return <Trophy size={14} />;
    if (cat === '팀') return <Users size={14} />;
    return <MessageSquare size={14} />;
  };

  const handleResultClick = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={20} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            data-testid="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="해커톤, 팀, 커뮤니티 검색..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="검색어 지우기"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="px-4 py-6 text-center text-text-secondary text-sm">
              검색어를 입력하세요
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-secondary text-sm">
              검색 결과 없음
            </div>
          ) : (
            <div className="py-2">
              {(['해커톤', '팀', '커뮤니티'] as const).map((cat) => {
                const items = grouped[cat];
                if (!items?.length) return null;
                return (
                  <div key={cat}>
                    <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                      {categoryIcon(cat)}
                      {cat}
                    </div>
                    {items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleResultClick(item.href)}
                        className="w-full text-left px-4 py-2.5 hover:bg-primary-light transition-colors"
                      >
                        <div className="text-sm font-medium text-text-primary">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border text-xs text-text-secondary flex gap-3">
          <span>ESC 닫기</span>
          <span>Enter 이동</span>
        </div>
      </div>
    </div>
  );
}
