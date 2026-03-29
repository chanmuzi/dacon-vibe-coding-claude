'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/user';
import {
  Trophy, Users, BarChart3, MessageSquare, LayoutDashboard,
  Menu, X, Search, LogIn, LogOut, User,
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';

const navItems = [
  { href: '/hackathons', label: '해커톤', icon: Trophy },
  { href: '/camp', label: '캠프', icon: Users },
  { href: '/rankings', label: '랭킹', icon: BarChart3 },
  { href: '/community', label: '커뮤니티', icon: MessageSquare },
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoggedIn, login, logout } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ nickname: '', email: '' });
  const [showSearch, setShowSearch] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.nickname.trim()) {
      login(authForm.nickname.trim(), authForm.email.trim());
      setShowAuthModal(false);
      setAuthForm({ nickname: '', email: '' });
    }
  };

  return (
    <>
      <nav data-testid="nav" className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🦞</span>
              <span className="text-xl font-bold text-primary">DACLAW</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-text-on-primary'
                        : 'text-text-secondary hover:bg-primary-light hover:text-primary'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                data-testid="search-input"
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg text-text-secondary hover:bg-primary-light hover:text-primary transition-colors"
                aria-label="검색"
              >
                <Search size={20} />
              </button>

              {isLoggedIn ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-light text-primary text-sm font-medium">
                    <User size={14} />
                    {user?.nickname}
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-text-secondary hover:bg-error-light hover:text-error transition-colors"
                    aria-label="로그아웃"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  data-testid="login-button"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <LogIn size={16} />
                  로그인
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                data-testid="mobile-menu-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-primary-light"
                aria-label="메뉴"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-surface">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-text-on-primary'
                        : 'text-text-secondary hover:bg-primary-light'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error-light"
                >
                  <LogOut size={18} />
                  로그아웃 ({user?.nickname})
                </button>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-text-on-primary"
                >
                  <LogIn size={18} />
                  로그인
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Search */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">로그인 / 회원가입</h2>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="text"
                placeholder="닉네임"
                value={authForm.nickname}
                onChange={(e) => setAuthForm({ ...authForm, nickname: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                required
              />
              <input
                type="email"
                placeholder="이메일 (선택)"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-background transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  시작하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
