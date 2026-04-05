import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

const SYSTEM_PROMPT = `당신은 DACLAW 해커톤 플랫폼의 AI 도우미입니다.
아래 제공된 대회 정보를 기반으로 사용자의 질문에 답변하세요.
대회와 무관한 질문에는 "죄송합니다, 저는 대회 관련 질문에만 답변할 수 있습니다." 라고 안내하세요.
답변은 한국어로, 간결하고 친절하게 해주세요. 마크다운 사용은 최소화하세요.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip, 10)) {
    return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  let body: { messages?: unknown; hackathonContext?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { messages, hackathonContext } = body;

  if (!Array.isArray(messages) || messages.length > 20) {
    return Response.json({ error: 'INVALID_MESSAGES' }, { status: 400 });
  }

  const systemContent = `${SYSTEM_PROMPT}\n\n--- 대회 정보 ---\n${hackathonContext}`;

  const openaiMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return Response.json({ error: 'OPENAI_ERROR' }, { status: 502 });
  }

  // Proxy the SSE stream directly
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
