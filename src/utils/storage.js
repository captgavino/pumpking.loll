const SCORES_KEY = 'ember_arcade_high_scores_v1';
const FAVORITES_KEY = 'ember_arcade_favorites_v1';
const SOUND_KEY = 'ember_arcade_sound_v1';
const RECENT_KEY = 'ember_arcade_recent_v1';
const THEME_KEY = 'pumpkin_theme_v1';
const BG_EFFECTS_KEY = 'pumpkin_bg_effects_v1';

const DEFAULT_EFFECTS = {
  rain: true,
  lightning: true,
  fireworks: true,
};

export function loadHighScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveHighScore(gameId, score, lowerIsBetter = false) {
  const current = loadHighScores();
  const prev = current[gameId];
  const shouldUpdate =
    prev === undefined ||
    (lowerIsBetter ? score > 0 && score < prev : score > prev);

  if (shouldUpdate) {
    const updated = { ...current, [gameId]: score };
    try {
      localStorage.setItem(SCORES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota issues
    }
    return updated;
  }
  return current;
}

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(gameId) {
  const current = loadFavorites();
  const updated = current.includes(gameId)
    ? current.filter((id) => id !== gameId)
    : [...current, gameId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota issues
  }
  return updated;
}

export function loadSoundEnabled() {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function saveSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Ignore
  }
}

export function loadRecentGames() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentGame(gameId) {
  const current = loadRecentGames().filter((id) => id !== gameId);
  const updated = [gameId, ...current].slice(0, 6);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function loadThemeId() {
  try {
    return localStorage.getItem(THEME_KEY) || 'pumpkin';
  } catch {
    return 'pumpkin';
  }
}

export function saveThemeId(themeId) {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch {
    // Ignore
  }
}

export function loadBgEffects() {
  try {
    const raw = localStorage.getItem(BG_EFFECTS_KEY);
    if (!raw) return DEFAULT_EFFECTS;
    const parsed = JSON.parse(raw);
    return {
      rain: parsed.rain ?? true,
      lightning: parsed.lightning ?? true,
      fireworks: parsed.fireworks ?? true,
    };
  } catch {
    return DEFAULT_EFFECTS;
  }
}

export function saveBgEffects(effects) {
  try {
    localStorage.setItem(BG_EFFECTS_KEY, JSON.stringify(effects));
  } catch {
    // Ignore
  }
}
