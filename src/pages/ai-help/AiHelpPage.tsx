import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Copy, Check, RefreshCw,
  Sparkles, Briefcase, FileText, Code2, GraduationCap,
  RotateCcw, ChevronDown, AlertCircle
} from 'lucide-react';
import { careerChatReply } from '../../services/aiService';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

interface AiSettings {
  assistantName: string;
  greeting: string;
  logoUrl: string;
  themeColor: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: AiSettings = {
  assistantName: 'STUNIVOZ AI',
  greeting: 'How can I help you today?',
  logoUrl: '',
  themeColor: '#000000',
  enabled: true,
};

const SUGGESTIONS = [
  { icon: Briefcase,     text: 'How do I find internships as a 2nd year CS student?' },
  { icon: FileText,      text: 'Give me ATS resume tips for tech jobs.' },
  { icon: Code2,         text: 'How to prepare for DSA interviews at product companies?' },
  { icon: GraduationCap, text: 'Give me a 6-month full-stack developer roadmap.' },
];

function renderContent(text: string) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trimStart().startsWith('```')) {
      const lang = line.replace(/```/g, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      out.push(
        <div key={key++} className="my-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {lang && (
            <div className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 font-mono border-b border-gray-200 dark:border-gray-700">
              {lang}
            </div>
          )}
          <pre className="p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#+\s/, '');
      out.push(<p key={key++} className="font-bold text-gray-900 dark:text-white text-base mt-4 mb-1">{inlineFormat(content)}</p>);
      i++; continue;
    }

    if (/^[\-\*•]\s/.test(line.trimStart())) {
      const content = line.replace(/^[\s\-\*•]+/, '');
      out.push(
        <div key={key++} className="flex gap-2 my-0.5 ml-2">
          <span className="text-green-500 mt-1 flex-shrink-0 text-xs">●</span>
          <span className="text-gray-800 dark:text-gray-200 leading-relaxed">{inlineFormat(content)}</span>
        </div>
      );
      i++; continue;
    }

    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      out.push(
        <div key={key++} className="flex gap-2 my-0.5 ml-2">
          <span className="text-green-500 font-semibold flex-shrink-0 w-5 text-sm">{numMatch[1]}.</span>
          <span className="text-gray-800 dark:text-gray-200 leading-relaxed">{inlineFormat(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    if (!line.trim()) {
      out.push(<div key={key++} className="h-2" />);
      i++; continue;
    }

    out.push(<p key={key++} className="leading-relaxed text-gray-800 dark:text-gray-200 my-0.5">{inlineFormat(line)}</p>);
    i++;
  }

  return out;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-mono text-green-600 dark:text-green-400">{part.slice(1, -1)}</code>;
    return part;
  });
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function AiAvatar({ settings, size = 'md' }: { settings: AiSettings; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-8 h-8' : 'w-7 h-7';
  const iconSz = size === 'lg' ? 'w-7 h-7' : size === 'md' ? 'w-4 h-4' : 'w-4 h-4';

  if (settings.logoUrl) {
    return (
      <img
        src={settings.logoUrl}
        alt={settings.assistantName}
        className={`${sz} rounded-full object-cover flex-shrink-0 shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}
      style={{ backgroundColor: settings.themeColor || '#000000' }}
    >
      <Bot className={`${iconSz} text-white`} />
    </div>
  );
}

export const AiHelpPage: React.FC = () => {
  const [aiSettings, setAiSettings] = useState<AiSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'system_config', 'ai_settings'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setAiSettings({
            assistantName: d.assistantName || DEFAULT_SETTINGS.assistantName,
            greeting: d.greeting || DEFAULT_SETTINGS.greeting,
            logoUrl: d.logoUrl || '',
            themeColor: d.themeColor || DEFAULT_SETTINGS.themeColor,
            enabled: typeof d.enabled === 'boolean' ? d.enabled : true,
          });
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  const scrollToBottom = (smooth = true) =>
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const onScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const reset = () => { setMessages([]); setError(''); setInput(''); };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError('');

    const userMsg: Message = { id: `${Date.now()}u`, role: 'user', content: trimmed, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'assistant' ? 'bot' : 'user',
        text: m.content,
      }));
      const reply = await careerChatReply(trimmed, history);
      setMessages(prev => [...prev, {
        id: `${Date.now()}a`, role: 'assistant', content: reply, ts: new Date(),
      }]);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isEmpty = messages.length === 0 && !loading;
  const bgColor = aiSettings.themeColor || '#000000';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6 bg-white dark:bg-[#212121]">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#212121] flex-shrink-0">
        <div className="flex items-center gap-2">
          <AiAvatar settings={aiSettings} size="sm" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{aiSettings.assistantName}</span>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">STUNIVOZ AI</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto"
      >
        {/* Welcome screen */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 gap-6">
            <AiAvatar settings={aiSettings} size="lg" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{aiSettings.greeting}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ask anything about internships, resumes, interviews, or your career.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#2f2f2f] hover:bg-gray-50 dark:hover:bg-[#3a3a3a] transition-all text-left shadow-sm"
                >
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              {msg.role === 'assistant' ? (
                <AiAvatar settings={aiSettings} size="md" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Bubble */}
              <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-gray-50 dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5">{renderContent(msg.content)}</div>
                    : <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                </div>

                <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <CopyBtn text={msg.content} />
                  <span className="text-xs text-gray-400">
                    {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <AiAvatar settings={aiSettings} size="md" />
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-50 dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.includes('API key') || error.includes('No API key')
                  ? 'AI Assistant is currently unavailable. Please try again shortly or contact support.'
                  : error}
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-white dark:bg-[#212121]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-100 dark:bg-[#2f2f2f] rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 focus-within:border-gray-400 dark:focus-within:border-gray-500 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKey}
              placeholder={`Message ${aiSettings.assistantName}...`}
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none leading-relaxed"
              style={{ maxHeight: '160px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all flex-shrink-0 self-end hover:opacity-80"
              style={{ backgroundColor: bgColor }}
            >
              {loading
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            {aiSettings.assistantName} can make mistakes. Verify important info. &nbsp;·&nbsp; <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">Enter</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
};
