import { useState } from 'react';
import { Gamepad2, Play, Star } from 'lucide-react';

export default function GameCard({ game, isFavorite, onPlay, onToggleFavorite }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex flex-col rounded-xl bg-[var(--bg-surface)] border border-white/7 overflow-hidden transition-colors duration-150 hover:border-[var(--accent)]/50">
      <button
        type="button"
        onClick={() => onPlay(game)}
        aria-label={`Play ${game.title}`}
        className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--bg-elevated)] block cursor-pointer text-left"
      >
        {!imgError ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-[var(--bg-elevated)] p-3">
            <Gamepad2 className="w-6 h-6 text-[var(--accent)]" />
            <span className="font-display text-xs font-semibold text-[#F4F4F6]">{game.title}</span>
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85"
        />
      </button>

      <div className="flex flex-col flex-1 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E99] truncate">
            <span className="text-[var(--accent)] font-medium">{game.category}</span>
            <span aria-hidden="true">·</span>
            <span>HTML5</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(game.id)}
            aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
            aria-pressed={isFavorite}
            className="p-1 -mr-1 rounded-md text-[#8E8E99] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
          >
            <Star
              className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}`}
            />
          </button>
        </div>

        <h3 className="mt-1 font-display text-base font-bold text-[#F4F4F6] tracking-tight truncate">
          {game.title}
        </h3>

        <p className="mt-1 text-xs text-[#8E8E99] leading-relaxed line-clamp-2 flex-1">
          {game.description}
        </p>

        <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#72727D] truncate">{game.controls.split('·')[0].trim()}</span>
          <button
            type="button"
            onClick={() => onPlay(game)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            Play
          </button>
        </div>
      </div>
    </article>
  );
}
