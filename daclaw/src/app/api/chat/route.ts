import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `당신은 DACLAW 해커톤 플랫폼의 AI 도우미입니다.
아래 제공된 대회 정보를 기반으로 사용자의 질문에 답변하세요.
대회와 무관한 질문에는 "죄송합니다, 저는 대회 관련 질문에만 답변할 수 있습니다." 라고 안내하세요.
답변은 한국어로, 간결하고 친절하게 해주세요. 마크다운 사용은 최소화하세요.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { messages, hackathonContext } = await req.json();

  const systemContent = `${SYSTEM_PROMPT}\n\n--- 대회 정보 ---\n${hackathonContext}`;

  const openaiMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
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
    const err = await response.text();
    return Response.json({ error: 'OPENAI_ERROR', detail: err }, { status: 502 });
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
