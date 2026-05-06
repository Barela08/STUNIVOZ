import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, RefreshCw, ExternalLink, Globe,
  ArrowLeft, ArrowRight, Link2, ShieldAlert
} from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Sites that are KNOWN to block iframe embedding — show a helpful message instead of a blank screen
const BLOCKED_SITES = [
  'chatgpt.com', 'chat.openai.com', 'openai.com',
  'claude.ai', 'anthropic.com',
  'gemini.google.com', 'bard.google.com',
  'bing.com', 'copilot.microsoft.com',
];

function isKnownBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return BLOCKED_SITES.some(b => host === b || host.endsWith('.' + b));
  } catch { return false; }
}

const SUGGESTED_ALTERNATIVES = [
  { name: 'Poe.com', url: 'https://poe.com', desc: 'ChatGPT + Claude + Gemini — ek jagah' },
  { name: 'Perplexity AI', url: 'https://www.perplexity.ai', desc: 'AI-powered search & chat' },
  { name: 'You.com', url: 'https://you.com', desc: 'AI chatbot + web search' },
];

export const AiHelpPage: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blocked = url ? isKnownBlocked(url) : false;

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'system_config', 'ai_help'),
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        setUrl(data?.embedUrl?.trim() || null);
        setIframeLoading(true);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const reload = () => {
    setIframeLoading(true);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 50);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  /* ── No URL set ── */
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Link2 className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Koi link set nahi hai</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin panel → <strong>AI Control → AI Help Link</strong> → apni link daalo aur save karo.
          </p>
        </div>
      </div>
    );
  }

  /* ── Known-blocked site (ChatGPT, Claude, etc.) ── */
  if (blocked) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6">
        {/* Browser bar (cosmetic) */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button className="p-1.5 rounded-md text-gray-400" disabled><ArrowLeft className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-md text-gray-400" disabled><ArrowRight className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-md text-gray-400" disabled><RefreshCw className="w-4 h-4" /></button>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 mx-1 rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{url}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-gray-500 hover:text-primary-500 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Blocked message */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center bg-gray-50 dark:bg-gray-950">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Yeh website embed nahi hoti
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              <strong className="text-gray-700 dark:text-gray-300">{new URL(url).hostname}</strong> ne apni taraf se
              kisi bhi website ke andar khulna band kar rakha hai — yeh unka security rule hai.
              Duniya mein koi bhi is link ko iframe mein nahi khol sakta.
            </p>
          </div>

          {/* Alternatives */}
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Yeh AI tools embed ho jaate hain — Admin inhe try kare:
            </p>
            <div className="space-y-2">
              {SUGGESTED_ALTERNATIVES.map(alt => (
                <div key={alt.url} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-left shadow-sm">
                  <Globe className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{alt.name}</p>
                    <p className="text-xs text-gray-400 truncate">{alt.desc}</p>
                  </div>
                  <code className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded truncate max-w-[100px]">{alt.url}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Normal iframe browser ── */
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6">

      {/* Browser top bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-md text-gray-400 cursor-default" disabled>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={reload}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${iframeLoading ? 'animate-spin text-primary-500' : ''}`} />
        </button>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 mx-1 rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-inner min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{url}</span>
          <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="New tab mein kholo"
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-500 transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* iframe */}
      <div className="flex-1 relative bg-white dark:bg-gray-950">
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="AI Browser"
          allow="microphone; camera; clipboard-read; clipboard-write; fullscreen; autoplay"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    </div>
  );
};
