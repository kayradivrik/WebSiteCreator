import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Copy,
  Search,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-200/80 dark:bg-gray-800/80" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteErr, setDeleteErr] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [dupErr, setDupErr] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/pages')
      .then(async (r) => {
        if (!r.ok) {
          const hint = await r.text().catch(() => '');
          const short = hint.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
          throw new Error(
            `Sunucu yanıt vermedi (HTTP ${r.status}). ${short ? short : r.url}`.trim()
          );
        }
        return r.json().catch(() => []);
      })
      .then((data) => {
        if (!cancelled) setPages(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu sayfa kalıcı olarak silinsin mi?')) return;
    setDeleteErr(null);
    setDeletingId(id);
    try {
      const r = await apiFetch(`/pages/${id}`, { method: 'DELETE' });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setDeleteErr(d.error || d.message || `Silinemedi (HTTP ${r.status})`);
        return;
      }
      setPages((prev) => prev.filter((p) => String(p._id) !== id));
    } catch {
      setDeleteErr('Sunucuya bağlanılamadı');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id) => {
    setDupErr(null);
    setDuplicatingId(id);
    try {
      const r = await apiFetch(`/pages/${id}/duplicate`, { method: 'POST' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setDupErr(data.error || data.message || `Kopyalanamadı (HTTP ${r.status})`);
        return;
      }
      const newId = data._id != null ? String(data._id) : null;
      if (newId) {
        setPages((prev) => {
          const row = {
            _id: newId,
            name: data.name,
            slug: data.slug,
            updatedAt: data.updatedAt,
          };
          return [row, ...prev.filter((p) => String(p._id) !== newId)];
        });
        navigate(`/editor/${newId}`);
      }
    } catch {
      setDupErr('Sunucuya bağlanılamadı');
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => {
      const id = String(p._id).toLowerCase();
      const name = (p.name || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      return id.includes(q) || name.includes(q) || slug.includes(q);
    });
  }, [pages, query]);

  const formatUpdated = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return '—';
    }
  };

  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-foreground dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img
              src="/logo-mark.svg"
              alt="WebBuilder logo"
              className="h-9 w-9 rounded-lg shadow-md shadow-blue-600/20"
            />
            <span className="text-gray-900 dark:text-white">
              WebBuilder<span className="font-semibold text-blue-600">.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Yeni sayfa
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 pb-16">
        <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-900/20 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="relative max-w-xl">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Görsel düzenleyici · Tailwind · Dışa aktarma
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Projeleriniz tek yerde</h1>
            <p className="mt-2 text-sm leading-relaxed text-blue-100 md:text-base">
              Sayfalarınızı oluşturun, kaydedin, önizleyin; HTML, zip veya Netlify / Vercel ile yayınlayın.
            </p>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <LayoutTemplate className="h-5 w-5 text-blue-600" aria-hidden />
              Sayfalarım
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Düzenlemek veya canlı önizleme için bir sayfa seçin.
            </p>
          </div>
        </div>

        {deleteErr && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {deleteErr}
          </div>
        )}
        {dupErr && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            {dupErr}
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <div className="relative mb-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, slug veya ID ile ara…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-blue-500/0 transition focus:ring-4 focus:ring-blue-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}

        {loading && <DashboardSkeleton />}

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">{error}</p>
            <p className="mt-2 text-xs leading-relaxed opacity-90">
              Geliştirmede liste doğrudan{' '}
              <code className="rounded bg-amber-100/80 px-1 font-mono dark:bg-amber-900/40">
                http://127.0.0.1:5000/api/pages
              </code>{' '}
              adresinden istenir. Backend veya Mongo kapalıysa veri gelmez. Proje kökünde{' '}
              <code className="rounded bg-amber-100/80 px-1 font-mono dark:bg-amber-900/40">npm run dev</code> ile API
              ve arayüzü birlikte başlatın. <code className="font-mono">.env</code> içinde{' '}
              <code className="font-mono">VITE_API_BASE_URL</code> satırında <strong>=</strong> kullanmayı unutmayın
              (ör. <code className="font-mono">VITE_API_BASE_URL=http://...</code>).
            </p>
          </div>
        )}

        {!loading && !error && pages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-8 py-14 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Henüz kayıtlı sayfa yok</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              İlk projenizi oluşturmak için yeni sayfa ile başlayın.
            </p>
            <Link
              to="/editor"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Yeni sayfa
            </Link>
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filteredPages.map((p) => {
              const id = String(p._id);
              return (
                <li
                  key={id}
                  className="group flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{p.name || 'Adsız sayfa'}</p>
                    <p className="mt-1 truncate font-mono text-[11px] text-gray-400">{id}</p>
                    {p.slug ? (
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-500">/{p.slug}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-gray-400">Güncellendi: {formatUpdated(p.updatedAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleDuplicate(id)}
                      disabled={duplicatingId === id}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      title="Kopyasını oluştur"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={`${window.location.origin}/view/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      title="Yeni sekmede aç"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Link
                      to={`/editor/${id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 sm:flex-none"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(id)}
                      disabled={deletingId === id}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                      title="Sayfayı sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && pages.length > 0 && filteredPages.length === 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Aramanızla eşleşen sayfa yok.</p>
        )}
      </main>

      <footer className="border-t border-gray-200/80 bg-white/80 py-4 text-center text-xs text-gray-500 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-500">
        WebBuilder
        {appVersion ? (
          <>
            {' '}
            · sürüm <span className="font-mono text-gray-600 dark:text-gray-400">{appVersion}</span>
          </>
        ) : null}
      </footer>
    </div>
  );
}
