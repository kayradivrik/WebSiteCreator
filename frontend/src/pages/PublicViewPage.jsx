import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, FileJson } from 'lucide-react';
import { Renderer } from '../components/Editor/Renderer';
import { apiUrl } from '../lib/api';
import { downloadCanvasHtml, downloadCanvasJson } from '../lib/exportStaticHtml';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export default function PublicViewPage() {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl(`/pages/${pageId}`))
      .then((r) => {
        if (!r.ok) throw new Error('notfound');
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.canvasState) throw new Error('invalid');
        setPage(data);
        document.title = data.name ? `${data.name} · Önizleme` : 'Önizleme';
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  useEffect(() => {
    return () => {
      document.title = 'WebBuilder';
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-black px-4 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">Bu sayfa bulunamadı veya kaldırılmış.</p>
        <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
          Panele dön
        </Link>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-sm text-gray-500">
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-4 py-2 text-xs text-gray-600 dark:text-gray-300">
        <span className="truncate font-medium text-gray-800 dark:text-gray-100">
          {page.name || 'Önizleme'}
        </span>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <ThemeToggle />
          <button
            type="button"
            onClick={() =>
              downloadCanvasHtml(page.canvasState, {
                title: page.name || 'sayfa',
                customCSS: page.settings?.customCSS,
                favicon: page.settings?.favicon,
              })
            }
            title="Tek HTML dosyası indir"
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Download className="w-3.5 h-3.5" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => downloadCanvasJson(page.canvasState, page.name || 'sayfa')}
            title="Sayfa verisi (JSON)"
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FileJson className="w-3.5 h-3.5" />
            JSON
          </button>
          <Link
            to={`/editor/${pageId}`}
            className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Düzenle
          </Link>
          <Link to="/" className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800">
            Pano
          </Link>
        </div>
      </div>
      <div className="p-6 md:p-10">
        <div className="max-w-5xl mx-auto bg-white min-h-[70vh] shadow-sm rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-950 dark:border-gray-800">
          <Renderer node={page.canvasState} mode="preview" />
        </div>
      </div>
    </div>
  );
}
