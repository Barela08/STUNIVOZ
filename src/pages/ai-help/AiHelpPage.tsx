import React, { useState, useEffect } from 'react';
import { Bot, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const AiHelpPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center gap-2">
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in new tab
          </a>
          <button
            onClick={() => {
              const iframe = document.getElementById('ai-help-iframe') as HTMLIFrameElement;
              if (iframe) { iframe.src = iframe.src; }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
            title="Reload chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-gray-50 dark:bg-gray-950">
        <iframe
          id="ai-help-iframe"
          src={embedUrl}
          className="w-full h-full border-0"
          allow="microphone; camera"
          title="AI Help Assistant"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
};
