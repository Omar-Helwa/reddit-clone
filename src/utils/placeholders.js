export function makeCircleIcon({ text, bg, fg } = {}) {
  const label = (text || '').toString().slice(0, 2) || '?';
  const background = bg || '#ff4500';
  const foreground = fg || '#ffffff';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="${background}"/>
      <text x="32" y="40" text-anchor="middle" font-family="Inter, Segoe UI, Arial" font-size="28" font-weight="800" fill="${foreground}">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_COMMUNITY_ICON = makeCircleIcon({ text: 'R', bg: '#ff4500', fg: '#ffffff' });
export const DEFAULT_USER_ICON = makeCircleIcon({ text: 'U', bg: '#6a6d6f', fg: '#ffffff' });
