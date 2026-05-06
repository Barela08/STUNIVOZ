import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, ExternalLink, Globe, ArrowLeft, ArrowRight, Link2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const AiHelpPage: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'system_config', 'ai_help'),
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        const newUrl = data?.embedUrl?.trim() || null;
        setUrl(newUrl);
        setIframeLoading(true);
        setIframeError(false);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const reload = () => {
    setIframeLoading(true);
    setIframeError(false);
    if (iframeRef.current) {
      // Force reload by toggling src
      const current = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = current;
      }, 50);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Link2 className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Koi link set nahi hai</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin panel mein jaao → <strong>AI Control → AI Help Link</strong> → apni link daalo aur save karo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-6">

      {/* ── Browser top bar ── */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">

        {/* Nav buttons */}
        <button
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          title="Back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          title="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={reload}
          title="Reload"
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${iframeLoading ? 'animate-spin text-primary-500' : ''}`} />
        </button>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 mx-1 rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-inner min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${url.startsWith('https') ? 'bg-green-500' : 'bg-yellow-400'}`} />
          <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1 select-all">
            {url}
          </span>
          <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        </div>

        {/* Open in new tab */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Naye tab mein kholo"
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-500 transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* ── iframe / content area ── */}
      <div className="flex-1 relative bg-white dark:bg-gray-950">

        {/* Loading spinner overlay */}
        {iframeLoading && !iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-400">Loading {url}…</p>
          </div>
        )}

        {/* Iframe */}
        {!iframeError && (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            title="AI Browser"
            allow="microphone; camera; clipboard-read; clipboard-write; fullscreen; autoplay"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            onLoad={() => setIframeLoading(false)}
            onError={() => { setIframeLoading(false); setIframeError(true); }}
          />
        )}

        {/* If site blocks iframe — show helpful message + open-in-new-tab button */}
        {iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-white dark:bg-gray-900 z-10">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <Globe className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">Yeh site embed nahi ho sakti</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Is website ne apni security settings ki wajah se embedding band kar rakhi hai. Isko new tab mein kholo:
              </p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all shadow"
            >
              <ExternalLink className="w-4 h-4" />
              New tab mein kholo
            </a>
            <p className="text-xs text-gray-400 mt-1">
              Admin: Koi aisi link use karo jo embedding allow kare (jaise poe.com, you.com, ya apna chatbot).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
