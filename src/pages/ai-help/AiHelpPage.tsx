import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Loader2, Send, RefreshCw, Sparkles, Globe, ExternalLink,
  Home, AlertTriangle, ChevronRight, MessageCircle, X
} from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { careerChatReply } from '../../services/aiService';

// ─── Blocked-site detection ───────────────────────────────────────────────────
const KNOWN_BLOCKED = [
  'chatgpt.com', 'chat.openai.com', 'claude.ai', 'gemini.google.com',
  'bard.google.com', 'bing.com/chat', 'perplexity.ai', 'copilot.microsoft.com',
];

function isKnownBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return KNOWN_BLOCKED.some(b => host.includes(b.replace('www.', '')));
  } catch { return false; }
}

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

// ─── Message formatting ───────────────────────────────────────────────────────
type Message = { role: 'bot' | 'user'; text: string };

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-1" />;
    if (/^[•*-] /.test(line)) {
      const content = line.slice(2);
      const parts = content.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="shrink-0 text-primary-500 mt-0.5">•</span>
          <span>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</span>
        </p>
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
      </p>
    );
  });
}

const QUICK_PROMPTS = [
  'How do I find internships?',
  'Resume writing tips',
  'Interview preparation',
  'Top skills to learn in 2026',
];

// ─── Main page ────────────────────────────────────────────────────────────────
export const AiHelpPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [aiName, setAiName] = useState('AI Help Assistant');
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'ai_help');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setEmbedUrl(data?.embedUrl?.trim() || null);
          setAiName(data?.aiName || 'AI Help Assistant');
        } else {
          setEmbedUrl(null);
        }
        setConfigLoading(false);
      },
      () => setConfigLoading(false)
    );
    return () => unsub();
  }, []);

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading AI Help...</span>
        </div>
      </div>
    );
  }

  // If URL is set but it's a known-blocked site → built-in chat + open-in-tab banner
  if (embedUrl && isKnownBlocked(embedUrl)) {
    return <BuiltInChat aiName={aiName} externalUrl={embedUrl} />;
  }

  // If URL is set and embeddable → full browser view
  if (embedUrl) {
    return <BrowserView url={embedUrl} aiName={aiName} />;
  }

  // No URL configured → built-in chat only
  return <BuiltInChat aiName={aiName} />;
};

// ─── Browser view (embeddable sites) ─────────────────────────────────────────
const BrowserView: React.FC<{ url: string; aiName: string }> = ({ url, aiName }) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setCurrentUrl(url);
    setInputUrl(url);
    setLoading(true);
    setTimedOut(false);
  }, [url]);

  // Generic timeout: after 15s assume it may be blocked silently
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 15000);
    return () => clearTimeout(t);
  }, [currentUrl]);

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl.trim();
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);
    setLoading(true);
    setTimedOut(false);
  };

  const reload = () => {
    setLoading(true);
    setTimedOut(false);
    if (iframeRef.current) iframeRef.current.src = currentUrl;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6 bg-gray-100 dark:bg-gray-950">
      {/* Browser chrome */}
      <div className="flex flex-col bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Bot className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{aiName}</span>
          </div>
        </div>

        {/* Address bar */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button onClick={() => navigate(url)} title="Home"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0">
            <Home className="w-4 h-4" />
          </button>
          <button onClick={reload} title="Reload"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          </button>
          <form className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent focus-within:border-primary-400 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all"
            onSubmit={e => { e.preventDefault(); navigate(inputUrl); }}>
            <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={inputUrl} onChange={e => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none min-w-0"
              placeholder="https://example.com" spellCheck={false} />
            {inputUrl !== currentUrl && (
              <button type="submit" className="flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-primary-500" />
              </button>
            )}
          </form>
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-500 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading {getDomain(currentUrl)}...</p>
            <div className="w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
        <iframe ref={iframeRef} src={currentUrl} title={aiName}
          className="w-full h-full border-0"
          allow="microphone; camera; clipboard-read; clipboard-write"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)} />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <span className="text-xs text-gray-400 truncate max-w-[60%]">{currentUrl}</span>
        <a href={currentUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 flex-shrink-0">
          <ExternalLink className="w-3 h-3" /> Open in new tab
        </a>
      </div>
    </div>
  );
};

// ─── Built-in AI Chat ─────────────────────────────────────────────────────────
const BuiltInChat: React.FC<{ aiName: string; externalUrl?: string }> = ({ aiName, externalUrl }) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    text: `Hi! I'm your AI Career Advisor 👋\n\nI can help you with:\n• Finding and applying for internships\n• Resume writing and ATS optimization\n• Interview preparation (DSA, system design, HR)\n• Career roadmaps and skill building\n\nWhat would you like help with today?`,
  }]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [bannerVisible, setBannerVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || typing) return;
    setInputText('');
    setError('');
    const newHistory: Message[] = [...messages, { role: 'user', text: msg }];
    setMessages(newHistory);
    setTyping(true);
    try {
      const reply = await careerChatReply(msg, messages);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('No API key')) {
        setError('AI not configured yet. Ask your admin to set an API key in Admin → AI Settings.');
      } else {
        setError(`Could not get a response: ${errMsg}`);
      }
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I could not respond right now. Please try again in a moment.' }]);
    } finally {
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const domain = externalUrl ? getDomain(externalUrl) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">

      {/* External site banner (when blocked site is configured) */}
      {externalUrl && bannerVisible && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="flex-1 text-xs text-amber-700 dark:text-amber-300 leading-tight">
            <strong>{domain}</strong> can't be embedded (browser security). Using built-in AI below.
          </p>
          <a href={externalUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0 whitespace-nowrap">
            <ExternalLink className="w-3 h-3" /> Open {domain}
          </a>
          <button onClick={() => setBannerVisible(false)}
            className="p-1 rounded text-amber-400 hover:text-amber-600 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{aiName}</p>
          <p className="text-xs text-gray-400">AI Career Advisor · STUNIVOZ</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${msg.role === 'user'
              ? 'bg-primary-500 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
            }`}>
              {msg.role === 'user'
                ? <p className="text-sm leading-relaxed">{msg.text}</p>
                : <div className="space-y-1">{formatMessage(msg.text)}</div>
              }
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <input ref={inputRef} value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about internships, resume, interviews..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all" />
        <button onClick={() => sendMessage()}
          disabled={!inputText.trim() || typing}
          className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
