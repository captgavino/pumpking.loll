export const THEMES = [
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    bgCanvas: '#060607',
    bgSurface: '#0C0C0F',
    bgElevated: '#131318',
    accent: '#F97316',
    accentHover: '#FB923C',
    accentFg: '#060607',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    bgCanvas: '#070506',
    bgSurface: '#0E0A0C',
    bgElevated: '#171114',
    accent: '#F43F5E',
    accentHover: '#FB7185',
    accentFg: '#070506',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    bgCanvas: '#050807',
    bgSurface: '#0A0F0D',
    bgElevated: '#111915',
    accent: '#10B981',
    accentHover: '#34D399',
    accentFg: '#050807',
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    bgCanvas: '#05070B',
    bgSurface: '#0A0E16',
    bgElevated: '#111724',
    accent: '#60A5FA',
    accentHover: '#93C5FD',
    accentFg: '#05070B',
  },
  {
    id: 'amber',
    name: 'Amber',
    bgCanvas: '#070605',
    bgSurface: '#0E0C0A',
    bgElevated: '#171410',
    accent: '#F59E0B',
    accentHover: '#FBBF24',
    accentFg: '#070605',
  },
];

export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyThemeToDocument(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.style.setProperty('--bg-canvas', theme.bgCanvas);
  root.style.setProperty('--bg-surface', theme.bgSurface);
  root.style.setProperty('--bg-elevated', theme.bgElevated);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-hover', theme.accentHover);
  root.style.setProperty('--accent-fg', theme.accentFg);
}
