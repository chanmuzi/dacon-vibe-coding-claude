'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, RotateCcw, Loader2 } from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_TEXT = '안녕하세요! DACLAW 도우미입니다. 대회 정보, 규칙, 일정 등 무엇이든 물어보세요.';

const SUGGESTED_QUESTIONS = [
  '이 대회의 평가 기준은?',
  '마감일이 언제인가요?',
  '참가 조건은 무엇인가요?',
  '상금 구조를 알려주세요',
];

// Fallback keyword-based answer when API is unavailable
function getLocalAnswer(question: string, hackathons: ReturnType<typeof useHackathonStore.getState>['hackathons']): string {
  const q = question.toLowerCase();

  if (/상금|prize|시상|award/.test(q)) {
    const lines = hackathons.filter((h) => h.status === 'active').slice(0, 3)
      .map((h) => `• ${h.title}: ${h.prizes[0] ? `1위 ${h.prizes[0].amount}` : '미정'}`);
    return lines.length > 0 ? `현재 진행 중인 대회 상금 정보:\n${lines.join('\n')}` : '현재 진행 중인 대회가 없습니��.';
  }
  if (/일정|마감|deadline|날짜|기간|시작|종료/.test(q)) {
    const lines = hackathons.filter((h) => h.status === 'active').slice(0, 3)
      .map((h) => `• ${h.title}: ${h.startDate} ~ ${h.endDate}`);
    return lines.length > 0 ? `대회 일정 정보:\n${lines.join('\n')}` : '현재 진행 중인 대회가 없습니다.';
  }
  if (/팀|team|멤버|member|모집|recruit/.test(q)) {
    const lines = hackathons.filter((h) => h.status === 'active').slice(0, 3)
      .map((h) => `• ${h.title}: 최대 ${h.teamPolicy.maxMembers}명${h.teamPolicy.solo ? ', 개인 참가 가능' : ''}`);
    return lines.length > 0 ? `팀 구성 정보:\n${lines.join('\n')}` : '현재 진행 중인 대회가 없습니다.';
  }
  if (/제출|submit|submission|파일|upload/.test(q)) {
    return '대회 상세 페이지 → [제출하기] 버튼 클릭 → 파일 업로드 또는 텍스트 입력 후 제출하세요.';
  }
  if (/평가|기준|criteria|metric/.test(q)) {
    const active = hackathons.filter((h) => h.status === 'active');
    const lines = active.slice(0, 2).map((h) => {
      const criteria = (h.evaluationCriteria ?? []).map((c) => `${c.name} (${c.weight}%)`).join(', ');
      return `• ${h.title}: ${criteria || '대회 상세 페이지 참고'}`;
    });
    return lines.length > 0 ? `평가 기준:\n${lines.join('\n')}` : '평가 기준은 대회마다 다릅니다. 각 대회 상세 페이지에서 확인하세요.';
  }
  if (/대회|hackathon|해커톤|contest/.test(q)) {
    const lines = hackathons.slice(0, 5).map((h) =>
      `• ${h.title} [${h.status === 'active' ? '진행중' : h.status === 'upcoming' ? '예정' : '종료'}]`);
    return `등록된 대회 목록:\n${lines.join('\n')}`;
  }
  return '죄송합니다, 관련 정보를 찾지 못했습니다. 다른 키워드로 검색해보세요.\n\n• 상금 정보\n• 대회 일정\n• 팀 구성\n• 제출 방법\n• 평가 기준';
}

function buildHackathonContext(hackathons: ReturnType<typeof useHackathonStore.getState>['hackathons']): string {
  return hackathons.slice(0, 5).map((h) => {
    const criteria = (h.evaluationCriteria ?? []).map((c) => `${c.name}(${c.weight}%)`).join(', ');
    const prizes = h.prizes.map((p) => `${p.label}: ${p.amount}`).join(', ');
    const faq = (h.faq ?? []).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    return `## ${h.title} [${h.status}]
- 기간: ${h.startDate} ~ ${h.endDate}
- 주최: ${h.organizer}
- 유형: ${h.type}
- 태그: ${h.tags.join(', ')}
- 상금: ${prizes}
- 팀: 최대 ${h.teamPolicy.maxMembers}명${h.teamPolicy.solo ? ', 개인 가능' : ''}
- 평가: ${criteria || '미정'}
- 설명: ${h.description}
${h.rules ? `- 규칙:\n${h.rules.map((r) => `  · ${r}`).join('\n')}` : ''}
${faq ? `- FAQ:\n${faq}` : ''}`;
  }).join('\n\n');
}

