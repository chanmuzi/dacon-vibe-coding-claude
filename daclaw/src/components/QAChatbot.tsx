'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react';
import { useHackathonStore } from '@/store/hackathon';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'bot',
  text: '안녕하세요! DACLAW 도우미입니다. 대회 정보, 규칙, 일정 등 무엇이든 물어보세요.',
};

const SUGGESTED_QUESTIONS = [
  '이 대회의 평가 기준은?',
  '마감일이 언제인가요?',
  '참가 조건은 무엇인가요?',
  '상금 구조를 알려주세요',
];

function getAnswer(question: string, hackathons: ReturnType<typeof useHackathonStore.getState>['hackathons']): string {
  const q = question.toLowerCase();

  if (/상금|prize|시상|award/.test(q)) {
    const lines = hackathons
      .filter((h) => h.status === 'active')
      .slice(0, 3)
      .map((h) => {
        const top = h.prizes[0];
        return `• ${h.title}: ${top ? `1위 ${top.amount}` : '미정'}`;
      });
    return lines.length > 0
      ? `현재 진행 중인 대회 상금 정보:\n${lines.join('\n')}`
      : '현재 진행 중인 대회가 없습니다.';
  }

  if (/일정|마감|deadline|날짜|기간|시작|종료/.test(q)) {
    const lines = hackathons
      .filter((h) => h.status === 'active')
      .slice(0, 3)
      .map((h) => `• ${h.title}: ${h.startDate} ~ ${h.endDate}`);
    return lines.length > 0
      ? `대회 일정 정보:\n${lines.join('\n')}`
      : '현재 진행 중인 대회가 없습니다.';
  }

  if (/팀|team|멤버|member|모집|recruit/.test(q)) {
    const lines = hackathons
      .filter((h) => h.status === 'active')
      .slice(0, 3)
      .map((h) => `• ${h.title}: 최대 ${h.teamPolicy.maxMembers}명${h.teamPolicy.solo ? ', 개인 참가 가능' : ''}`);
    return lines.length > 0
      ? `팀 구성 정보:\n${lines.join('\n')}`
      : '현재 진행 중인 대회가 없습니다.';
  }

  if (/제출|submit|submission|파일|upload/.test(q)) {
    return '제출 방법: 대회 상세 페이지 → [제출하기] 버튼 클릭 → 파일 업로드 또는 텍스트 입력 후 제출하세요. 제출 횟수에 제한이 없으며, 최고 점수가 반영됩니다.';
  }

  if (/참가|참여|join|register|등록/.test(q)) {
    const active = hackathons.filter((h) => h.status === 'active');
    if (active.length === 0) return '현재 진행 중인 대회가 없습니다.';
    const lines = active.map((h) => `• ${h.title} (마감: ${h.endDate})`);
    return `현재 참가 가능한 대회:\n${lines.join('\n')}\n\n대회 상세 페이지에서 참가 신청하세요.`;
  }

  if (/대회|hackathon|해커톤|contest/.test(q)) {
    const lines = hackathons.slice(0, 5).map((h) =>
      `• ${h.title} [${h.status === 'active' ? '진행중' : h.status === 'upcoming' ? '예정' : '종료'}]`
    );
    return `등록된 대회 목록:\n${lines.join('\n')}`;
  }

  if (/랭킹|ranking|순위|점수|score/.test(q)) {
    return '랭킹은 상단 메뉴의 [랭킹] 페이지에서 확인할 수 있습니다. 대회 참여, 커뮤니티 활동으로 점수를 쌓아 등급을 올릴 수 있습니다.';
  }

  if (/커뮤니티|community|질문|tip|게시판/.test(q)) {
    return '커뮤니티 페이지에서 질문, 팁 공유, 팀원 모집 등 다양한 게시글을 작성하고 소통할 수 있습니다.';
  }

  if (/평가|기준|criteria|metric/.test(q)) {
    return '평가 기준은 대회마다 다릅니다. 각 대회 상세 페이지에서 평가 방식 및 지표를 확인하세요.';
  }

  return '죄송합니다, 관련 정보를 찾지 못했습니다. 다른 키워드로 검색해보세요.\n\n가능한 질문 예시:\n• 상금 정보\n• 대회 일정\n• 팀 구성\n• 제출 방법\n• 참가 방법';
}

export default function QAChatbot() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hackathons = useHackathonStore((s) => s.hackathons);

  // M1: Manage visibility with delay on close for animation
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;
    const userMsg: ChatMessage = { role: 'user', text: msgText };
    const botText = getAnswer(msgText, hackathons);
    const botMsg: ChatMessage = { role: 'bot', text: botText };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) send();
  };

  // M4: Reset conversation
  const handleReset = () => {
    if (window.confirm('새 대화를 시작하시겠습니까?')) {
      setMessages([WELCOME_MESSAGE]);
      setInput('');
    }
  };

  // M5: Suggestion chip click
  const handleSuggestion = (question: string) => {
    send(question);
  };

  const isWelcomeOnly = messages.length === 1;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* M1: Chat Popup with animation — always rendered when visible */}
      {visible && (
        <div
          className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm flex flex-col"
          style={{
            maxHeight: '500px',
            transition: 'transform 300ms ease, opacity 300ms ease',
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            opacity: open ? 1 : 0,
          }}
        >
          {/* M3: Header with branding emoji + M4: Reset button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border rounded-t-2xl bg-primary text-text-on-primary">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-semibold text-sm">🦞 DACLAW 도우미</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="대화 초기화"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                data-testid="chatbot-message"
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-text-on-primary'
                      : 'bg-primary-light text-text-primary'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* M5: Suggestion chips — shown only when welcome message is alone */}
            {isWelcomeOnly && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestion(q)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-light text-primary hover:bg-primary hover:text-text-on-primary transition-colors cursor-pointer"
                  >
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
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-primary text-text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-40"
              aria-label="전송"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        data-testid="chatbot-toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-primary text-text-on-primary shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        aria-label="챗봇 열기"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
