import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Something went wrong');
    return;
  }

  if (!resp.body) { onError('No response'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
  onDone();
}

export function OnboardingChatWidget() {
  const { language } = useLanguage();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const greeting: Msg = {
    role: 'assistant',
    content: isDashboard
      ? (language === 'bn'
        ? 'আসসালামু আলাইকুম! 👋 আমি আপনার পেমেন্ট সহকারী। বিকাশ, ব্যাংক ট্রান্সফার বা ক্যাশ — যেকোনো পেমেন্ট পদ্ধতিতে সাহায্য করতে পারি। কোন পদ্ধতিতে পেমেন্ট করতে চান?'
        : "Hello! 👋 I'm your payment assistant. I can guide you through bKash, Bank Transfer, or Cash payment. Which method would you like to use?")
      : (language === 'bn'
        ? 'আসসালামু আলাইকুম! 👋 আমি DigiWebDex এর AI সহকারী। ডোমেইন, হোস্টিং, ওয়েবসাইট তৈরি, বা পেমেন্ট — যেকোনো বিষয়ে সাহায্য করতে পারি। কীভাবে সাহায্য করতে পারি?'
        : "Hello! 👋 I'm DigiWebDex's AI assistant. I can help with domains, hosting, website development, or payments. How can I help you today?"),
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([greeting]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > updated.length) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev.slice(0, updated.length), { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      // Only send user/assistant messages (skip greeting if it wasn't from the API)
      const apiMessages = updated.filter((_, i) => i > 0 || updated[0].role === 'user');
      await streamChat({
        messages: apiMessages.length ? apiMessages : [userMsg],
        onDelta: upsert,
        onDone: () => setLoading(false),
        onError: (msg) => {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }]);
      setLoading(false);
    }
  }, [input, loading, messages]);

  const quickPrompts = isDashboard
    ? (language === 'bn'
      ? ['বিকাশে পেমেন্ট করব', 'ব্যাংক ট্রান্সফার করব', 'ক্যাশে পেমেন্ট করব', 'পেমেন্ট প্রুফ জমা দিতে চাই', 'পেমেন্ট ভেরিফাই হয়নি']
      : ['Pay via bKash', 'Pay via Bank Transfer', 'Pay with Cash', 'Submit payment proof', 'Payment not verified'])
    : (language === 'bn'
      ? ['ডোমেইন কিনতে চাই', 'হোস্টিং প্ল্যান দেখান', 'পেমেন্ট কিভাবে করব?', 'অর্ডার স্ট্যাটাস']
      : ['Buy a domain', 'Show hosting plans', 'How to pay?', 'Order status']);

  return (
    <>
      {/* Chat Toggle - positioned above WhatsApp on desktop */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'fixed z-50 rounded-full shadow-xl transition-all duration-300',
          'bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/30',
          'md:bottom-[8.5rem] md:right-6 h-14 w-14',
          'bottom-[4.5rem] left-4 md:left-auto',
          open && 'rotate-90 scale-90'
        )}
        aria-label="AI Assistant"
      >
        {open ? <X className="h-6 w-6 mx-auto" /> : (isDashboard ? <CreditCard className="h-6 w-6 mx-auto" /> : <Bot className="h-6 w-6 mx-auto" />)}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className={cn(
          'fixed z-50 flex flex-col bg-background border rounded-2xl shadow-2xl overflow-hidden',
          'md:bottom-[12rem] md:right-6 md:w-[400px] md:h-[520px]',
          'bottom-[7rem] left-4 right-4 h-[60vh] md:left-auto'
        )}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{isDashboard ? (language === 'bn' ? 'পেমেন্ট সহকারী' : 'Payment Assistant') : 'DigiWebDex AI'}</p>
              <p className="text-xs opacity-80">
                {isDashboard ? (language === 'bn' ? 'পেমেন্ট গাইড' : 'Payment Guide') : (language === 'bn' ? 'অনবোর্ডিং সহকারী' : 'Onboarding Assistant')}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-sm max-w-[80%] whitespace-pre-wrap leading-relaxed',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts (only when few messages) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.form?.requestSubmit(), 50); }}
                  className="text-xs border rounded-full px-3 py-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t px-3 py-2.5 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Type your question...'}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="h-8 w-8 rounded-full" disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
