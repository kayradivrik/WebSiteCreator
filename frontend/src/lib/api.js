// Üretim: VITE_API_BASE_URL=https://api.siteniz.com (sadece köken; sonuna /api yazmayın)
// Geliştirme: Varsayılan doğrudan http://127.0.0.1:PORT — Vite proxy’ye ihtiyaç yok (CORS backend’de açık).
// İsterseniz: VITE_DEV_API_PORT=5001  |  Özel taban: VITE_API_BASE_URL=http://127.0.0.1:5000

const stripTrailingSlashes = (s) => String(s).replace(/\/+$/, '');

function devDirectOrigin() {
  const p = Number(import.meta.env.VITE_DEV_API_PORT || import.meta.env.VITE_API_PROXY_PORT || 5000);
  return `http://127.0.0.1:${Number.isFinite(p) && p > 0 ? p : 5000}`;
}

/** API kökeni (path yok); istek yolu her zaman /api/... */
function normalizeApiOrigin() {
  let raw = import.meta.env.VITE_API_BASE_URL?.trim().replace(/^\uFEFF/, '') ?? '';

  // Geliştirme + taban belirtilmemiş → doğrudan Node API (proxy/5176 sorunlarından bağımsız)
  if (import.meta.env.DEV && !raw) {
    return devDirectOrigin();
  }

  if (!raw) {
    return 'http://127.0.0.1:5000';
  }

  let toParse = raw;
  if (!/^https?:\/\//i.test(toParse) && /^[\w.-]+(:\d+)?(\/|$)/i.test(toParse)) {
    toParse = `http://${toParse}`;
  }

  try {
    if (/^https?:\/\//i.test(toParse)) {
      const u = new URL(toParse);
      let path = u.pathname || '';
      path = path.replace(/\/+$/, '');
      if (path === '') {
        return `${u.protocol}//${u.host}`;
      }
      if (path === '/api' || path.startsWith('/api/')) {
        return `${u.protocol}//${u.host}`;
      }
      return stripTrailingSlashes(`${u.protocol}//${u.host}${path}`);
    }
  } catch {
    /* göreceli veya bozuk URL */
  }

  let o = stripTrailingSlashes(raw);
  while (/\/api$/i.test(o)) {
    o = stripTrailingSlashes(o.replace(/\/api$/i, ''));
  }
  return o;
}

/** @deprecated */
export const API_BASE = normalizeApiOrigin();

/**
 * Tam mutlak URL (örn. http://127.0.0.1:5000/api/pages).
 * Geliştirmede göreli /api kullanılmaz — tarayıcı her zaman doğrudan backend’e gider.
 */
export function apiUrl(path) {
  let p = path == null ? '/pages' : String(path).trim();
  if (p === '' || p === '/' || p === '/api' || p === '/api/') {
    p = '/pages';
  }
  if (!p.startsWith('/')) {
    p = `/${p}`;
  }
  if (p.startsWith('/api')) {
    p = p.slice(4);
    if (!p.startsWith('/')) p = `/${p}`;
    if (p === '/' || p === '') p = '/pages';
  }
  const full = `/api${p}`;
  const base = stripTrailingSlashes(normalizeApiOrigin());
  return `${base}${full}`;
}
