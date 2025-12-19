/**
 * Theme management utility for dark/light mode
 */

const THEME_KEY = 'app-theme';
const DARK_MODE_CLASS = 'dark-mode';

/**
 * Get current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Set theme and apply to DOM
 */
export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add(DARK_MODE_CLASS);
  } else {
    html.classList.remove(DARK_MODE_CLASS);
  }
  
  // Update CSS variables
  updateCSSVariables(theme);
}

/**
 * Toggle between light and dark mode
 */
export function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}

/**
 * Update CSS variables for theme
 */
function updateCSSVariables(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.style.setProperty('--app-bg', '#0f1419');
    root.style.setProperty('--card-bg', '#1a1a1b');
    root.style.setProperty('--card-border', '#343536');
    root.style.setProperty('--text-primary', '#d7dadc');
    root.style.setProperty('--text-secondary', '#818384');
    root.style.setProperty('--text-tertiary', '#575a5c');
    root.style.setProperty('--navbar-bg', '#030303');
    root.style.setProperty('--navbar-text', '#d7dadc');
    root.style.setProperty('--navbar-hover', '#272729');
  } else {
    root.style.setProperty('--app-bg', '#f6f7f8');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--card-border', '#edeff1');
    root.style.setProperty('--text-primary', '#1c1c1c');
    root.style.setProperty('--text-secondary', '#6a6d6f');
    root.style.setProperty('--text-tertiary', '#939699');
    root.style.setProperty('--navbar-bg', '#ffffff');
    root.style.setProperty('--navbar-text', '#1c1c1c');
    root.style.setProperty('--navbar-hover', '#f6f7f8');
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme() {
  const theme = getCurrentTheme();
  setTheme(theme);
}
