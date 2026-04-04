'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, X, Trophy, Users, MessageSquare } from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useCommunityStore } from '@/store/community';
import Modal from '@/components/Modal';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const hackathons = useHackathonStore((s) => s.hackathons);
  const teams = useTeamStore((s) => s.teams);
  const posts = useCommunityStore((s) => s.posts);

  // Reset query when modal opens (setState during render on prop change — React 19 pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen && !prevIsOpen) {
    setQuery('');
  }
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
  }

  // Derive results from query via useMemo (no setState in effect needed)
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

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
      href: `/teams/${t.id}`,
      _search: `${t.name} ${t.description}`,
    }));

    const postItems = posts.map((p) => ({
      category: '커뮤니티' as const,
      title: p.title,
      description: p.content.slice(0, 80),
      href: `/community/${p.id}`,
      _search: `${p.title} ${p.content}`,
    }));

    const allItems = [...hackathonItems, ...teamItems, ...postItems];

    const fuse = new Fuse(allItems, {
      keys: ['_search'],
      threshold: 0.4,
      includeScore: true,
    });

    return fuse.search(query).slice(0, 12).map((r) => ({
      category: r.item.category,
      title: r.item.title,
      description: r.item.description,
      href: r.item.href,
    }));
  }, [query, hackathons, teams, posts]);

  useEffect(() => {
    if (isOpen) {
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" zIndex={70} showCloseButton={false} className="p-0">
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
        </div>
    </Modal>
  );
}
