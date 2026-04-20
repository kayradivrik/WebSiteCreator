import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel.jsx';
import {
  Save,
  Eye,
  ExternalLink,
  Home,
  Download,
  FileJson,
  Trash2,
  ZoomIn,
  ZoomOut,
  Upload,
  CircleHelp,
  Code2,
  Smartphone,
  Tablet,
  Monitor,
  LayoutGrid,
  Crosshair,
  Undo2,
  Redo2,
  Sparkles,
  FolderArchive,
  Rocket,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { apiFetch } from '../../lib/api';
import { downloadCanvasHtml, downloadCanvasJson } from '../../lib/exportStaticHtml';
import { downloadSiteZip } from '../../lib/exportSiteZip.js';
import { normalizePageSettings } from '../../lib/pageSettingsDefaults.js';
import { ThemeToggle } from '../ThemeToggle.jsx';
import { ShortcutsModal } from '../ShortcutsModal.jsx';
import { ThemeAppearanceModal } from './ThemeAppearanceModal.jsx';
import { DeploySiteModal } from './DeploySiteModal.jsx';
import { useGoogleFont } from '../../hooks/useGoogleFont.js';

const CodeEditorDrawer = lazy(() =>
  import('./CodeEditorDrawer.jsx').then((m) => ({ default: m.CodeEditorDrawer }))
);

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
  const canvasViewport = useEditorStore((s) => s.canvasViewport);
  const setCanvasViewport = useEditorStore((s) => s.setCanvasViewport);
  const toggleShowCanvasGrid = useEditorStore((s) => s.toggleShowCanvasGrid);
  const toggleShowCanvasGuides = useEditorStore((s) => s.toggleShowCanvasGuides);
  const showCanvasGrid = useEditorStore((s) => s.showCanvasGrid);
  const showCanvasGuides = useEditorStore((s) => s.showCanvasGuides);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.historyPast.length > 0);
  const canRedo = useEditorStore((s) => s.historyFuture.length > 0);
  const pageSettings = useEditorStore((s) => s.pageSettings);
  useGoogleFont(pageSettings.googleFont);

  useEffect(() => {
    const name = (pageName || '').trim() || 'Yeni sayfa';
    const prev = document.title;
    document.title = `${name} · WebBuilder`;
    return () => {
      document.title = prev;
    };
  }, [pageName]);

  useEffect(() => {
    const onBefore = (e) => {
      if (useEditorStore.getState().historyPast.length === 0) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, []);

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [themeModalNonce, setThemeModalNonce] = useState(0);
  const [deployModalNonce, setDeployModalNonce] = useState(0);
  const [codeDrawerNonce, setCodeDrawerNonce] = useState(0);
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
      const response = await apiFetch('/pages', {
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
        pageSettings: normalizePageSettings({
          ...pageSettings,
          ...data.settings,
          theme: {
            ...pageSettings.theme,
            ...(typeof data.settings?.theme === 'object' ? data.settings.theme : {}),
          },
        }),
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
      const response = await apiFetch(`/pages/${id}`, { method: 'DELETE' });
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
    const { canvasState, pageName, pageSettings: ps } = useEditorStore.getState();
    const s = normalizePageSettings(ps);
    downloadCanvasHtml(canvasState, {
      title: pageName || 'sayfa',
      ...s,
    });
  };

  const handleDownloadSiteZip = async () => {
    setToast(null);
    try {
      const { canvasState, pageName, pageSettings: ps } = useEditorStore.getState();
      const s = normalizePageSettings(ps);
      await downloadSiteZip(canvasState, { title: pageName || 'sayfa', ...s });
      setToast({ type: 'ok', msg: 'Site zip indirildi' });
      window.setTimeout(() => setToast(null), 2200);
    } catch (e) {
      setToast({ type: 'err', msg: e?.message || 'Zip oluşturulamadı' });
    }
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
      const tag = e.target?.tagName;
      const typing =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target?.isContentEditable ||
        e.target?.closest?.('.cm-editor');

      const modalOpen =
        shortcutsOpen || codeDrawerOpen || themeModalOpen || deployModalOpen;

      if (e.key === 'Escape' && !typing) {
        if (modalOpen) return;
        e.preventDefault();
        useEditorStore.getState().setSelectedElement(null);
        return;
      }

      if (!typing && !modalOpen) {
        if (e.key === 'Delete') {
          const sid = useEditorStore.getState().selectedElementId;
          if (sid && sid !== 'root') {
            e.preventDefault();
            useEditorStore.getState().removeElement(sid);
          }
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
          e.preventDefault();
          const sid = useEditorStore.getState().selectedElementId;
          if (sid && sid !== 'root') {
            useEditorStore.getState().duplicateElement(sid);
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && !typing) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            if (useEditorStore.getState().historyFuture.length > 0) redo();
          } else if (useEditorStore.getState().historyPast.length > 0) {
            undo();
          }
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          if (useEditorStore.getState().historyFuture.length > 0) redo();
        }
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (typing) return;
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    persistSave,
    undo,
    redo,
    shortcutsOpen,
    codeDrawerOpen,
    themeModalOpen,
    deployModalOpen,
  ]);

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
          <img
            src="/logo-mark.svg"
            alt="WebBuilder logo"
            className="hidden h-5 w-5 sm:block rounded"
          />
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
          <div className="hidden md:flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-gray-700 px-0.5">
            <button
              type="button"
              onClick={() => setCanvasViewport('mobile')}
              disabled={saving || deleting}
              className={`p-1.5 rounded ${canvasViewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'} disabled:opacity-40`}
              title="Mobil genişlik (~390px) — sm: altı"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCanvasViewport('tablet')}
              disabled={saving || deleting}
              className={`p-1.5 rounded ${canvasViewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'} disabled:opacity-40`}
              title="Tablet (~820px) — md: ve lg: önizleme"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCanvasViewport('desktop')}
              disabled={saving || deleting}
              className={`p-1.5 rounded ${canvasViewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'} disabled:opacity-40`}
              title="Tam genişlik (masaüstü)"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-gray-700 px-0.5">
            <button
              type="button"
              onClick={() => toggleShowCanvasGrid()}
              disabled={saving || deleting}
              className={`p-1.5 rounded ${showCanvasGrid ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'} disabled:opacity-40`}
              title="8px yerleşim ızgarası"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleShowCanvasGuides()}
              disabled={saving || deleting}
              className={`p-1.5 rounded ${showCanvasGuides ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'} disabled:opacity-40`}
              title="Merkez kılavuz çizgileri"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-gray-700 px-0.5">
            <button
              type="button"
              onClick={() => undo()}
              disabled={!canUndo || saving || deleting}
              className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded disabled:opacity-40"
              title="Geri al (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => redo()}
              disabled={!canRedo || saving || deleting}
              className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded disabled:opacity-40"
              title="Yinele (Ctrl+Y veya Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              setThemeModalNonce((n) => n + 1);
              setThemeModalOpen(true);
            }}
            disabled={saving || deleting}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            title="Sayfa ayarları: görünüm, SEO, font"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadSiteZip()}
            disabled={saving || deleting}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            title="Statik site zip (HTML + site-export.css, CDN yok)"
          >
            <FolderArchive className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setDeployModalNonce((n) => n + 1);
              setDeployModalOpen(true);
            }}
            disabled={saving || deleting}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            title="Netlify / Vercel dağıtımı"
          >
            <Rocket className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCodeDrawerNonce((n) => n + 1);
              setCodeDrawerOpen(true);
            }}
            disabled={saving || deleting}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            title="Konsol ve kod: özel CSS, canvas JSON, dışa aktarılan HTML"
          >
            <Code2 className="w-4 h-4" />
          </button>
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
            title="Tek HTML dosyası (Tailwind CDN — tek dosya)"
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
      {themeModalOpen && (
        <ThemeAppearanceModal key={themeModalNonce} onClose={() => setThemeModalOpen(false)} />
      )}
      {deployModalOpen && (
        <DeploySiteModal key={deployModalNonce} onClose={() => setDeployModalOpen(false)} pageTitle={pageName} />
      )}
      {codeDrawerOpen && (
        <Suspense fallback={null}>
          <CodeEditorDrawer
            key={codeDrawerNonce}
            open={codeDrawerOpen}
            onClose={() => setCodeDrawerOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
