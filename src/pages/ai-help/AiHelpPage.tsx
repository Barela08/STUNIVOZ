import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Loader2, Send, RefreshCw, Sparkles, Globe, ExternalLink,
  ArrowLeft, ArrowRight, Home, AlertTriangle, X, ChevronRight
} from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { callAI } from '../../services/aiService';

// ─── Blocked-site detection helpers ──────────────────────────────────────────
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

// ─── Built-in AI chat (fallback when no URL set) ──────────────────────────────
type Message = { role: 'bot' | 'user'; text: string };

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-1" />;
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      const content = line.slice(2);
      const parts = content.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="shrink-0 text-primary-500 mt-0.5">•</span>
          <span>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
        </p>
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
  });
}

const QUICK_PROMPTS = [
  'How do I find internships?',
  'Resume writing tips',
  'Interview preparation',
  'Top skills to learn in 2026',
];

// ─── Main component ───────────────────────────────────────────────────────────
export const AiHelpPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [aiName, setAiName] = useState('AI Help Assistant');
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'ai_help');
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setEmbedUrl(data?.embedUrl || null);
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

  if (embedUrl) {
    return <BrowserView url={embedUrl} aiName={aiName} />;
  }

  return <BuiltInChat aiName={aiName} />;
};

// ─── Browser view (iframe) ────────────────────────────────────────────────────
const BrowserView: React.FC<{ url: string; aiName: string }> = ({ url, aiName }) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blocked = isKnownBlocked(currentUrl);
  const domain = getDomain(currentUrl);

  // Update when admin changes the URL from Firestore
  useEffect(() => {
    setCurrentUrl(url);
    setInputUrl(url);
    setLoading(true);
    setLoadError(false);
    setDismissed(false);
  }, [url]);

  // Auto-detect block: if blocked domain, set loadError after short delay
  useEffect(() => {
    if (blocked) {
      const t = setTimeout(() => { setLoading(false); setLoadError(true); }, 1800);
      return () => clearTimeout(t);
    }
  }, [blocked, currentUrl]);

  // Generic timeout: if loading for > 12s, probably blocked silently
  useEffect(() => {
    if (!blocked) {
      const t = setTimeout(() => { setLoading(false); }, 12000);
      return () => clearTimeout(t);
    }
  }, [blocked, currentUrl]);

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl.trim();
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);
    setLoading(true);
    setLoadError(false);
    setDismissed(false);
  };

  const reload = () => {
    setLoading(true);
    setLoadError(false);
    setDismissed(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6 bg-gray-100 dark:bg-gray-950">
      {/* Browser chrome */}
      <div className="flex flex-col gap-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
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
          <button
            onClick={() => navigate(url)}
            title="Home"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={reload}
            title="Reload"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          </button>

          {/* URL input */}
          <form
            className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent focus-within:border-primary-400 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all"
            onSubmit={e => { e.preventDefault(); navigate(inputUrl); }}
          >
            <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none min-w-0"
              placeholder="https://example.com"
              spellCheck={false}
            />
            {inputUrl !== currentUrl && (
              <button type="submit" className="flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-primary-500" />
              </button>
            )}
          </form>

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        {loading && !loadError && (
          <div className="absolute inset-0 z-10 bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {blocked ? `Checking ${domain}...` : `Loading ${domain}...`}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Please wait</p>
            </div>
            <div className="w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Blocked / error banner */}
        {loadError && !dismissed && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-md w-full text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {domain} blocks embedding
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                <strong>{domain}</strong> does not allow opening inside other websites for security reasons.
                This is common for ChatGPT, Claude, Gemini, and similar services.
                <br /><br />
                You can still open it in a new tab, or the admin can switch to a service that supports embedding.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open {domain} in New Tab
                </a>
                <button
                  onClick={() => setDismissed(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-all text-sm"
                >
                  Try Anyway
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-left">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">💡 Admin tip</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                  To embed an AI inside this page, use a service that allows iframe embedding, such as:
                  Tidio, Crisp, Intercom, a custom Gradio/Streamlit app, or your own hosted chatbot.
                  Change the URL in <strong>Admin → AI Control → AI Help Chat</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title={aiName}
          className={`w-full h-full border-0 ${loadError && !dismissed ? 'invisible' : 'visible'}`}
          allow="microphone; camera; clipboard-read; clipboard-write"
          onLoad={() => { setLoading(false); }}
          onError={() => { setLoading(false); setLoadError(true); }}
        />
      </div>

      {/* Bottom strip — always-visible open link */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <span className="text-xs text-gray-400 truncate max-w-[60%]">{currentUrl}</span>
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 flex-shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          Open in new tab
        </a>
      </div>
    </div>
  );
};

// ─── Built-in AI chat (when no URL configured) ────────────────────────────────
const BuiltInChat: React.FC<{ aiName: string }> = ({ aiName }) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    text: `Hi! I'm ${aiName} 👋\n\nI can help you with:\n• Finding and applying for internships\n• Resume writing and ATS optimization\n• Interview preparation (DSA, system design, HR)\n• Career roadmaps and skill building\n\nWhat would you like to know?`,
  }]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || typing) return;
    setInputText('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    try {
      const history = messages.slice(-8).map(m => `${m.role === 'bot' ? 'Assistant' : 'User'}: ${m.text}`).join('\n');
      const prompt = `You are ${aiName}, a helpful AI Career Advisor for STUNIVOZ, a student career development platform for Indian college students. Help with internships, resume, interviews, skills, and career guidance. Use Indian context (₹ for salary, Indian companies, portals like Internshala/LinkedIn/Naukri). Keep responses concise (150-250 words max) and practical.\n\n${history}\nUser: ${text}\nAssistant:`;
      const reply = await callAI(prompt, 'career_chat');
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const msg = err?.message || '';
      setError(msg.includes('No API key') ? 'AI not configured yet — ask admin to set an API key in Admin → AI Settings.' : `Error: ${msg}`);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I could not respond right now. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 lg:px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{aiName}</span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm'}`}>
              {msg.role === 'user' ? <p className="text-sm">{msg.text}</p> : <div className="space-y-0.5">{formatMessage(msg.text)}</div>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        {error && <div className="mx-auto max-w-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => setInputText(p)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about internships, resume, interviews..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
        />
        <button onClick={sendMessage} disabled={!inputText.trim() || typing} className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
