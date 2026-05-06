import React, { useState, useEffect, useRef } from 'react';
import { Loader2, RefreshCw, ExternalLink, Globe, Link2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const AiHelpPage: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'system_config', 'ai_help'),
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        setUrl(data?.embedUrl?.trim() || null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const reload = () => {
    setIframeLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
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
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">No link configured</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin ke paas jaao aur <strong>Admin → AI Control → AI Help Link</strong> mein URL set karo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate">{url}</span>
        <button
          onClick={reload}
          title="Reload"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${iframeLoading ? 'animate-spin text-primary-500' : ''}`} />
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* iframe — full remaining height */}
      <div className="flex-1 relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="AI Help"
          allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    </div>
  );
};
