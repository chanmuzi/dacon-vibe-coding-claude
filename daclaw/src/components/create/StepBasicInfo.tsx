'use client';

import { Label, Input, Textarea, SectionCard } from './FormFields';

const BANNER_COLORS = [
  { value: 'gradient-blue', label: '블루', gradient: 'linear-gradient(135deg, #0049DB 0%, #2563EB 50%, #60A5FA 100%)' },
  { value: 'gradient-purple', label: '퍼플', gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)' },
  { value: 'gradient-green', label: '그린', gradient: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #6EE7B7 100%)' },
  { value: 'gradient-red', label: '레드', gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #FCA5A5 100%)' },
  { value: 'gradient-orange', label: '오렌지', gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%)' },
  { value: 'gradient-cyan', label: '시안', gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #67E8F9 100%)' },
  { value: 'gradient-pink', label: '핑크', gradient: 'linear-gradient(135deg, #DB2777 0%, #EC4899 50%, #F9A8D4 100%)' },
  { value: 'gradient-dark', label: '다크', gradient: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #6B7280 100%)' },
];

export interface BasicInfoData {
  title: string;
  description: string;
  tags: string;
  thumbnailUrl: string;
  bannerColor: string;
  startDate: string;
  endDate: string;
  resultDate: string;
  soloAllowed: boolean;
  maxMembers: string;
}

interface StepBasicInfoProps {
  data: BasicInfoData;
  errors: Partial<Record<keyof BasicInfoData, string>>;
  onChange: (field: keyof BasicInfoData, value: string | boolean) => void;
}

export default function StepBasicInfo({ data, errors, onChange }: StepBasicInfoProps) {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="기본 정보">
        <div>
          <Label required>대회 제목</Label>
          <Input
            placeholder="나만의 해커톤 대회명을 입력하세요"
            value={data.title}
            onChange={(e) => onChange('title', e.target.value)}
            error={errors.title}
            maxLength={80}
          />
          <p className="text-xs text-text-secondary mt-1">{data.title.length}/80</p>
        </div>

        <div>
          <Label required>대회 설명</Label>
          <Textarea
            placeholder="대회 목적, 주제, 참가 자격 등을 설명하세요"
            rows={5}
            value={data.description}
            onChange={(e) => onChange('description', e.target.value)}
            error={errors.description}
            maxLength={2000}
          />
          <p className="text-xs text-text-secondary mt-1">{data.description.length}/2000</p>
        </div>

        <div>
          <Label>태그</Label>
          <Input
            placeholder="AI, NLP, 비전 (쉼표 또는 공백으로 구분)"
            value={data.tags}
            onChange={(e) => onChange('tags', e.target.value)}
          />
        </div>

        <div>
          <Label>배너 스타일</Label>
          <p className="text-xs text-text-secondary mb-2">기본 그라데이션을 선택하거나, 직접 이미지 URL을 입력하세요.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {BANNER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => { onChange('bannerColor', c.value); onChange('thumbnailUrl', ''); }}
                className={`w-12 h-12 rounded-lg cursor-pointer transition-all duration-200 active:scale-95 ${
                  data.bannerColor === c.value && !data.thumbnailUrl
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'hover:ring-2 hover:ring-border hover:ring-offset-1'
                }`}
                style={{ background: c.gradient }}
                title={c.label}
              />
            ))}
          </div>
          <Input
            placeholder="또는 이미지 URL을 직접 입력 (https://...)"
            value={data.thumbnailUrl}
            onChange={(e) => onChange('thumbnailUrl', e.target.value)}
          />
          <div className="mt-2 w-full max-w-sm rounded-lg overflow-hidden border border-border">
            {data.thumbnailUrl ? (
              <img
                src={data.thumbnailUrl}
                alt="썸네일 미리보기"
                className="w-full h-28 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div
                className="w-full h-28 flex items-center justify-center"
                style={{ background: BANNER_COLORS.find((c) => c.value === data.bannerColor)?.gradient || BANNER_COLORS[0].gradient }}
              >
                <span className="text-white/80 text-sm font-medium">배너 미리보기</span>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="일정">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>시작일</Label>
            <Input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              error={errors.startDate}
            />
          </div>
          <div>
            <Label required>마감일</Label>
            <Input
              type="date"
              value={data.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              error={errors.endDate}
            />
          </div>
          <div>
            <Label required>결과 발표일</Label>
            <Input
              type="date"
              value={data.resultDate}
              onChange={(e) => onChange('resultDate', e.target.value)}
              error={errors.resultDate}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="팀 정책">
        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={data.soloAllowed}
            onChange={(e) => onChange('soloAllowed', e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-text-primary">개인 참가 허용</span>
        </label>
        <div>
          <Label>최대 팀원 수</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={data.maxMembers}
            onChange={(e) => onChange('maxMembers', e.target.value)}
            className="w-32"
          />
        </div>
      </SectionCard>
    </div>
  );
}
