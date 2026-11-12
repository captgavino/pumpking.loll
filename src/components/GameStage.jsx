import { useEffect, useMemo, useRef, useState } from 'react';
import { EyeOff, Maximize2, Minimize2, RotateCcw, X } from 'lucide-react';

export default function GameStage({ game, theme, onEnableCloak, onClose }) {
  const stageRef = useRef(null);
  const iframeRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const themedIframeUrl = useMemo(() => {
    const sep = game.iframeUrl.includes('?') ? '&' : '?';
    const qs = new URLSearchParams({
      bg: theme.bgCanvas,
      surface: theme.bgSurface,
      accent: theme.accent,
      accentHover: theme.accentHover,
      accentFg: theme.accentFg,
    });
    return `${game.iframeUrl}${sep}${qs.toString()}`;
  }, [game.iframeUrl, theme]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await stageRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen restrictions
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${game.title} game player`}
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        ref={stageRef}
        className="w-full max-w-4xl rounded-2xl bg-[var(--bg-surface)] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-white/8 bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="font-display text-lg font-bold text-[#F4F4F6] truncate">
              {game.title}
            </h2>
            <span className="hidden sm:inline text-xs text-[#8E8E99]">
              · {game.category}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              aria-label="Reload game"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-xs font-medium text-[#F4F4F6] transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reload</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="p-2 rounded-lg bg-white/6 hover:bg-white/12 text-[#F4F4F6] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onEnableCloak}
              title="Switch to Study Notes view"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-xs font-medium text-[#F4F4F6] transition-colors whitespace-nowrap cursor-pointer"
            >
              <EyeOff className="w-3 h-3 text-[var(--accent)]" />
              <span className="hidden md:inline">Study Mode</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close game player"
              className="p-2 rounded-lg bg-white/6 hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] text-[#F4F4F6] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-canvas)] w-full aspect-[4/3] max-h-[75vh]">
          <iframe
            key={`${game.id}-${reloadKey}-${theme.id}`}
            ref={iframeRef}
            src={themedIframeUrl}
            title={game.title}
            onLoad={() => iframeRef.current?.focus()}
            className="w-full h-full border-0 block bg-[var(--bg-canvas)]"
            allow="fullscreen"
          />
        </div>

        <div className="px-5 py-3 border-t border-white/8 bg-[var(--bg-elevated)] flex items-center justify-between gap-4 text-xs text-[#8E8E99]">
          <span>
            Controls: <strong className="text-[#F4F4F6] font-medium">{game.controls}</strong>
          </span>
          <span className="hidden sm:inline text-[#72727D]">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
