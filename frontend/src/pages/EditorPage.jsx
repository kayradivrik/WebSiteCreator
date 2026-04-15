import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Editor } from '../components/Editor';
import { useEditorStore } from '../store/useEditorStore';
import { apiUrl } from '../lib/api';

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
    fetch(apiUrl(`/pages/${pageId}`))
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
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-gray-500 dark:text-gray-400">
        Sayfa yükleniyor…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">Sayfa bulunamadı veya sunucu hatası.</p>
        <Link
          to="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Panele dön
        </Link>
      </div>
    );
  }

  return <Editor onSaved={handleSaved} />;
}
