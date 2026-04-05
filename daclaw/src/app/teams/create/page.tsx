'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { useTeamStore } from '@/store/team';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import { ROLE_LABELS } from '@/lib/constants';
import type { Role, Team } from '@/types';

const ALL_ROLES: Role[] = ['developer', 'designer', 'planner', 'data-scientist'];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-text-primary mb-1.5">
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}

function TeamCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedHackathon = searchParams.get('hackathon') ?? '';

  const { addTeam, init: initTeams } = useTeamStore();
  const { hackathons, init: initHackathons } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal, init: initUser } = useUserStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedHackathons, setSelectedHackathons] = useState<string[]>(
    preselectedHackathon ? [preselectedHackathon] : []
  );
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [maxMembers, setMaxMembers] = useState(4);
  const [requirements, setRequirements] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [myRole, setMyRole] = useState<Role>(user?.role || 'developer');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    initTeams();
    initHackathons();
    initUser();
  }, [initTeams, initHackathons, initUser]);

  // Prompt login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      openAuthModal();
    }
  }, [isLoggedIn, openAuthModal]);

  const activeHackathons = hackathons.filter((h) => h.status !== 'ended');

  function toggleHackathon(slug: string) {
    setSelectedHackathons((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleRole(role: Role) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '팀 이름을 입력하세요.';
    if (!description.trim()) errs.description = '팀 소개를 입력하세요.';
    if (maxMembers < 2 || maxMembers > 20) errs.maxMembers = '인원은 2~20명이어야 합니다.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      openAuthModal();
      return;
    }
    if (!validate()) return;

    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      hackathonSlugs: selectedHackathons,
      members: [{ userId: user.id, nickname: user.nickname, role: myRole }],
      maxMembers,
      recruitRoles: selectedRoles,
      recruitStatus: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
      requirements: requirements.trim() || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    };

    addTeam(newTeam);
    router.push(`/teams/${newTeam.id}`);
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border rounded-xl shadow-sm p-12 text-center">
          <Users size={48} className="text-text-secondary mx-auto mb-4 opacity-40" />
          <p className="text-text-primary font-semibold text-lg mb-2">로그인이 필요합니다</p>
          <p className="text-text-secondary text-sm mb-6">팀을 만들려면 먼저 로그인해 주세요.</p>
          <button
            onClick={openAuthModal}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {/* Back button */}
      <button
        onClick={() => router.push('/camp')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 cursor-pointer active:scale-[0.98]"
      >
        <ArrowLeft size={16} /> 팀원 모집으로 돌아가기
      </button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">팀 만들기</h1>
        <p className="text-sm text-text-secondary mt-1">새로운 팀을 구성하고 팀원을 모집하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-3">기본 정보</h2>

          {/* Team name */}
          <div>
            <Label required>팀 이름</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: '' }));
              }}
              placeholder="팀 이름을 입력하세요"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary"
            />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <Label required>팀 소개</Label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((p) => ({ ...p, description: '' }));
              }}
              placeholder="팀 소개를 작성하세요"
              rows={3}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary resize-none"
            />
            {errors.description && <p className="text-xs text-error mt-1">{errors.description}</p>}
          </div>

          {/* My role */}
          <div>
            <Label required>내 포지션</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setMyRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                    myRole === role
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-primary-light hover:border-primary-light'
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hackathon selection */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-3">
            연관 해커톤 <span className="font-normal text-text-secondary">(선택, 복수 가능)</span>
          </h2>
          {activeHackathons.length === 0 ? (
            <p className="text-sm text-text-secondary">현재 참가 가능한 해커톤이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeHackathons.map((hack) => {
                const checked = selectedHackathons.includes(hack.slug);
                return (
                  <label
                    key={hack.slug}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      checked
                        ? 'border-primary bg-primary-light'
                        : 'border-border bg-background hover:border-primary-light'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHackathon(hack.slug)}
                      className="w-4 h-4 accent-primary shrink-0"
                    />
                    <span className="text-sm font-medium text-text-primary truncate">{hack.title}</span>
                    <span
                      className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                        hack.status === 'active'
                          ? 'bg-success-light text-success'
                          : 'bg-primary-light text-primary'
                      }`}
                    >
                      {hack.status === 'active' ? '진행중' : '예정'}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Role selection */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-3">
            선호 모집 역할 <span className="font-normal text-text-secondary">(선택, 복수)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
                  selectedRoles.includes(role)
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-primary-light hover:border-primary-light'
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </div>

        {/* Max members + requirements + tech stack */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-3">팀 설정</h2>

          {/* Max members */}
          <div>
            <Label required>최대 인원</Label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxMembers}
              onChange={(e) => {
                setMaxMembers(Number(e.target.value));
                if (errors.maxMembers) setErrors((p) => ({ ...p, maxMembers: '' }));
              }}
              className="w-28 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            />
            {errors.maxMembers && <p className="text-xs text-error mt-1">{errors.maxMembers}</p>}
          </div>

          {/* Requirements */}
          <div>
            <Label>모집 요건 <span className="font-normal text-text-secondary">(선택)</span></Label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="예: Python 경험자 우대, 매주 회의 참가 가능한 분"
              rows={2}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary resize-none"
            />
          </div>

          {/* Tech stack */}
          <div>
            <Label>팀 기술스택 <span className="font-normal text-text-secondary">(선택, 콤마로 구분)</span></Label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="Python, PyTorch, React, Next.js"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary"
            />
            {techStackInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {techStackInput.split(',').map((t) => t.trim()).filter(Boolean).map((tech) => (
                  <span key={tech} className="px-2.5 py-1 bg-primary-light text-primary text-xs font-medium rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/camp')}
            className="px-6 py-2 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:border-text-secondary hover:text-text-primary transition-colors cursor-pointer active:scale-[0.98]"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Users size={16} /> 팀 생성
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TeamCreatePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border rounded-xl shadow-sm p-12 text-center">
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    }>
      <TeamCreateForm />
    </Suspense>
  );
}
