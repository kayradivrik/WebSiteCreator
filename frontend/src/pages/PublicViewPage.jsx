import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, FileJson, FolderArchive } from 'lucide-react';
import { Renderer } from '../components/Editor/Renderer';
import { apiFetch } from '../lib/api';
import { downloadCanvasHtml, downloadCanvasJson } from '../lib/exportStaticHtml';
import { downloadSiteZip } from '../lib/exportSiteZip.js';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { normalizePageSettings, themeToCssVarsStyle } from '../lib/pageSettingsDefaults.js';
import { useGoogleFont } from '../hooks/useGoogleFont.js';

export default function PublicViewPage() {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [zipMsg, setZipMsg] = useState(null);

  const settings = normalizePageSettings(page?.settings);
  useGoogleFont(settings.googleFont);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/pages/${pageId}`)
      .then((r) => {
        if (!r.ok) throw new Error('notfound');
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.canvasState) throw new Error('invalid');
        setPage(data);
        const s = normalizePageSettings(data.settings);
        const tab = (s.metaTitle || '').trim() || data.name || 'Sayfa';
        document.title = `${tab} · Önizleme`;
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-black">
        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300 dark:bg-gray-800" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Önizleme yükleniyor…</p>
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
                ...settings,
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
            onClick={async () => {
              setZipMsg(null);
              try {
                await downloadSiteZip(page.canvasState, {
                  title: page.name || 'sayfa',
                  ...settings,
                });
                setZipMsg('Zip indirildi');
                window.setTimeout(() => setZipMsg(null), 2000);
              } catch (e) {
                setZipMsg(e?.message || 'Zip hatası');
              }
            }}
            title="Statik site zip"
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            Zip
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
      {zipMsg && (
        <div className="bg-amber-50 px-4 py-1 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {zipMsg}
        </div>
      )}
      <div className="p-6 md:p-10">
        <div
          className="wb-theme-root max-w-5xl mx-auto bg-white min-h-[70vh] shadow-sm rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-950 dark:border-gray-800"
          style={themeToCssVarsStyle(settings.theme)}
        >
          <Renderer node={page.canvasState} mode="preview" />
        </div>
      </div>
    </div>
  );
}
