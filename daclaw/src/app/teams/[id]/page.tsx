'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, Trophy, Send, X, CheckCircle2,
  Star, BarChart3, Layers, MessageSquare,
} from 'lucide-react';
import { useTeamStore } from '@/store/team';
import { useHackathonStore } from '@/store/hackathon';
import { useUserStore } from '@/store/user';
import { useMessageStore } from '@/store/message';
import UserAvatar from '@/components/UserAvatar';
import type { Role } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  developer: '개발자',
  designer: '디자이너',
  planner: '기획자',
  'data-scientist': '데이터 사이언티스트',
};

export default function TeamPublicPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { teams, init: initTeams } = useTeamStore();
  const { hackathons, init: initHackathons } = useHackathonStore();
  const { user, isLoggedIn, openAuthModal, init: initUser } = useUserStore();
  const { addMessage, init: initMessages } = useMessageStore();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [dmMessage, setDmMessage] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    initTeams();
    initHackathons();
    initUser();
    initMessages();
  }, [initTeams, initHackathons, initUser, initMessages]);

  const team = teams.find((t) => t.id === teamId);
  const teamHackathons = team
    ? hackathons.filter((h) => team.hackathonSlugs?.includes(h.slug))
    : [];

  function handleApplyClick() {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    setShowApplyModal(true);
  }

  function handleSendApply() {
    if (!dmMessage.trim() || !team || !user) return;
    const leader = team.members[0];
    if (!leader) return;
    addMessage({
      id: `msg-${crypto.randomUUID()}`,
      from: user.id,
      to: leader.userId,
      content: dmMessage,
      type: 'team-request',
      teamId: team.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
    setDmMessage('');
    setShowApplyModal(false);
    showToast('참가 신청이 전송되었습니다!');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/camp')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> 팀원 모집으로 돌아가기
        </button>
        <div className="bg-surface border border-border rounded-xl shadow-sm p-12 text-center">
          <Users size={48} className="text-text-secondary mx-auto mb-4 opacity-40" />
          <p className="text-text-secondary text-lg">팀을 찾을 수 없습니다</p>
          <p className="text-text-secondary text-sm mt-1 opacity-60">삭제되었거나 존재하지 않는 팀입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.push('/camp')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} /> 팀원 모집으로 돌아가기
      </button>

      {/* Team Header */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-text-primary">{team.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  team.recruitStatus === 'open'
                    ? 'bg-success-light text-success'
                    : 'bg-background text-text-secondary border border-border'
                }`}
              >
                {team.recruitStatus === 'open' ? '모집중' : '마감'}
              </span>
            </div>
            <p className="text-text-secondary mb-4 leading-relaxed">{team.description}</p>
            {team.techStack && team.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {team.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 bg-primary-light text-primary text-xs font-medium rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Members */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h2 className="font-bold text-text-primary">
              팀원 ({team.members.length}/{team.maxMembers}명)
            </h2>
          </div>
          <div className="space-y-3">
            {team.members.map((member, idx) => (
              <div key={member.userId} className="flex items-center gap-3">
                <UserAvatar role={member.role} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate">
                    {member.nickname}
                    {idx === 0 && (
                      <span className="ml-2 text-xs text-warning font-semibold">팀장</span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">{ROLE_LABELS[member.role]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="font-bold text-text-primary">팀 통계</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Star size={14} className="text-warning" />
                팀 점수
              </div>
              <span className="font-bold text-text-primary text-lg">
                {team.teamScore ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Trophy size={14} className="text-primary" />
                참가 해커톤
              </div>
              <span className="font-bold text-text-primary text-lg">
                {team.hackathonCount ?? team.hackathonSlugs?.length ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Layers size={14} className="text-text-secondary" />
                제출 횟수
              </div>
              <span className="font-bold text-text-primary text-lg">
                {team.submissionCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Participating Hackathons */}
      {teamHackathons.length > 0 && (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-primary" />
            <h2 className="font-bold text-text-primary">참가 해커톤</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamHackathons.map((hack) => (
              <button
                key={hack.slug}
                onClick={() => router.push(`/hackathons/${hack.slug}`)}
                className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary-light hover:shadow-sm transition-all text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: hack.color + '20' }}
                >
                  <Trophy size={18} style={{ color: hack.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">{hack.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {hack.startDate} ~ {hack.endDate}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      hack.status === 'active'
                        ? 'bg-success-light text-success'
                        : hack.status === 'upcoming'
                        ? 'bg-primary-light text-primary'
                        : 'bg-background text-text-secondary border border-border'
                    }`}
                  >
                    {hack.status === 'active' ? '진행중' : hack.status === 'upcoming' ? '예정' : '종료'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Requirements + Apply */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-primary" />
          <h2 className="font-bold text-text-primary">모집 요건 및 참가 신청</h2>
        </div>

        {team.recruitRoles.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-text-secondary mb-2">
              선호 역할:{' '}
              <span className="text-text-primary font-medium">
                {team.recruitRoles.map((r) => ROLE_LABELS[r]).join(', ')}
              </span>
            </p>
            <p className="text-xs text-text-secondary">다른 역할도 환영합니다.</p>
          </div>
        )}

        {team.requirements && (
          <div className="mb-4 p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-text-primary leading-relaxed">{team.requirements}</p>
          </div>
        )}

        {team.recruitStatus === 'open' ? (
          <button
            onClick={handleApplyClick}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Send size={16} /> 참가 신청
          </button>
        ) : (
          <div className="px-4 py-3 bg-background border border-border rounded-lg text-sm text-text-secondary inline-flex items-center gap-2">
            <Users size={14} /> 현재 모집이 마감되었습니다
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">참가 신청 — {team.name}</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg hover:bg-background transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              팀장에게 메시지를 보내 참가를 신청하세요.
            </p>
            <textarea
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
              placeholder="자기소개와 참가 동기를 작성해주세요..."
              rows={4}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm mb-4 focus:ring-2 focus:ring-primary-light focus:border-primary resize-none text-text-primary placeholder:text-text-secondary"
            />
            <button
              onClick={handleSendApply}
              disabled={!dmMessage.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} /> 신청 보내기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
