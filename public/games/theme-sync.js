(function () {
  const params = new URLSearchParams(window.location.search);
  const root = document.documentElement.style;
  const bg = params.get('bg');
  const surface = params.get('surface');
  const accent = params.get('accent');
  const accentHover = params.get('accentHover');
  const accentFg = params.get('accentFg');

  if (bg) root.setProperty('--bg', bg);
  if (surface) root.setProperty('--surface', surface);
  if (accent) root.setProperty('--accent', accent);
  if (accentHover) root.setProperty('--accent-hover', accentHover);
  if (accentFg) root.setProperty('--accent-fg', accentFg);

  window.__PUMPKIN_THEME__ = {
    bg: bg || '#060607',
    surface: surface || '#0c0c0f',
    accent: accent || '#f97316',
    accentHover: accentHover || '#fb923c',
    accentFg: accentFg || '#060607',
  };
})();
