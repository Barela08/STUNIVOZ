import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const NON_EMBEDDABLE_HOSTS = [
  'chat.openai.com',
  'chatgpt.com',
  'claude.ai',
  'bard.google.com',
  'gemini.google.com',
  'bing.com',
  'copilot.microsoft.com',
];

function isKnownNonEmbeddable(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return NON_EMBEDDABLE_HOSTS.some(h => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

export const AiHelpPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'ai_help');
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          const url = snap.data()?.embedUrl || '';
          setEmbedUrl(url);
          setIframeBlocked(isKnownNonEmbeddable(url));
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const reload = () => {
    setIframeBlocked(isKnownNonEmbeddable(embedUrl));
    setIframeKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
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
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 lg:-m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-sm">AI Career Assistant</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI — ask anything about your career</p>
          </div>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
          title="Reload chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-950">
        {iframeBlocked ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Embedding Not Supported</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-1">
              <strong className="text-gray-700 dark:text-gray-300">{(() => { try { return new URL(embedUrl).hostname; } catch { return embedUrl; } })()}</strong> does not allow embedding inside other apps.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs max-w-xs mb-6">
              Try using an AI that supports embedding, such as a custom Chatbase chatbot, Tidio, or any tool that provides an embeddable iframe link.
            </p>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25"
            >
              <Bot className="w-4 h-4" />
              Open AI Assistant
            </a>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">Opens in a new tab</p>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            id="ai-help-iframe"
            src={embedUrl}
            className="w-full h-full border-0"
            allow="microphone; camera"
            title="AI Help Assistant"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  );
};
