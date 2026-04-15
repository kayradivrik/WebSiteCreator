/** SaaS: tehlikeli href şemalarını engelle */
export function sanitizeHref(raw) {
  const u = String(raw ?? '').trim();
  if (!u) return '';
  const lower = u.replace(/^\s+/, '').toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }
  return u;
}
