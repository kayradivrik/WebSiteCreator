import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { useEditorStore } from '../store/useEditorStore';
import { apiFetch } from '../lib/api';

function EditorLoadSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <div className="h-14 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-4">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex flex-1 gap-0">
        <div className="hidden w-56 shrink-0 border-r border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 md:block">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md space-y-3 text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-blue-200 dark:bg-blue-900/50" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Sayfa yükleniyor</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sunucudan içerik alınıyor…</p>
            <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const loadPage = useEditorStore((s) => s.loadPage);
  const resetEditor = useEditorStore((s) => s.resetEditor);

  const [status, setStatus] = useState(() => {
    if (!pageId) return 'ready';
    if (pageId && useEditorStore.getState().currentPageId === pageId) return 'ready';
    return 'loading';
  });

  const handleSaved = useCallback(
    (savedId) => {
      if (!pageId) {
        window.setTimeout(() => {
          navigate(`/editor/${savedId}`, { replace: true });
        }, 0);
      }
    },
    [pageId, navigate]
  );

  useEffect(() => {
    if (!pageId) {
      resetEditor();
      return;
    }
    if (useEditorStore.getState().currentPageId === pageId) {
      return;
    }
    let cancelled = false;
    apiFetch(`/pages/${pageId}`)
      .then((r) => {
        if (!r.ok) throw new Error('notfound');
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.canvasState) throw new Error('invalid');
        loadPage(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, loadPage, resetEditor]);

  if (status === 'loading') {
    return <EditorLoadSkeleton />;
  }

  if (status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Sayfa bulunamadı veya sunucu hatası.</p>
        <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
          Panele dön
        </Link>
      </div>
    );
  }

  return <Editor onSaved={handleSaved} />;
}
