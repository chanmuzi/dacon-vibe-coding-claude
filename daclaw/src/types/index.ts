export type HackathonType = 'quantitative' | 'qualitative' | 'hybrid';
export type HackathonStatus = 'active' | 'upcoming' | 'ended';

export interface Hackathon {
  slug: string;
  title: string;
  description: string;
  type: HackathonType;
  status: HackathonStatus;
  tags: string[];
  thumbnailUrl: string;
  startDate: string;
  endDate: string;
  resultDate: string;
  prizes: Prize[];
  teamPolicy: { solo: boolean; maxMembers: number };
  participantCount: number;
  metrics?: string[];
  evaluationCriteria?: EvaluationCriterion[];
  notices: Notice[];
  milestones: Milestone[];
  isCustom?: boolean;
  creatorId?: string;
  organizer: string;
  organizerLogo?: string;
  color: string;
}

export interface Prize {
  rank: number;
  label: string;
  amount: string;
}

export interface EvaluationCriterion {
  name: string;
  weight: number;
  description: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

export interface Milestone {
  label: string;
  date: string;
  done: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  hackathonSlugs: string[];
  members: TeamMember[];
  maxMembers: number;
  recruitRoles: Role[];
  recruitStatus: 'open' | 'closed';
  createdAt: string;
  requirements?: string;
  techStack?: string[];
  teamScore?: number;
  hackathonCount?: number;
  submissionCount?: number;
}

export interface TeamMember {
  userId: string;
  nickname: string;
  role: Role;
}

export type Role = 'developer' | 'designer' | 'planner' | 'data-scientist';

export interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  password?: string;
  role: Role;
  techStack: string[];
  interests: string[];
  grade: Grade;
  badges: string[];
  selectedBadges?: string[];
  points: number;
  joinedAt: string;
  loginStreak: number;
  apiKey?: string;
}

export type Grade = 'rookie' | 'challenger' | 'expert' | 'master' | 'legend';

export interface Submission {
  id: string;
  hackathonSlug: string;
  teamId: string;
  version: number;
  content: string;
  memo: string;
  fileName?: string;
  fileSize?: number;
  score?: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
  submissionCount: number;
  lastSubmittedAt: string;
}

export interface Leaderboard {
  hackathonSlug: string;
  entries: LeaderboardEntry[];
  status: 'live' | 'pending-review' | 'finalized';
}

export interface RankingEntry {
  userId: string;
  nickname: string;
  role: Role;
  grade: Grade;
  badges: string[];
  totalScore: number;
  competitionScore: number;
  communityScore: number;
}

export interface Badge {
  id: string;
  name: string;
  type: 'achievement' | 'activity' | 'special';
  icon: string;
  condition: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  date: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'dm' | 'team-request' | 'announcement';
  teamId?: string;
  read: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  type: 'question' | 'tip' | 'team-find' | 'free';
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
  hackathonTag?: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  thumbnailUrl?: string;
  summary?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

export interface Bookmark {
  hackathonSlug: string;
  createdAt: string;
}
