import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { X, Braces, Palette, FileCode2, Globe2, Copy, Terminal } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { nodeToStaticHtml, buildStandaloneHtml } from '../../lib/exportStaticHtml.js';
import { normalizePageSettings } from '../../lib/pageSettingsDefaults.js';

function useHtmlDarkClass() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/**
 * Tam ekran konsol / kod paneli: özel CSS, canvas JSON, dışa aktarılan HTML (salt okunur).
 */
export function CodeEditorDrawer({ open, onClose }) {
  const dark = useHtmlDarkClass();
  const customCSS = useEditorStore((s) => s.pageSettings.customCSS);
  const updatePageSettings = useEditorStore((s) => s.updatePageSettings);
  const replaceCanvasFromImport = useEditorStore((s) => s.replaceCanvasFromImport);
  const canvasState = useEditorStore((s) => s.canvasState);
  const pageName = useEditorStore((s) => s.pageName);
  const pageSettings = useEditorStore((s) => s.pageSettings);

  const [tab, setTab] = useState('css');
  const [jsonDraft, setJsonDraft] = useState('');
  const [feedback, setFeedback] = useState(null);

  const bodyHtml = useMemo(() => nodeToStaticHtml(canvasState), [canvasState]);

  const fullPageHtml = useMemo(() => {
    const s = normalizePageSettings(pageSettings);
    return buildStandaloneHtml(canvasState, {
      title: (pageName || '').trim() || 'sayfa',
      ...s,
      bundleMode: 'cdn',
    });
  }, [canvasState, pageName, pageSettings]);

  const close = useCallback(() => {
    setTab('css');
    onClose();
  }, [onClose]);

  const selectTab = useCallback((next) => {
    setTab(next);
    setFeedback(null);
    if (next === 'json') {
      setJsonDraft(JSON.stringify(useEditorStore.getState().canvasState, null, 2));
    }
  }, []);

  const copyHtml = useCallback(
    async (text) => {
      setFeedback(null);
      try {
        await navigator.clipboard.writeText(text);
        setFeedback({ type: 'ok', msg: 'HTML panoya kopyalandı.' });
      } catch {
        setFeedback({ type: 'err', msg: 'Panoya kopyalanamadı (tarayıcı izni?).' });
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const cssExtensions = useMemo(
    () => [basicSetup(), css(), ...(dark ? [oneDark] : [])],
    [dark]
  );
  const jsonExtensions = useMemo(
    () => [basicSetup(), json(), ...(dark ? [oneDark] : [])],
    [dark]
  );

  const applyJson = useCallback(() => {
    setFeedback(null);
    try {
      const tree = JSON.parse(jsonDraft);
      replaceCanvasFromImport(tree);
      setFeedback({ type: 'ok', msg: 'Canvas güncellendi.' });
    } catch (e) {
      const msg = e?.message || 'Geçersiz JSON veya yapı';
      setFeedback({ type: 'err', msg });
    }
  }, [jsonDraft, replaceCanvasFromImport]);

  const refreshJsonFromCanvas = useCallback(() => {
    setJsonDraft(JSON.stringify(useEditorStore.getState().canvasState, null, 2));
    setFeedback({ type: 'ok', msg: 'Metin, mevcut canvas ile yenilendi.' });
  }, []);

  if (!open) return null;

  const hint =
    tab === 'css'
      ? 'CSS kayıtta sayfa ayarlarına gider; önizleme ve HTML dışa aktarmada kullanılır.'
      : tab === 'json'
        ? 'Kök id "root" ve type alanları zorunludur. Kaydetmeden önce canvası kontrol edin.'
        : tab === 'html-body'
          ? 'Canvasın ürettiği işaretleme (gövde içi). Editörde gördüğünüz alan React bileşenleriyle çizilir; bu metin indir / zip ile aynı kaynaktır (nodeToStaticHtml).'
          : 'Tek dosya HTML — üst çubuktaki HTML indir ve dağıtım ile aynı (buildStandaloneHtml, Tailwind CDN).';

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="code-editor-drawer-title"
      onClick={close}
    >
      <div
        className="mt-auto flex max-h-[92vh] flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-800">
          <h2
            id="code-editor-drawer-title"
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            <Terminal className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
            Konsol ve kod
          </h2>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => selectTab('css')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tab === 'css'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Özel CSS
            </button>
            <button
              type="button"
              onClick={() => selectTab('json')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tab === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Braces className="h-3.5 w-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={() => selectTab('html-body')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tab === 'html-body'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              HTML gövdesi
            </button>
            <button
              type="button"
              onClick={() => selectTab('html-doc')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tab === 'html-doc'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Globe2 className="h-3.5 w-3.5" />
              Tam sayfa
            </button>
            <button
              type="button"
              onClick={close}
              className="ml-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Kapat (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="border-b border-gray-100 px-3 py-2 text-[11px] leading-snug text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {hint}
        </p>

        <div className="min-h-[min(52vh,420px)] flex-1 overflow-hidden border-b border-gray-100 dark:border-gray-800">
          {tab === 'css' ? (
            <CodeMirror
              value={customCSS}
              height="min(52vh, 420px)"
              extensions={cssExtensions}
              onChange={(v) => updatePageSettings({ customCSS: v })}
              className="text-sm [&_.cm-editor]:min-h-[min(52vh,420px)] [&_.cm-scroller]:font-mono"
            />
          ) : tab === 'json' ? (
            <CodeMirror
              value={jsonDraft}
              height="min(52vh, 420px)"
              extensions={jsonExtensions}
              onChange={setJsonDraft}
              className="text-sm [&_.cm-editor]:min-h-[min(52vh,420px)] [&_.cm-scroller]:font-mono"
            />
          ) : (
            <div
              className={`h-[min(52vh,420px)] overflow-auto p-3 font-mono text-xs leading-relaxed ${
                dark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
              }`}
            >
              <pre className="whitespace-pre-wrap break-words">{tab === 'html-body' ? bodyHtml : fullPageHtml}</pre>
            </div>
          )}
        </div>

        {tab === 'json' && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={applyJson}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Canvas’a uygula
            </button>
            <button
              type="button"
              onClick={refreshJsonFromCanvas}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Canvas’tan yenile
            </button>
          </div>
        )}

        {(tab === 'html-body' || tab === 'html-doc') && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => void copyHtml(tab === 'html-body' ? bodyHtml : fullPageHtml)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              <Copy className="h-3.5 w-3.5" />
              Kopyala
            </button>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Kaynak: <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">src/lib/exportStaticHtml.js</code>
            </span>
          </div>
        )}

        {feedback && (
          <div
            className={`px-3 py-2 text-center text-xs ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200'
            }`}
          >
            {feedback.msg}
          </div>
        )}
      </div>
    </div>
  );
}