export default function QAChatbot() {
  const pathname = usePathname();
  const isHackathonPage = pathname.startsWith('/hackathons');

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_TEXT },
  ]);
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) setVisible(true);
      return !prev;
    });
  }, []);

  const closeChatbot = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setVisible(false), 170);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeChatbot(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, closeChatbot]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeChatbot();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, closeChatbot]);

  const send = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const hackathons = useHackathonStore.getState().hackathons;
      const context = buildHackathonContext(hackathons);

      // Only send conversation (skip welcome message)
      const apiMessages = newMessages
        .filter((_, i) => i > 0 || newMessages[0].role === 'user')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, hackathonContext: context }),
      });

      if (!res.ok) {
        // Fallback to local keyword matching
        const fallback = getLocalAnswer(msgText, hackathons);
        setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        return;
      }

      // Parse SSE stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let botText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              botText += delta;
              const captured = botText;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: captured };
                return updated;
              });
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      // If no content came through, fallback
      if (!botText.trim()) {
        const fallback = getLocalAnswer(msgText, hackathons);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fallback };
          return updated;
        });
      }
    } catch {
      const hackathons = useHackathonStore.getState().hackathons;
      const fallback = getLocalAnswer(msgText, hackathons);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) send();
  };

  const confirmReset = () => {
    setMessages([{ role: 'assistant', content: WELCOME_TEXT }]);
    setInput('');
    setShowResetConfirm(false);
  };

  const isWelcomeOnly = messages.length === 1;

  // 대회 페이지에서만 챗봇 표시
  if (!isHackathonPage) return null;

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {visible && (
        <div
          className={`bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm flex flex-col modal-panel ${open ? 'entering' : 'pointer-events-none'}`}
          style={{ maxHeight: '500px' }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between px-4 py-3 border-b border-border rounded-t-2xl bg-primary text-text-on-primary">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-semibold text-sm">DACLAW 도우미</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowResetConfirm(true)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer" title="대화 초기���">
                <RotateCcw size={16} />
              </button>
              <button onClick={closeChatbot} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer" title="닫기">
                <X size={16} />
              </button>
            </div>
            {showResetConfirm && (
              <div className="absolute top-full left-0 right-0 bg-surface border border-border rounded-b-xl shadow-md px-4 py-3 flex items-center gap-3 z-10">
                <span className="text-xs text-text-primary flex-1">새 대화를 시작하시겠습니까?</span>
                <button onClick={confirmReset} className="text-xs font-semibold px-3 py-1.5 bg-primary text-text-on-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer active:scale-[0.98]">확인</button>
                <button onClick={() => setShowResetConfirm(false)} className="text-xs font-semibold px-3 py-1.5 bg-background text-text-secondary rounded-lg hover:bg-interactive-hover transition-colors cursor-pointer active:scale-[0.98]">취소</button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} data-testid="chatbot-message" className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-line ${
                  msg.role === 'user' ? 'bg-primary text-text-on-primary' : 'bg-primary-light text-text-primary'
                }`}>
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <Loader2 size={14} className="animate-spin" /> 답변 생성 중...
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}

            {isWelcomeOnly && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-light text-primary hover:bg-primary hover:text-text-on-primary transition-colors cursor-pointer">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border flex gap-2">
            <input
              data-testid="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="질문을 입력하세요..."
              disabled={loading}
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow disabled:opacity-60"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-primary text-text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-40 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="전송"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* FAB Toggle */}
      <button
        data-testid="chatbot-toggle"
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full bg-primary text-text-on-primary shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer ${!open ? 'animate-breathing' : ''}`}
        title={open ? '챗봇 닫기' : 'DACLAW 도우미와 대화하기'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
