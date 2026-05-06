import React, { useEffect, useState, useRef, useCallback } from 'react';
import { db } from '../../services/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { X, ExternalLink, Volume2, VolumeX, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MAX_AD_DURATION = 30; // Hard cap — no ad runs more than 30 seconds

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
  duration?: number;
  broadcastedAt?: number;
}

function useImageNaturalSize(src?: string) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!src) { setSize(null); return; }
    const img = new Image();
    img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setSize(null);
    img.src = src;
  }, [src]);
  return size;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const GlobalAdsPlayer: React.FC = () => {
  const { profile } = useAuth();
  const [broadcast, setBroadcast] = useState<BroadcastAd | null>(null);
  const [visible, setVisible] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [entering, setEntering] = useState(false);
  const skipRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const imageSize = useImageNaturalSize(
    broadcast?.mediaType === 'Image' ? broadcast.imageUrl : undefined
  );

  const clearTimers = () => {
    if (skipRef.current) clearInterval(skipRef.current);
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const dismiss = useCallback((key: string) => {
    setDismissed(key);
    setVisible(false);
    clearTimers();
  }, []);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'active_broadcast');
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) { setBroadcast(null); setVisible(false); clearTimers(); return; }
      const data = snap.data() as BroadcastAd;
      if (!data.active) { setBroadcast(null); setVisible(false); clearTimers(); return; }

      const broadcastKey = `${data.adId || ''}_${data.broadcastedAt || 0}`;
      if (dismissed === broadcastKey) return;

      // Cap duration to MAX_AD_DURATION
      const rawDuration = typeof data.duration === 'number' ? data.duration : MAX_AD_DURATION;
      const safeDuration = Math.min(rawDuration, MAX_AD_DURATION);
      const safeSkipAfter = Math.min(data.skipAfter ?? 5, safeDuration);

      const patched: BroadcastAd = { ...data, duration: safeDuration, skipAfter: safeSkipAfter };
      setBroadcast(patched);
      setEntering(true);
      setVisible(true);
      setTimeLeft(safeDuration);
      setSkipCountdown(data.skippable ? safeSkipAfter : 0);

      clearTimers();

      // Skip countdown
      if (data.skippable && safeSkipAfter > 0) {
        skipRef.current = setInterval(() => {
          setSkipCountdown(prev => {
            if (prev <= 1) { clearInterval(skipRef.current!); return 0; }
            return prev - 1;
          });
        }, 1000);
      }

      // Auto-dismiss after duration (hard max 30s)
      autoRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(autoRef.current!);
            dismiss(broadcastKey);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => setEntering(false), 50);
    }, () => {});

    return () => { unsub(); clearTimers(); };
  }, [dismissed, dismiss]);

  const handleSkip = useCallback(() => {
    if (!broadcast) return;
    const key = `${broadcast.adId || ''}_${broadcast.broadcastedAt || 0}`;
    dismiss(key);
  }, [broadcast, dismiss]);

  const handleCTA = useCallback(() => {
    if (!broadcast?.targetUrl) return;
    window.open(broadcast.targetUrl, '_blank', 'noopener,noreferrer');
    if (broadcast.adId) {
      updateDoc(doc(db, 'advertisements', broadcast.adId), { clicks: increment(1) }).catch(() => {});
    }
  }, [broadcast]);

  // STUDENT-ONLY — never show to admin, staff, company/provider
  const role = profile?.role;
  if (role && role !== 'student') return null;
  if (!visible || !broadcast) return null;

  const mode = broadcast.displayMode || 'popup';
  const isFullscreen = mode === 'fullscreen';
  const isOverlay = mode === 'overlay';
  const canSkip = broadcast.skippable && skipCountdown === 0;
  const safeDuration = broadcast.duration ?? MAX_AD_DURATION;
  const progress = safeDuration > 0 ? ((safeDuration - timeLeft) / safeDuration) * 100 : 100;

  // Smart image sizing — detect if image is small/portrait/landscape
  const isSmallImage = imageSize && imageSize.w < 600 && imageSize.h < 400;
  const isPortrait = imageSize && imageSize.h > imageSize.w;

  const ytId = broadcast.mediaType === 'Video' && broadcast.videoUrl
    ? getYouTubeId(broadcast.videoUrl)
    : null;

  // Outer wrapper
  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-0'
    : isOverlay
    ? 'fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4'
    : 'fixed bottom-4 right-4 z-[9999] flex items-end justify-end pointer-events-none';

  // Inner card sizing
  const cardMaxW = isFullscreen
    ? 'w-full h-full max-w-none rounded-none'
    : isOverlay
    ? 'w-full max-w-lg rounded-2xl'
    : 'w-80 rounded-2xl pointer-events-auto';

  const animClass = entering
    ? 'opacity-0 scale-95 translate-y-2'
    : 'opacity-100 scale-100 translate-y-0';

  return (
    <div className={wrapperClass}>
      <div
        className={`
          bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700
          overflow-hidden relative flex flex-col
          transition-all duration-300 ease-out
          ${cardMaxW} ${isFullscreen ? '' : animClass}
          ${isFullscreen ? 'h-full' : ''}
        `}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-10">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex-shrink-0 ${isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider flex-shrink-0">Ad</span>
            {broadcast.title && (
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{broadcast.title}</span>
            )}
            {broadcast.advertiser && (
              <span className="text-[10px] text-gray-400 hidden sm:block flex-shrink-0">· {broadcast.advertiser}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Time remaining */}
            <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              {timeLeft}s
            </span>

            {broadcast.mediaType === 'Video' && (
              <button
                onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {canSkip ? (
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold hover:opacity-80 transition-all"
              >
                <X className="w-3 h-3" /> Skip
              </button>
            ) : broadcast.skippable ? (
              <span className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px] font-semibold">
                Skip {skipCountdown}s
              </span>
            ) : (
              <span className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 text-[11px]">
                {timeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className={`flex-1 flex flex-col ${isFullscreen ? 'items-center justify-center pt-14 pb-4' : ''}`}>

          {/* IMAGE */}
          {broadcast.mediaType === 'Image' && broadcast.imageUrl && (
            <div
              className={`
                overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer
                ${isFullscreen ? 'w-full flex-1 max-h-[75vh]' : isOverlay ? 'max-h-[50vh]' : 'max-h-56'}
              `}
              onClick={broadcast.targetUrl ? handleCTA : undefined}
            >
              <img
                src={broadcast.imageUrl}
                alt={broadcast.title || 'Advertisement'}
                className={`
                  transition-transform hover:scale-[1.02] duration-300
                  ${isSmallImage
                    ? 'max-w-full max-h-full object-contain'
                    : isPortrait
                    ? 'h-full max-h-full w-auto object-contain'
                    : 'w-full object-contain'
                  }
                  ${isFullscreen ? 'max-h-[70vh] max-w-[90vw]' : ''}
                `}
                style={isSmallImage && imageSize ? { maxWidth: imageSize.w, maxHeight: imageSize.h } : undefined}
              />
            </div>
          )}

          {/* VIDEO */}
          {broadcast.mediaType === 'Video' && broadcast.videoUrl && (
            <div className={`bg-black flex items-center justify-center overflow-hidden ${isFullscreen ? 'w-full flex-1 max-h-[75vh]' : 'aspect-video'}`}>
              {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
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

          {/* TEXT */}
          {broadcast.mediaType === 'Text' && broadcast.textContent && (
            <div className={`flex items-center justify-center flex-1 p-6 ${isFullscreen ? 'text-center' : ''}`}>
              <div className="max-w-xl">
                <p className={`text-gray-700 dark:text-gray-300 leading-relaxed font-medium ${isFullscreen ? 'text-2xl' : isOverlay ? 'text-base' : 'text-sm'}`}>
                  {broadcast.textContent}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Footer */}
        {(broadcast.ctaLabel || broadcast.targetUrl) && (
          <div className={`px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 flex-shrink-0 ${isFullscreen ? 'flex justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCTA}
                disabled={!broadcast.targetUrl}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 shadow-lg active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                {broadcast.ctaLabel || 'Learn More'}
                {broadcast.targetUrl && <ExternalLink className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] text-gray-400">Sponsored</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
