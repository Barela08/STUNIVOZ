import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, RefreshCw, Bot, Send, Copy, Check,
  Sparkles, Briefcase, FileText, Code2, GraduationCap,
  Mic, StopCircle, ChevronRight, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { careerChatReply } from '../../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  ts: Date;
}

const QUICK_PROMPTS = [
  { icon: Briefcase,     label: 'Find internships',       text: 'How do I find good internships as a 2nd year CS student?' },
  { icon: FileText,      label: 'Resume tips',            text: 'Review my resume structure and give me ATS optimization tips.' },
  { icon: Code2,         label: 'DSA interview prep',     text: 'How should I prepare for DSA interviews at top product companies?' },
  { icon: GraduationCap, label: 'Career roadmap',         text: 'I want to become a full-stack developer. Give me a 6-month roadmap.' },
];

function formatText(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { nodes.push(<br key={key++} />); continue; }

    if (/^#{1,3}\s/.test(trimmed)) {
      const content = trimmed.replace(/^#+\s/, '');
      nodes.push(<p key={key++} className="font-bold text-gray-900 dark:text-white mt-3 mb-1">{content}</p>);
    } else if (/^[\-\*•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[\-\*•]\s/, '');
      nodes.push(
        <div key={key++} className="flex items-start gap-2 my-0.5">
          <span className="text-primary-500 mt-1 flex-shrink-0">•</span>
          <span>{applyInline(content)}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) nodes.push(
        <div key={key++} className="flex items-start gap-2 my-0.5">
          <span className="text-primary-500 font-semibold flex-shrink-0 w-5">{match[1]}.</span>
          <span>{applyInline(match[2])}</span>
        </div>
      );
    } else {
      nodes.push(<p key={key++} className="my-1 leading-relaxed">{applyInline(trimmed)}</p>);
    }
  }
  return nodes;
}

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono text-primary-600 dark:text-primary-400">{part.slice(1, -1)}</code>;
    return part;
  });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export const AiHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  };

  const handleCopy = (msg: Message) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError('');
    const userMsg: Message = { id: Date.now() + 'u', role: 'user', text: trimmed, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, text: m.text }));
      const reply = await careerChatReply(trimmed, history);
      const botMsg: Message = { id: Date.now() + 'b', role: 'bot', text: reply, ts: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError('');
    setInput('');
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6 bg-gray-50 dark:bg-gray-950">

      {/* ── Browser-style top bar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          title="New chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Fake URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 dark:text-gray-400 select-none">stunivoz.ai/ai-assistant</span>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0 ml-auto" />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400 hidden sm:inline">AI Assistant</span>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Welcome screen */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Career Assistant</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                Ask me anything about internships, resumes, interviews, or your career path.
              </p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl mt-2">
              {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  onClick={() => send(text)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 group`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 shadow">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[80%] relative ${msg.role === 'user' ? '' : ''}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
              }`}>
                {msg.role === 'bot' ? formatText(msg.text) : <p>{msg.text}</p>}
              </div>

              {/* Copy button */}
              <button
                onClick={() => handleCopy(msg)}
                className={`absolute -bottom-5 ${msg.role === 'user' ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-0.5 px-1.5 rounded`}
              >
                {copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copiedId === msg.id ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-1 shadow text-white text-xs font-bold">
                U
              </div>
            )}
          </div>
        ))}

        {/* Typing animation */}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 shadow">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div ref={bottomRef} className="h-6" />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); adjustTextarea(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your career..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none leading-relaxed"
            style={{ maxHeight: '140px' }}
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all flex-shrink-0 self-end"
          >
            {loading
              ? <StopCircle className="w-4 h-4" />
              : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
          Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-mono">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
