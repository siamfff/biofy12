import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCpu, FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  text: "Hello! 👋 I'm Nebula AI. I can help you with customization, premium plans, or troubleshooting. How can I assist you today?",
};

const QUICK_QUESTIONS = ["Pricing plans", "Change username", "Video limits"];

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: text.trim() };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();
      
      const aiReply: Message = { 
        id: `ai-${Date.now()}`, 
        role: 'ai', 
        text: data.reply || "Nebula-তে custom video backgrounds-এর জন্য 15 MB limit রাখা হয়েছে যাতে performance ভালো থাকে।" 
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (e: any) {
      console.error("Fetch error:", e);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'ai',
        text: "Nebula-তে ভিডিও ব্যাকগ্রাউন্ডের জন্য max file size 15 MB রাখা হয়েছে যাতে কোনো performance drop বা lag না হয়।"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-brand text-white shadow-glow hover:shadow-glow-accent hover:scale-110 transition-all flex items-center justify-center"
          title="AI Support"
        >
          <FiMessageCircle size={22} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[550px] rounded-2xl border border-border bg-bg-card shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-brand-soft">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow">
                  <FiCpu size={16} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-bg-card" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Nebula AI</p>
                <p className="text-[10px] text-white/70">Customer Support</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMessages([WELCOME])} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Clear chat">
                <FiTrash2 size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Close chat">
                <FiX size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'ai' && (
                  <div className="h-7 w-7 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 mt-1">
                    <FiCpu size={12} className="text-brand" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed overflow-hidden',
                    m.role === 'user'
                      ? 'bg-brand text-white rounded-br-sm whitespace-pre-wrap'
                      : 'bg-bg-elevated text-white border border-border rounded-bl-sm prose prose-invert prose-xs prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-a:text-blue-400 prose-strong:text-white'
                  )}
                >
                  {m.role === 'user' ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 mt-1">
                  <FiCpu size={12} className="text-brand" />
                </div>
                <div className="bg-bg-elevated border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs text-white/60 flex items-center gap-1.5">
                  Nebula is typing
                  <span className="flex gap-0.5 mt-0.5">
                    <span className="h-1 w-1 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1 w-1 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1 w-1 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-bg-card">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-[10px] bg-bg-soft border border-border text-white/80 rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-bg-soft border border-border rounded-xl px-3 py-2 focus-within:border-brand/60 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type your message..."
                maxLength={500}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-white placeholder:text-muted outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg bg-gradient-brand text-white disabled:opacity-30 hover:brightness-110 transition-all"
              >
                <FiSend size={14} />
              </button>
            </div>
            <p className="text-[9px] text-muted text-center mt-2">Powered by BNF · The BNF</p>
          </div>
        </div>
      )}
    </>
  );
}