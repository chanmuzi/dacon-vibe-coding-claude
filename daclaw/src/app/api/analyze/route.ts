import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

const SYSTEM_PROMPT = `당신은 DACLAW 해커톤 플랫폼의 AI 프로필 분석가입니다.
사용자의 프로필 정보(역할, 기술 스택, 관심 분야, 등급, 활동 포인트)와 현재 열려 있는 대회 목록을 분석하여 맞춤형 대회를 추천하세요.

답변 형식:
1. 프로필 요약 (2-3줄)
2. 추천 대회 (최대 3개, 각각 대회명, 추천 이유, 매칭도를 포함)
3. 성장 조언 (1-2줄)

한국어로 답변하세요. 간결하고 실용적으로 작성하세요.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip, 5)) {
    return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  let body: { profile?: unknown; hackathons?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { profile, hackathons } = body;

  if (!profile || !hackathons) {
    return Response.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!Array.isArray(hackathons) || hackathons.length > 10) {
    return Response.json({ error: 'INVALID_HACKATHONS' }, { status: 400 });
  }

  const p = profile as { role: string; techStack?: string[]; interests?: string[]; grade: string; points: number; badges?: unknown[] };

  const userContent = `## 사용자 프로필
- 역할: ${p.role}
- 기술 스택: ${(p.techStack || []).join(', ') || '미설정'}
- 관심 분야: ${(p.interests || []).join(', ') || '미설정'}
- 등급: ${p.grade} (${p.points}pt)
- 획득 배지: ${(p.badges || []).length}개

## 현재 대회 목록
${hackathons.map((h: { title: string; type: string; status: string; tags: string[]; endDate: string; description: string }) =>
  `- ${h.title} [${h.status}] (${h.type}, 마감: ${h.endDate})\n  태그: ${h.tags.join(', ')}\n  설명: ${h.description.slice(0, 100)}...`
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
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return Response.json({ error: 'OPENAI_ERROR' }, { status: 502 });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '분석 결과를 생성할 수 없습니다.';

  return Response.json({ result: text });
}
