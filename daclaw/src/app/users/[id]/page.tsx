'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Trophy, Users, FileText, MessageSquare, Star, BarChart3,
  Calendar, Heart, Award,
} from 'lucide-react';
import { useRankingStore } from '@/store/ranking';
import { useTeamStore } from '@/store/team';
import { useHackathonStore } from '@/store/hackathon';
import { useCommunityStore } from '@/store/community';
import { useSubmissionStore } from '@/store/submission';
import { seedBadges, gradeConfig } from '@/data/seed';
import UserAvatar from '@/components/UserAvatar';
import IconMapper from '@/components/IconMapper';
import type { Role, Grade } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  developer: '개발자',
  designer: '디자이너',
  planner: '기획자',
  'data-scientist': '데이터 사이언티스트',
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const rankings = useRankingStore((s) => s.rankings);
  const teams = useTeamStore((s) => s.teams);
  const hackathons = useHackathonStore((s) => s.hackathons);
  const posts = useCommunityStore((s) => s.posts);
  const submissions = useSubmissionStore((s) => s.submissions);

  // Construct user profile from ranking + team data
  const user = useMemo(() => {
    const rankEntry = rankings.find((r) => r.userId === userId);
    if (rankEntry) {
      return {
        id: rankEntry.userId,
        nickname: rankEntry.nickname,
        role: rankEntry.role as Role,
        grade: rankEntry.grade as Grade,
        badges: rankEntry.badges,
        points: rankEntry.totalScore,
        techStack: [] as string[],
        joinedAt: '2026-01-01',
        selectedBadges: rankEntry.badges.slice(0, 3),
      };
    }
    // Fallback: look through team members
    for (const t of teams) {
      const member = t.members.find((m) => m.userId === userId);
      if (member) {
        return {
          id: member.userId,
          nickname: member.nickname,
          role: member.role as Role,
          grade: 'rookie' as Grade,
          badges: [] as string[],
          points: 0,
          techStack: [] as string[],
          joinedAt: '2026-01-01',
          selectedBadges: [] as string[],
        };
      }
    }
    return null;
  }, [rankings, teams, userId]);

  const ranking = useMemo(() => {
    return rankings.find((r) => r.userId === userId);
  }, [rankings, userId]);

  const userTeams = useMemo(() => {
    return teams.filter((t) => t.members.some((m) => m.userId === userId));
  }, [teams, userId]);

  const userPosts = useMemo(() => {
    return posts.filter((p) => p.authorId === userId);
  }, [posts, userId]);

  const userSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const teamIds = userTeams.map((t) => t.id);
      return teamIds.includes(s.teamId) || s.teamId === `solo-${userId}`;
    });
  }, [submissions, userTeams, userId]);

  const participatedHackathonSlugs = useMemo(() => {
    const slugs = new Set<string>();
    userTeams.forEach((t) => t.hackathonSlugs.forEach((s) => slugs.add(s)));
    userSubmissions.forEach((s) => slugs.add(s.hackathonSlug));
    return Array.from(slugs);
  }, [userTeams, userSubmissions]);

  const participatedHackathons = useMemo(() => {
    return hackathons.filter((h) => participatedHackathonSlugs.includes(h.slug));
  }, [hackathons, participatedHackathonSlugs]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Users className="w-12 h-12 text-border mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">유저를 찾을 수 없습니다</h1>
        <p className="text-text-secondary mb-4">존재하지 않는 프로필입니다.</p>
        <Link href="/" className="text-primary hover:underline text-sm">홈으로 돌아가기</Link>
      </div>
    );
  }

  const grade = gradeConfig[user.grade];
  const selectedBadges = (user.selectedBadges.length > 0 ? user.selectedBadges : user.badges.slice(0, 3))
    .map((id: string) => seedBadges.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> 돌아가기
      </Link>

      {/* Profile Header */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <UserAvatar role={user.role} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-text-primary">{user.nickname}</h1>
              {grade && (
                <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: grade.color }}>
                  <IconMapper name={grade.icon} size={18} />
                  {grade.label}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-3">
              {ROLE_LABELS[user.role] ?? user.role} · 가입일 {user.joinedAt}
            </p>

            {/* Selected Badges */}
            {selectedBadges.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedBadges.map((badge) => badge && (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary text-xs font-medium"
                    title={badge.condition}
                  >
                    <IconMapper name={badge.icon} size={12} />
                    {badge.name}
                  </span>
                ))}
              </div>
            )}

            {/* Tech Stack */}
            {user.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.techStack.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded-md bg-background text-text-secondary text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Star, label: '포인트', value: user.points.toLocaleString(), color: 'text-primary' },
          { icon: Trophy, label: '참여 대회', value: String(participatedHackathons.length), color: 'text-warning' },
          { icon: FileText, label: '제출', value: String(userSubmissions.length), color: 'text-success' },
          { icon: MessageSquare, label: '커뮤니티', value: String(userPosts.length), color: 'text-info' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
            <Icon size={20} className={`mx-auto mb-1 ${color}`} />
            <div className="font-mono text-xl font-bold text-text-primary">{value}</div>
            <div className="text-xs text-text-secondary">{label}</div>
          </div>
        ))}
      </div>

      {/* Ranking info */}
      {ranking && (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary" />
            <h2 className="font-semibold text-text-primary">랭킹 정보</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-mono text-lg font-bold text-text-primary">{ranking.totalScore.toLocaleString()}</div>
              <div className="text-xs text-text-secondary">종합 점수</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-primary">{ranking.competitionScore.toLocaleString()}</div>
              <div className="text-xs text-text-secondary">대회 점수</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-info">{ranking.communityScore.toLocaleString()}</div>
              <div className="text-xs text-text-secondary">커뮤니티 점수</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participated Hackathons */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-primary" />
            <h2 className="font-semibold text-text-primary">참여 대회</h2>
          </div>
          {participatedHackathons.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">참여한 대회가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {participatedHackathons.map((h) => (
                <Link
                  key={h.slug}
                  href={`/hackathons/${h.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-light hover:shadow-sm transition-all"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: h.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{h.title}</div>
                    <div className="text-xs text-text-secondary flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {h.startDate} ~ {h.endDate}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    h.status === 'active' ? 'bg-success-light text-success'
                    : h.status === 'upcoming' ? 'bg-info-light text-info'
                    : 'bg-background text-text-secondary'
                  }`}>
                    {h.status === 'active' ? '진행중' : h.status === 'upcoming' ? '예정' : '종료'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Team Memberships */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-primary" />
            <h2 className="font-semibold text-text-primary">소속 팀</h2>
          </div>
          {userTeams.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">소속된 팀이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {userTeams.map((team) => {
                const memberRole = team.members.find((m) => m.userId === userId)?.role;
                return (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-light hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">{team.name}</div>
                      <div className="text-xs text-text-secondary">
                        {team.members.length}/{team.maxMembers}명
                        {team.teamScore != null && (
                          <span className="ml-2 font-mono">{team.teamScore}점</span>
                        )}
                      </div>
                    </div>
                    {memberRole && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-light text-primary text-xs font-medium">
                        {ROLE_LABELS[memberRole]}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Community Activity */}
      {userPosts.length > 0 && (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-primary" />
            <h2 className="font-semibold text-text-primary">최근 커뮤니티 활동</h2>
          </div>
          <div className="space-y-2">
            {userPosts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-light transition-all"
              >
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  post.type === 'question' ? 'bg-info-light text-info'
                  : post.type === 'tip' ? 'bg-success-light text-success'
                  : post.type === 'team-find' ? 'bg-type-qualitative-light text-type-qualitative'
                  : 'bg-background text-text-secondary'
                }`}>
                  {post.type === 'question' ? '질문' : post.type === 'tip' ? '팁' : post.type === 'team-find' ? '팀 구하기' : '자유'}
                </span>
                <span className="text-sm text-text-primary truncate flex-1">{post.title}</span>
                <div className="flex items-center gap-2 text-xs text-text-secondary shrink-0">
                  <span className="flex items-center gap-0.5"><Heart size={10} /> {post.likes}</span>
                  <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {post.comments.length}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Badges */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-primary" />
          <h2 className="font-semibold text-text-primary">획득 뱃지</h2>
        </div>
        {user.badges.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">아직 획득한 뱃지가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badgeId) => {
              const badge = seedBadges.find((b) => b.id === badgeId);
              if (!badge) return null;
              return (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-light text-primary text-sm font-medium"
                  title={badge.condition}
                >
                  <IconMapper name={badge.icon} size={14} />
                  {badge.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
