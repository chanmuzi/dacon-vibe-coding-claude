import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

const SYSTEM_PROMPT = `당신은 DACLAW 해커톤 플랫폼의 AI 팀 매칭 전문가입니다.
사용자 프로필과 모집 중인 팀 목록을 분석하여 가장 적합한 팀을 추천하세요.

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON만):
[
  {
    "teamId": "팀 ID",
    "teamName": "팀 이름",
    "matchScore": 85,
    "reason": "추천 이유 (한국어, 1-2문장)"
  }
]

최대 3개까지 추천하세요. matchScore는 0-100 사이 정수입니다.
역할 매칭, 기술 스택 유사도, 대회 관련성을 고려하세요.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip, 5)) {
    return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  let body: { profile?: unknown; teams?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { profile, teams } = body;

  if (!profile || !teams) {
    return Response.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!Array.isArray(teams) || teams.length > 20) {
    return Response.json({ error: 'INVALID_TEAMS' }, { status: 400 });
  }

  const p = profile as { role: string; techStack?: string[]; interests?: string[]; grade: string };

  const userContent = `## 사용자 프로필
- 역할: ${p.role}
- 기술 스택: ${(p.techStack || []).join(', ') || '미설정'}
- 관심 분야: ${(p.interests || []).join(', ') || '미설정'}
- 등급: ${p.grade}

## 모집 중인 팀 목록
${teams.map((t: { id: string; name: string; description: string; recruitRoles: string[]; hackathonTitle: string; techStack: string[]; members: number; maxMembers: number }) =>
  `- ID: ${t.id} | ${t.name} | 모집역할: ${t.recruitRoles.join(',')} | 대회: ${t.hackathonTitle} | 기술: ${(t.techStack || []).join(',')} | ${t.members}/${t.maxMembers}명\n  설명: ${t.description.slice(0, 80)}`
).join('\n')}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 500,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    return Response.json({ error: 'OPENAI_ERROR' }, { status: 502 });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '[]';

  try {
    // Strip potential markdown code blocks
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const recommendations = JSON.parse(cleaned);
    return Response.json({ recommendations });
  } catch {
    return Response.json({ recommendations: [], raw: text });
  }
}
