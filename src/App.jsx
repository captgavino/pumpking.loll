import { useEffect, useMemo, useRef, useState } from 'react';
import { CloudRain, EyeOff, Palette, Search, Shuffle, Sparkles, Zap } from 'lucide-react';
import AtmosphericBackground from './components/AtmosphericBackground.jsx';
import GameCard from './components/GameCard.jsx';
import GameStage from './components/GameStage.jsx';
import StudyCloak from './components/StudyCloak.jsx';
import {
  loadBgEffects,
  loadFavorites,
  loadThemeId,
  saveBgEffects,
  saveThemeId,
  toggleFavorite,
} from './utils/storage.js';
import { applyThemeToDocument, getThemeById, THEMES } from './utils/themes.js';

const NAV_TABS = [
  { label: 'All Games', value: 'All' },
  { label: 'Arcade', value: 'Arcade' },
  { label: 'Puzzle', value: 'Puzzle' },
  { label: 'Reaction', value: 'Reaction' },
  { label: 'Favorites', value: 'Favorites' },
];

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState(null);
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [themeId, setThemeId] = useState(() => loadThemeId());
  const [bgEffects, setBgEffects] = useState(() => loadBgEffects());
  const [studyCloak, setStudyCloak] = useState(false);

  const searchInputRef = useRef(null);
  const catalogRef = useRef(null);

  const activeTheme = useMemo(() => getThemeById(themeId), [themeId]);

  useEffect(() => {
    applyThemeToDocument(activeTheme);
    saveThemeId(activeTheme.id);
  }, [activeTheme]);

  useEffect(() => {
    saveBgEffects(bgEffects);
  }, [bgEffects]);

  const toggleEffect = (key) => {
    setBgEffects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/games.json')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load games catalog.');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setGames(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load games.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = studyCloak
      ? 'Algebra II Notes — Study Portal'
      : 'Pumpkin.lol — Unblocked Games';
  }, [studyCloak]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (activeGame || studyCloak) return;
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGame, studyCloak]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return games.filter((g) => {
      if (activeFilter === 'Favorites' && !favorites.includes(g.id)) {
        return false;
      }
      if (
        activeFilter !== 'All' &&
        activeFilter !== 'Favorites' &&
        g.category !== activeFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, favorites, games, searchQuery]);

  const handleLaunchGame = (game) => {
    setActiveGame(game);
  };

  const handleRandomGame = () => {
    if (games.length === 0) return;
    const pool = activeGame
      ? games.filter((g) => g.id !== activeGame.id)
      : games;
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? games[0];
    handleLaunchGame(pick);
  };

  const handleToggleFavorite = (gameId) => {
    setFavorites(toggleFavorite(gameId));
  };

  const handleNavClick = (val) => {
    setActiveFilter(val);
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (studyCloak) {
    return <StudyCloak onExit={() => setStudyCloak(false)} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[#F4F4F6]">
      <AtmosphericBackground accentColor={activeTheme.accent} effects={bgEffects} />

      <header className="sticky top-0 z-30 border-b border-white/7 bg-[var(--bg-canvas)]/82 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-extrabold tracking-tight text-[#F4F4F6] hover:text-[var(--accent)] transition-colors whitespace-nowrap shrink-0"
          >
            Pumpkin.lol
          </a>

          <nav aria-label="Game categories" className="hidden md:flex items-center gap-7">
            {NAV_TABS.map((tab) => {
              const isActive = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleNavClick(tab.value)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[var(--accent)]'
                      : 'text-[#8E8E99] hover:text-[#F4F4F6]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[21px] h-0.5 bg-[var(--accent)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleRandomGame}
            disabled={games.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Shuffle className="w-3 h-3" />
            Random Game
          </button>
        </div>
      </header>

      <main id="top" className="relative z-10 flex-1">
        <section
          ref={catalogRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 scroll-mt-20"
        >
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-white/7">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-white/7 w-fit">
              {NAV_TABS.map((tab) => {
                const active = activeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveFilter(tab.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold'
                        : 'text-[#8E8E99] hover:text-[#F4F4F6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div
                role="group"
                aria-label="Select background effects"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-white/8"
              >
                <button
                  type="button"
                  onClick={() => toggleEffect('rain')}
                  aria-pressed={bgEffects.rain}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    bgEffects.rain
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold'
                      : 'text-[#8E8E99] hover:text-[#F4F4F6]'
                  }`}
                >
                  <CloudRain className="w-3 h-3" />
                  Rain
                </button>
                <button
                  type="button"
                  onClick={() => toggleEffect('lightning')}
                  aria-pressed={bgEffects.lightning}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    bgEffects.lightning
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold'
                      : 'text-[#8E8E99] hover:text-[#F4F4F6]'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Lightning
                </button>
                <button
                  type="button"
                  onClick={() => toggleEffect('fireworks')}
                  aria-pressed={bgEffects.fireworks}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    bgEffects.fireworks
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold'
                      : 'text-[#8E8E99] hover:text-[#F4F4F6]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Fireworks
                </button>
              </div>

              <div
                role="group"
                aria-label="Choose color theme"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-white/8"
              >
                <Palette className="w-3 h-3 text-[var(--accent)] shrink-0" />
                <span className="text-xs text-[#8E8E99] whitespace-nowrap shrink-0">
                  {activeTheme.name}
                </span>
                <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
                  {THEMES.map((t) => {
                    const selected = t.id === activeTheme.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        title={`${t.name} theme`}
                        aria-label={`${t.name} theme`}
                        aria-pressed={selected}
                        style={{ backgroundColor: t.accent }}
                        className={`w-4 h-4 rounded-sm transition-transform cursor-pointer shrink-0 ${
                          selected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-surface)] scale-110'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#8E8E99] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games... (/)"
                  aria-label="Search games"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-white/8 text-xs text-[#F4F4F6] placeholder:text-[#72727D] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setStudyCloak(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-white/8 hover:border-[var(--accent)]/50 text-xs font-medium text-[#F4F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <EyeOff className="w-3 h-3 text-[var(--accent)]" />
                Study Mode
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="h-56 rounded-xl bg-[var(--bg-surface)] border border-white/7 animate-pulse"
                />
              ))}
            </div>
          ) : loadError ? (
            <div className="mt-10 p-8 rounded-xl bg-[var(--bg-surface)] border border-white/8 text-center">
              <p className="text-sm text-[#F4F4F6] font-medium">{loadError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="mt-10 p-10 rounded-xl bg-[var(--bg-surface)] border border-white/7 text-center">
              <p className="font-display text-lg font-bold text-[#F4F4F6]">
                No matching games found
              </p>
              <p className="mt-1 text-sm text-[#8E8E99]">
                {activeFilter === 'Favorites'
                  ? 'Star any game card to pin it to your favorites list.'
                  : 'Try clearing your search or switching category filters.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('All');
                  setSearchQuery('');
                }}
                className="mt-5 px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold cursor-pointer"
              >
                Show All Games
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  onPlay={handleLaunchGame}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/7 bg-[var(--bg-canvas)]/82 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#72727D]">
          <span>Pumpkin.lol · Self-contained HTML, CSS, and JavaScript browser games</span>
          <span>Catalog loaded from games.json</span>
        </div>
      </footer>

      {activeGame && (
        <GameStage
          game={activeGame}
          theme={activeTheme}
          onEnableCloak={() => {
            setActiveGame(null);
            setStudyCloak(true);
          }}
          onClose={() => setActiveGame(null)}
        />
      )}
    </div>
  );
}
