import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel.jsx';
import {
  Save,
  Eye,
  MonitorPlay,
  ExternalLink,
  Home,
  Download,
  FileJson,
  Trash2,
  ZoomIn,
  ZoomOut,
  Upload,
  CircleHelp,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { apiUrl } from '../../lib/api';
import { downloadCanvasHtml, downloadCanvasJson } from '../../lib/exportStaticHtml';
import { ThemeToggle } from '../ThemeToggle.jsx';
import { ShortcutsModal } from '../ShortcutsModal.jsx';

export const Editor = ({ onSaved }) => {
  const navigate = useNavigate();
  const currentPageId = useEditorStore((s) => s.currentPageId);
  const pageName = useEditorStore((s) => s.pageName);
  const setPageName = useEditorStore((s) => s.setPageName);
  const pageSlug = useEditorStore((s) => s.pageSlug);
  const setPageSlug = useEditorStore((s) => s.setPageSlug);
  const canvasZoom = useEditorStore((s) => s.canvasZoom);
  const setCanvasZoom = useEditorStore((s) => s.setCanvasZoom);
  const resetEditor = useEditorStore((s) => s.resetEditor);

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const saveInFlight = useRef(false);
  const importRef = useRef(null);

  const persistSave = useCallback(async () => {
    if (saveInFlight.current) return false;
    const {
      canvasState: tree,
      currentPageId: id,
      pageName: name,
      pageSettings,
      pageSlug: slugField,
    } = useEditorStore.getState();
    const slugSend = slugField?.trim() || undefined;
    const beforeId = id;
    saveInFlight.current = true;
    setSaving(true);
    setToast(null);
    try {
      const response = await fetch(apiUrl('/pages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id || undefined,
          name: name?.trim() || 'Yeni sayfa',
          slug: slugSend,
          canvasState: tree,
          settings: pageSettings,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setToast({ type: 'err', msg: data.error || data.message || 'Kayıt başarısız' });
        return false;
      }
      useEditorStore.setState({
        currentPageId: data._id != null ? String(data._id) : useEditorStore.getState().currentPageId,
        pageName: data.name != null ? data.name : name,
        pageSlug: data.slug != null ? String(data.slug) : useEditorStore.getState().pageSlug,
        pageSettings: {
          favicon: data.settings?.favicon ?? pageSettings.favicon ?? '',
          customCSS: data.settings?.customCSS ?? pageSettings.customCSS ?? '',
        },
      });
      setToast({ type: 'ok', msg: 'Kaydedildi' });
      window.setTimeout(() => setToast(null), 2200);
      const newId = data._id != null ? String(data._id) : null;
      if (!beforeId && newId) {
        window.setTimeout(() => {
          onSaved?.(newId);
        }, 0);
      }
      return true;
    } catch (e) {
      console.error(e);
      setToast({ type: 'err', msg: 'Sunucuya bağlanılamadı' });
      return false;
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }, [onSaved]);

  const handleSave = () => {
    void persistSave();
  };

  const handleDeletePage = async () => {
    const id = useEditorStore.getState().currentPageId;
    if (!id || !window.confirm('Bu sayfa kalıcı olarak silinsin mi?')) return;
    setDeleting(true);
    setToast(null);
    try {
      const response = await fetch(apiUrl(`/pages/${id}`), { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setToast({ type: 'err', msg: data.error || data.message || 'Sayfa silinemedi' });
        return;
      }
      resetEditor();
      navigate('/', { replace: true });
    } catch (e) {
      console.error(e);
      setToast({ type: 'err', msg: 'Sunucuya bağlanılamadı' });
    } finally {
      setDeleting(false);
    }
  };

  const handlePreviewNewTab = async () => {
    const ok = await persistSave();
    if (!ok) return;
    const id = useEditorStore.getState().currentPageId;
    if (!id) return;
    const url = `${window.location.origin}/view/${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadHtml = () => {
    const { canvasState, pageName, pageSettings } = useEditorStore.getState();
    downloadCanvasHtml(canvasState, {
      title: pageName || 'sayfa',
      customCSS: pageSettings?.customCSS,
      favicon: pageSettings?.favicon,
    });
  };

  const handleDownloadJson = () => {
    const { canvasState, pageName } = useEditorStore.getState();
    downloadCanvasJson(canvasState, pageName || 'sayfa');
  };

  const handlePickImport = () => {
    importRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    void file.text().then(
      (text) => {
        try {
          const tree = JSON.parse(text);
          useEditorStore.getState().replaceCanvasFromImport(tree);
          setToast({ type: 'ok', msg: 'Canvas JSON içe aktarıldı' });
          window.setTimeout(() => setToast(null), 2200);
        } catch (err) {
          setToast({ type: 'err', msg: err?.message || 'Geçersiz JSON' });
        }
      },
      () => setToast({ type: 'err', msg: 'Dosya okunamadı' })
    );
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void persistSave();
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [persistSave]);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-foreground bg-background">
      <header className="min-h-14 border-b flex flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shrink-0">
        <Link
          to="/"
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white shrink-0"
          title="Pano"
        >
          <Home className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
          <MonitorPlay className="w-5 h-5 text-blue-600 hidden sm:block" />
          <span className="hidden sm:inline">
            WebBuilder<span className="text-blue-500">.ai</span>
          </span>
        </div>
        <div className="flex flex-1 min-w-0 basis-[200px] gap-2 items-center mx-1">
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Sayfa adı"
            className="min-w-0 flex-1 px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-950 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <input
            type="text"
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
            placeholder="slug"
            title="Yayın URL slug (kayıtta sunucu benzersiz yapar)"
            className="w-24 shrink-0 px-2 py-1.5 text-xs font-mono border rounded-lg bg-white dark:bg-gray-950 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/40 xl:w-32"
          />
        </div>
        {currentPageId && (
          <span className="hidden lg:inline text-[10px] text-gray-400 font-mono truncate max-w-[100px]" title={currentPageId}>
            {currentPageId.slice(0, 8)}…
          </span>
        )}
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          <div className="hidden sm:flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-gray-700 px-1">
            <button
              type="button"
              onClick={() => setCanvasZoom(canvasZoom - 10)}
              disabled={canvasZoom <= 50 || saving || deleting}
              className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded disabled:opacity-40"
              title="Uzaklaştır"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-9 text-center text-[11px] font-mono text-gray-500 dark:text-gray-400">{canvasZoom}%</span>
            <button
              type="button"
              onClick={() => setCanvasZoom(canvasZoom + 10)}
              disabled={canvasZoom >= 150 || saving || deleting}
              className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded disabled:opacity-40"
              title="Yakınlaştır"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            title="Kısayollar (?)"
          >
            <CircleHelp className="w-4 h-4" />
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={handlePickImport}
            disabled={saving || deleting}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            title="Canvas JSON içe aktar"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDownloadHtml}
            title="Tek HTML dosyası indir (Tailwind CDN ile tarayıcıda açılır)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">HTML</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            title="Sayfa ağacı (JSON) — yedek veya içe aktarma için"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            <span className="hidden lg:inline">JSON</span>
          </button>
          {currentPageId && (
            <button
              type="button"
              onClick={() => void handleDeletePage()}
              disabled={saving || deleting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40 disabled:opacity-50"
              title="Sayfayı sil"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden lg:inline">Sil</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void handlePreviewNewTab()}
            disabled={saving || deleting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
              <Eye
                className={`absolute h-4 w-4 transition-opacity ${saving ? 'opacity-0' : 'opacity-100'}`}
                strokeWidth={2}
              />
              <span
                className={`pointer-events-none absolute box-border h-4 w-4 rounded-full border-2 border-solid border-gray-300 border-t-gray-700 transition-opacity dark:border-gray-600 dark:border-t-gray-200 ${
                  saving ? 'animate-spin opacity-100' : 'opacity-0'
                }`}
              />
            </span>
            <span className="hidden sm:inline">Önizle</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 hidden sm:block shrink-0" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
          >
            <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
              <Save
                className={`absolute h-4 w-4 transition-opacity ${saving ? 'opacity-0' : 'opacity-100'}`}
                strokeWidth={2}
              />
              <span
                className={`pointer-events-none absolute box-border h-4 w-4 rounded-full border-2 border-solid border-white/35 border-t-white transition-opacity ${
                  saving ? 'animate-spin opacity-100' : 'opacity-0'
                }`}
              />
            </span>
            <span>Kaydet</span>
          </button>
        </div>
      </header>

      {toast && (
        <div
          className={`px-4 py-2 text-center text-sm shrink-0 ${
            toast.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative min-h-0">
        <Sidebar />
        <Canvas />
        <PropertiesPanel />
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
};
