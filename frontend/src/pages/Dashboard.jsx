import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MonitorPlay, Plus, ExternalLink, Pencil, Trash2, Copy, Search } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

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
    fetch(apiUrl('/pages'))
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
      const r = await fetch(apiUrl(`/pages/${id}`), { method: 'DELETE' });
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
      const r = await fetch(apiUrl(`/pages/${id}/duplicate`), { method: 'POST' });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-foreground">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <MonitorPlay className="w-5 h-5 text-blue-600" />
            WebBuilder<span className="text-blue-500">.ai</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni sayfa
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Sayfalarım</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Kayıtlı projeleriniz. Düzenlemek veya yayın önizlemesi için seçin.
        </p>

        {deleteErr && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-2 text-sm text-red-800 dark:text-red-200">
            {deleteErr}
          </div>
        )}
        {dupErr && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
            {dupErr}
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, slug veya ID ile ara…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        )}

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Yükleniyor…</p>
        )}
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-900 dark:text-amber-100 space-y-2">
            <p>{error}</p>
            <p className="text-xs opacity-90 leading-relaxed">
              Geliştirmede liste doğrudan <code className="font-mono">http://127.0.0.1:5000/api/pages</code> adresinden istenir (Vite proxy gerekmez).
              Backend çalışmıyorsa veya Mongo kapalıysa liste gelmez. Proje kökünde{' '}
              <code className="font-mono bg-amber-100/80 dark:bg-amber-900/40 px-1 rounded">npm run dev</code> ile API + arayüzü birlikte başlatın.
              <code className="font-mono">.env</code> içinde <code className="font-mono">VITE_API_BASE_URLhttp://...</code> gibi <strong>= olmadan</strong> satır yazmayın.
            </p>
          </div>
        )}
        {!loading && !error && pages.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-500 dark:text-gray-400 text-sm">
            Henüz kayıtlı sayfa yok. Yeni sayfa ile başlayın.
          </div>
        )}
        {!loading && !error && pages.length > 0 && (
          <ul className="space-y-2">
            {filteredPages.map((p) => {
              const id = String(p._id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {p.name || 'Adsız sayfa'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">{id}</p>
                    {p.slug && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate">/{p.slug}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleDuplicate(id)}
                      disabled={duplicatingId === id}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                      title="Kopyasını oluştur"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`${window.location.origin}/view/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Yeni sekmede aç"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link
                      to={`/editor/${id}`}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Düzenle"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(id)}
                      disabled={deletingId === id}
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
                      title="Sayfayı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!loading && !error && pages.length > 0 && filteredPages.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aramanızla eşleşen sayfa yok.</p>
        )}
      </main>
    </div>
  );
}
