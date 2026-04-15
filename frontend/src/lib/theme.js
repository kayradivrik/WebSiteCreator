export function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function initThemeFromStorage() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
      return;
    }
  } catch {
    /* ignore */
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) applyTheme('dark');
  else applyTheme('light');
}
