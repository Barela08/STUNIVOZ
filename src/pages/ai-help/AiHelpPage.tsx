import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { careerChatReply } from '../../services/aiService';

type Message = { role: 'bot' | 'user'; text: string; ts: number };

const QUICK_PROMPTS = [
  'How do I find internships?',
  'Help me write my resume',
  'Interview tips for freshers',
  'Top skills to learn in 2026',
  'How to crack campus placements?',
  'Best platforms for online courses',
];

function formatText(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (/^#{1,3} /.test(line)) {
      const content = line.replace(/^#{1,3} /, '');
      return <p key={i} className="font-bold text-gray-900 dark:text-white text-sm mt-2">{content}</p>;
    }
    if (/^[•*-] /.test(line)) {
      const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <span className="text-primary-500 mt-0.5 shrink-0">•</span>
          <span>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</span>
        </p>
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
  });
}

export const AiHelpPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    ts: Date.now(),
    text: `Hello! I'm your AI Career Advisor 👋\n\nI'm here to help you with everything career-related:\n• Finding and applying for internships\n• Resume writing & ATS optimization\n• Interview preparation (HR, technical, DSA)\n• Career roadmaps & skill building\n• Salary benchmarks & job market insights\n\nWhat can I help you with today?`,
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput('');
    setError('');
    const ts = Date.now();
    setMessages(prev => [...prev, { role: 'user', text: msg, ts }]);
    setTyping(true);

    // Auto-resize textarea reset
    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const history = messages.slice(-10);
      const reply = await careerChatReply(msg, history);
      setMessages(prev => [...prev, { role: 'bot', text: reply, ts: Date.now() }]);
    } catch (err: any) {
      const m = err?.message || '';
      if (m.includes('No API key')) {
        setError('AI not configured. Ask your admin to add an API key in Admin → AI Settings → API Keys.');
      } else {
        setError(`Could not get a response. ${m}`);
      }
      setMessages(prev => [...prev, {
        role: 'bot', ts: Date.now(),
        text: "Sorry, I couldn't respond right now. Please try again in a moment.",
      }]);
    } finally {
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const copyMsg = (text: string, ts: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(ts);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const clearChat = () => {
    setMessages([{
      role: 'bot', ts: Date.now(),
      text: "Chat cleared! How can I help you?",
    }]);
    setError('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6 bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 shadow-sm">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">AI Career Advisor</h1>
          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Online · STUNIVOZ Assistant
          </p>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.ts} className={`flex gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {/* Bot avatar */}
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Bubble */}
            <div className={`relative max-w-[80%] lg:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
              }`}>
                {msg.role === 'user'
                  ? <p className="text-sm leading-relaxed">{msg.text}</p>
                  : <div className="space-y-0.5">{formatText(msg.text)}</div>
                }
              </div>

              {/* Copy button (bot messages only) */}
              {msg.role === 'bot' && (
                <button
                  onClick={() => copyMsg(msg.text, msg.ts)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                >
                  {copied === msg.ts ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied === msg.ts ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {/* User avatar */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-xs shadow-sm">
                You
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3 items-end">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-sm px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts ── */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-2 flex-shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={typing}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            {p}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div className="px-4 pb-4 pt-2 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex gap-2 items-end bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask me anything about your career..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none min-h-[36px] max-h-[120px] py-1.5"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm flex-shrink-0 mb-0.5"
          >
            {typing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-1.5">
          AI responses may not always be accurate. Verify important information.
        </p>
      </div>
    </div>
  );
};
