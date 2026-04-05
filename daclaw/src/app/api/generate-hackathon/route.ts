import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

const SYSTEM_PROMPT = `당신은 DACLAW 해커톤 플랫폼의 AI 대회 기획 어시스턴트입니다.
사용자의 아이디어를 바탕으로 해커톤 대회 정보를 생성합니다.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):
{
  "title": "대회 제목",
  "description": "대회 상세 설명 (100~300자)",
  "tags": ["태그1", "태그2", "태그3"],
  "type": "quantitative | qualitative | hybrid",
  "prizes": [
    { "rank": 1, "label": "1등", "amount": "상금" },
    { "rank": 2, "label": "2등", "amount": "상금" }
  ],
  "evaluationCriteria": [
    { "name": "기준명", "weight": 50, "description": "설명" }
  ],
  "rules": ["규칙1", "규칙2"],
  "faq": [
    { "question": "질문", "answer": "답변" }
  ],
  "metrics": ["지표1"],
  "submissionType": "csv | json | markdown",
  "submissionDescription": "제출 형식 설명"
}

한국어로 작성하세요. 실용적이고 구체적으로 작성하세요.
평가 기준의 weight 합계는 반드시 100이어야 합니다.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip, 3)) {
    return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string' || prompt.length > 1000) {
    return Response.json({ error: 'INVALID_PROMPT' }, { status: 400 });
  }

  let text = '';
  try {
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
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      return Response.json({ error: 'OPENAI_ERROR' }, { status: 502 });
    }

    const data = await response.json();
    text = data.choices?.[0]?.message?.content || '';
  } catch {
    return Response.json({ error: 'OPENAI_REQUEST_FAILED' }, { status: 502 });
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json({ result: parsed });
  } catch {
    return Response.json({ error: 'PARSE_ERROR', raw: text }, { status: 500 });
  }
}
