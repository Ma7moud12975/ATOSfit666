export const DEFAULT_THEME = 'dark';

export function getSavedTheme() {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  if (document.body) {
    document.body.classList.toggle('dark', nextTheme === 'dark');
  }
  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem('theme', nextTheme);
  } catch {}
  window.dispatchEvent(new CustomEvent('atos-theme-change', { detail: nextTheme }));
  return nextTheme;
}
