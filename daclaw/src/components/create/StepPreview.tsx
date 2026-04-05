'use client';

import { Calendar, Users, Trophy, Target, FileText, HelpCircle, Flag } from 'lucide-react';
import TypeBadge from '@/components/TypeBadge';
import type { HackathonType, Prize, EvaluationCriterion } from '@/types';

const BANNER_GRADIENTS: Record<string, string> = {
  'gradient-blue': 'linear-gradient(135deg, #0049DB 0%, #2563EB 50%, #60A5FA 100%)',
  'gradient-purple': 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
  'gradient-green': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #6EE7B7 100%)',
  'gradient-red': 'linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #FCA5A5 100%)',
  'gradient-orange': 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%)',
  'gradient-cyan': 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #67E8F9 100%)',
  'gradient-pink': 'linear-gradient(135deg, #DB2777 0%, #EC4899 50%, #F9A8D4 100%)',
  'gradient-dark': 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #6B7280 100%)',
};

interface StepPreviewProps {
  hackathonType: HackathonType;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  bannerColor: string;
  startDate: string;
  endDate: string;
  resultDate: string;
  soloAllowed: boolean;
  maxMembers: number;
  prizes: Prize[];
  metrics: string[];
  evaluationCriteria: EvaluationCriterion[];
  submissionType: string;
  submissionDescription: string;
  rules: string[];
  faq: { question: string; answer: string }[];
  milestones: { label: string; date: string }[];
  organizer: string;
}

function PreviewSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        {icon}
        {title}
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

export default function StepPreview(props: StepPreviewProps) {
  const {
    hackathonType, title, description, tags, thumbnailUrl, bannerColor,
    startDate, endDate, resultDate, soloAllowed, maxMembers,
    prizes, metrics, evaluationCriteria, submissionType, submissionDescription,
    rules, faq, milestones, organizer,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="썸네일"
            className="w-full h-48 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div
            className="w-full h-48 flex items-center justify-center"
            style={{ background: BANNER_GRADIENTS[bannerColor] || BANNER_GRADIENTS['gradient-blue'] }}
          >
            <h3 className="text-white text-2xl font-bold drop-shadow-md px-6 text-center">{title || '대회 제목'}</h3>
          </div>
        )}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={hackathonType} />
            <span className="text-xs bg-info-light text-info px-2 py-0.5 rounded-full font-medium">커스텀</span>
            {tags.map((t) => (
              <span key={t} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
          <h2 className="text-xl font-bold text-text-primary">{title || '(제목 미입력)'}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{description || '(설명 미입력)'}</p>
          <p className="text-xs text-text-secondary">주최: {organizer}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
        <PreviewSection icon={<Calendar className="w-4 h-4 text-primary" />} title="일정">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-secondary">시작일</p>
              <p className="font-mono font-medium">{startDate || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">마감일</p>
              <p className="font-mono font-medium">{endDate || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">결과 발표</p>
              <p className="font-mono font-medium">{resultDate || '-'}</p>
            </div>
          </div>
        </PreviewSection>

        <PreviewSection icon={<Users className="w-4 h-4 text-primary" />} title="팀 정책">
          <p className="text-sm text-text-secondary">
            {soloAllowed ? '개인 참가 가능' : '팀 참가만 가능'} / 최대 {maxMembers}명
          </p>
        </PreviewSection>

        {prizes.length > 0 && (
          <PreviewSection icon={<Trophy className="w-4 h-4 text-primary" />} title="시상">
            <div className="flex flex-wrap gap-2">
              {prizes.map((p, i) => (
                <span key={i} className="text-xs bg-warning-light text-warning px-2.5 py-1 rounded-full font-medium">
                  {p.label}: {p.amount || '미정'}
                </span>
              ))}
            </div>
          </PreviewSection>
        )}

        {metrics.length > 0 && (
          <PreviewSection icon={<Target className="w-4 h-4 text-primary" />} title="평가 지표">
            <div className="flex flex-wrap gap-2">
              {metrics.map((m) => (
                <span key={m} className="text-xs bg-type-quantitative-light text-type-quantitative px-2 py-0.5 rounded-full">{m}</span>
              ))}
            </div>
          </PreviewSection>
        )}

        {evaluationCriteria.length > 0 && (
          <PreviewSection icon={<Target className="w-4 h-4 text-primary" />} title="평가 기준">
            <div className="flex flex-col gap-1">
              {evaluationCriteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs font-mono text-primary">{c.weight}%</span>
                  {c.description && <span className="text-xs text-text-secondary">- {c.description}</span>}
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {submissionDescription && (
          <PreviewSection icon={<FileText className="w-4 h-4 text-primary" />} title="제출 형식">
            <p className="text-sm text-text-secondary">{submissionType.toUpperCase()} - {submissionDescription}</p>
          </PreviewSection>
        )}

        {rules.length > 0 && (
          <PreviewSection icon={<Flag className="w-4 h-4 text-primary" />} title="규칙">
            <ul className="flex flex-col gap-1">
              {rules.map((r, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-xs font-mono text-text-secondary shrink-0">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </PreviewSection>
        )}

        {faq.length > 0 && (
          <PreviewSection icon={<HelpCircle className="w-4 h-4 text-primary" />} title="FAQ">
            <div className="flex flex-col gap-2">
              {faq.map((f, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium text-text-primary">Q. {f.question}</p>
                  <p className="text-text-secondary mt-0.5">A. {f.answer}</p>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {milestones.length > 0 && (
          <PreviewSection icon={<Flag className="w-4 h-4 text-primary" />} title="마일스톤">
            <div className="flex flex-wrap gap-2">
              {milestones.map((m, i) => (
                <span key={i} className="text-xs bg-background border border-border px-2.5 py-1 rounded-full">
                  {m.label} <span className="font-mono text-text-secondary">{m.date}</span>
                </span>
              ))}
            </div>
          </PreviewSection>
        )}
      </div>
    </div>
  );
}
