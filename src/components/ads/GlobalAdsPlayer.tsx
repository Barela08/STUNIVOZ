import React, { useEffect, useState, useRef, useCallback } from 'react';
import { db } from '../../services/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { X, ExternalLink, Volume2, VolumeX } from 'lucide-react';

interface BroadcastAd {
  active: boolean;
  adId?: string;
  title?: string;
  advertiser?: string;
  mediaType?: 'Image' | 'Video' | 'Text';
  imageUrl?: string;
  videoUrl?: string;
  textContent?: string;
  targetUrl?: string;
  ctaLabel?: string;
  displayMode?: 'popup' | 'overlay' | 'fullscreen';
  skippable?: boolean;
  skipAfter?: number;
  broadcastedAt?: number;
}

export const GlobalAdsPlayer: React.FC = () => {
  const [broadcast, setBroadcast] = useState<BroadcastAd | null>(null);
  const [visible, setVisible] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'active_broadcast');
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) { setBroadcast(null); setVisible(false); return; }
      const data = snap.data() as BroadcastAd;
      if (!data.active) { setBroadcast(null); setVisible(false); return; }
      const broadcastKey = `${data.adId || ''}_${data.broadcastedAt || 0}`;
      if (dismissed === broadcastKey) return;
      setBroadcast(data);
      setVisible(true);
      const skipSecs = data.skippable ? (data.skipAfter ?? 5) : 0;
      setSkipCountdown(skipSecs);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (data.skippable && skipSecs > 0) {
        countdownRef.current = setInterval(() => {
          setSkipCountdown(prev => {
            if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    }, () => {});
    return () => { unsub(); if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [dismissed]);

  const handleSkip = useCallback(() => {
    if (!broadcast) return;
    const broadcastKey = `${broadcast.adId || ''}_${broadcast.broadcastedAt || 0}`;
    setDismissed(broadcastKey);
    setVisible(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, [broadcast]);

  const handleCTA = useCallback(() => {
    if (!broadcast?.targetUrl) return;
    window.open(broadcast.targetUrl, '_blank', 'noopener,noreferrer');
    if (broadcast.adId) {
      updateDoc(doc(db, 'advertisements', broadcast.adId), { clicks: increment(1) }).catch(() => {});
    }
  }, [broadcast]);

  if (!visible || !broadcast) return null;

  const mode = broadcast.displayMode || 'popup';
  const isFullscreen = mode === 'fullscreen';
  const isOverlay = mode === 'overlay';
  const canSkip = broadcast.skippable && skipCountdown === 0;

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[9999] bg-black flex items-center justify-center'
    : isOverlay
    ? 'fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'
    : 'fixed bottom-6 right-6 z-[9999] max-w-sm w-full';

  return (
    <div className={containerClass}>
      <div
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full'}
        `}
        style={isFullscreen ? { maxWidth: '100vw' } : { maxWidth: isOverlay ? '600px' : '380px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wide">Ad</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{broadcast.title}</span>
            {broadcast.advertiser && <span className="text-[10px] text-gray-400 hidden sm:block">· {broadcast.advertiser}</span>}
          </div>
          <div className="flex items-center gap-1">
            {broadcast.mediaType === 'Video' && (
              <button onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
            {canSkip ? (
              <button onClick={handleSkip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-all">
                <X className="w-3 h-3" /> Skip
              </button>
            ) : broadcast.skippable ? (
              <span className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs font-semibold">
                Skip in {skipCountdown}s
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className={`${isFullscreen ? 'flex-1 flex items-center justify-center p-6' : ''}`}>
          {broadcast.mediaType === 'Image' && broadcast.imageUrl && (
            <div
              className={`overflow-hidden ${isFullscreen ? 'max-h-[60vh] w-full' : ''} cursor-pointer`}
              onClick={broadcast.targetUrl ? handleCTA : undefined}
            >
              <img
                src={broadcast.imageUrl}
                alt={broadcast.title}
                className={`w-full object-cover transition-transform hover:scale-105 ${isFullscreen ? 'max-h-[60vh] object-contain' : 'h-48'}`}
              />
            </div>
          )}

          {broadcast.mediaType === 'Video' && broadcast.videoUrl && (
            <div className={`${isFullscreen ? 'w-full max-h-[65vh]' : 'aspect-video'} bg-black`}>
              {broadcast.videoUrl.includes('youtube.com') || broadcast.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${broadcast.videoUrl.split('v=')[1]?.split('&')[0] || broadcast.videoUrl.split('youtu.be/')[1]?.split('?')[0] || ''}?autoplay=1&mute=${muted ? 1 : 0}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={broadcast.videoUrl}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}

          {broadcast.mediaType === 'Text' && broadcast.textContent && (
            <div className={`p-5 ${isFullscreen ? 'text-center max-w-2xl mx-auto' : ''}`}>
              <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${isFullscreen ? 'text-xl' : 'text-sm'}`}>
                {broadcast.textContent}
              </p>
            </div>
          )}
        </div>

        {/* Footer / CTA */}
        {(broadcast.ctaLabel || broadcast.targetUrl) && (
          <div className={`p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 ${isFullscreen ? 'justify-center' : ''}`}>
            <button
              onClick={handleCTA}
              disabled={!broadcast.targetUrl}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {broadcast.ctaLabel || 'Learn More'}
              {broadcast.targetUrl && <ExternalLink className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] text-gray-400">Sponsored</span>
          </div>
        )}
      </div>
    </div>
  );
};
