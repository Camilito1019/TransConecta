import { writable, get } from 'svelte/store';

const STORAGE_KEY = 'tc_theme';

function safeGetStoredTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'dark' || raw === 'light' ? raw : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export const theme = writable('light');

export function initTheme() {
  if (typeof window === 'undefined') return get(theme);

  const stored = safeGetStoredTheme();
  const currentAttr = document.documentElement?.dataset?.theme;
  const initial = stored || (currentAttr === 'dark' || currentAttr === 'light' ? currentAttr : 'light');

  theme.set(initial);
  applyTheme(initial);
  return initial;
}

export function setTheme(next) {
  const t = next === 'dark' ? 'dark' : 'light';
  theme.set(t);
  applyTheme(t);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // ignore
  }
  return t;
}

export function toggleTheme() {
  const current = get(theme);
  return setTheme(current === 'dark' ? 'light' : 'dark');
}
