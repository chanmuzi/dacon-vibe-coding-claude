'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/user';
import {
  Trophy, Users, BarChart3, MessageSquare, LayoutDashboard,
  Menu, X, Search, LogIn, LogOut, User, Eye, EyeOff,
} from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';
import Modal from '@/components/Modal';
import type { Role } from '@/types';

const navItems = [
  { href: '/hackathons', label: '해커톤', icon: Trophy },
  { href: '/camp', label: '캠프', icon: Users },
  { href: '/rankings', label: '랭킹', icon: BarChart3 },
  { href: '/community', label: '커뮤니티', icon: MessageSquare },
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
];

const ROLES: { key: Role; label: string }[] = [
  { key: 'developer', label: '개발자' },
  { key: 'designer', label: '디자이너' },
  { key: 'planner', label: '기획자' },
  { key: 'data-scientist', label: '데이터 사이언티스트' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoggedIn, login, register, logout, showAuthModal, openAuthModal, closeAuthModal } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Auth modal state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ nickname: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nickname: '', email: '', password: '', passwordConfirm: '', role: 'developer' as Role });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const resetForms = () => {
    setLoginForm({ nickname: '', password: '' });
    setRegisterForm({ nickname: '', email: '', password: '', passwordConfirm: '', role: 'developer' });
    setShowPassword(false);
    setAuthError('');
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    resetForms();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginForm.nickname.trim() || !loginForm.password) {
      setAuthError('모든 필드를 입력해주세요.');
      return;
    }
    const result = login(loginForm.nickname.trim(), loginForm.password);
    if (!result.success) {
      setAuthError(result.error ?? '로그인 실패');
    } else {
      resetForms();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!registerForm.nickname.trim() || !registerForm.email.trim() || !registerForm.password) {
      setAuthError('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (registerForm.password.length < 8) {
      setAuthError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (registerForm.password !== registerForm.passwordConfirm) {
      setAuthError('비밀번호가 일치하지 않습니다.');
      return;
    }
    const result = register(registerForm.nickname.trim(), registerForm.email.trim(), registerForm.password, registerForm.role);
    if (!result.success) {
      setAuthError(result.error ?? '회원가입 실패');
    } else {
      resetForms();
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleModalClose = () => {
    closeAuthModal();
    resetForms();
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
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-text-secondary hover:bg-error-light hover:text-error transition-colors"
                    aria-label="로그아웃"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  data-testid="login-button"
                  onClick={openAuthModal}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-text-on-primary text-sm font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
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
          <div className="md:hidden border-t border-border bg-surface animate-in fade-in-0 slide-in-from-top-2 duration-200">
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
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error-light"
                >
                  <LogOut size={18} />
                  로그아웃 ({user?.nickname})
                </button>
              ) : (
                <button
                  onClick={() => { openAuthModal(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-text-on-primary transition-all duration-200 active:scale-[0.98]"
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
      <Modal isOpen={showAuthModal} onClose={handleModalClose} maxWidth="max-w-sm" zIndex={60}>
            {/* Tab Header */}
            <div className="flex border-b border-border mb-5">
              <button
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                  authTab === 'login'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                  authTab === 'register'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* Error message */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-error-light text-error text-sm font-medium">
                {authError}
              </div>
            )}

            {/* Login Form */}
            {authTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="text"
                  placeholder="닉네임 또는 이메일"
                  value={loginForm.nickname}
                  onChange={(e) => setLoginForm({ ...loginForm, nickname: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-background transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-text-on-primary text-sm font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
                  >
                    로그인
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {authTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  placeholder="닉네임"
                  value={registerForm.nickname}
                  onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                  required
                />
                <input
                  type="email"
                  placeholder="이메일"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 (4자 이상)"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 확인"
                  value={registerForm.passwordConfirm}
                  onChange={(e) => setRegisterForm({ ...registerForm, passwordConfirm: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
                  required
                />
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">역할 선택</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRegisterForm({ ...registerForm, role: key })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          registerForm.role === key
                            ? 'bg-primary text-text-on-primary'
                            : 'bg-background border border-border text-text-secondary hover:border-primary-light hover:text-primary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-background transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-text-on-primary text-sm font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
                  >
                    가입하기
                  </button>
                </div>
              </form>
            )}
      </Modal>

      {/* Logout Confirm Dialog */}
      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} maxWidth="max-w-xs" zIndex={60} showCloseButton={false}>
        <div className="text-center">
          <LogOut size={32} className="mx-auto text-error mb-3" />
          <h3 className="font-bold text-text-primary mb-2">로그아웃</h3>
          <p className="text-sm text-text-secondary mb-5">정말 로그아웃하시겠습니까?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-background transition-colors"
            >
              취소
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 px-4 py-2.5 rounded-lg bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
