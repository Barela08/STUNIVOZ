import React, { useState, useEffect } from 'react';
import { Bot, Loader2, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const AiHelpPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'ai_help');
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          setEmbedUrl(snap.data()?.embedUrl || '');
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const reload = () => setIframeKey(k => k + 1);

  const displayHost = () => {
    try { return new URL(embedUrl).hostname; } catch { return embedUrl; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading AI Help...</span>
        </div>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Help Not Configured</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
          The admin has not set up the AI Help assistant yet. Please check back later or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      {/* Browser-style top bar */}
      <div className="flex items-center gap-2 px-3 lg:px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        {/* Icon + title */}
        <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-0">
          <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono">{embedUrl}</span>
        </div>

        {/* Reload */}
        <button
          onClick={reload}
          title="Reload"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Open in new tab */}
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in browser tab"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Host label */}
      <div className="px-3 lg:px-4 py-1 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-600">{displayHost()}</span>
      </div>

      {/* Iframe — always try to load */}
      <div className="flex-1 relative bg-white dark:bg-gray-950">
        <iframe
          key={iframeKey}
          src={embedUrl}
          className="w-full h-full border-0"
          allow="microphone; camera; clipboard-write"
          title="AI Help Assistant"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        />
      </div>
    </div>
  );
};
