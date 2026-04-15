import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { DEFAULT_THEME, GOOGLE_FONT_IDS } from '../../lib/pageSettingsDefaults.js';

export function ThemeAppearanceModal({ onClose }) {
  const updatePageSettings = useEditorStore((s) => s.updatePageSettings);
  const snap = useEditorStore.getState().pageSettings;

  const [tab, setTab] = useState('look');
  const [googleFont, setGoogleFont] = useState(() => snap.googleFont || '');
  const [theme, setTheme] = useState(() => ({
    ...DEFAULT_THEME,
    ...snap.theme,
  }));
  const [metaTitle, setMetaTitle] = useState(() => snap.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(() => snap.metaDescription || '');

  const apply = () => {
    updatePageSettings({
      googleFont: googleFont.trim(),
      theme: { ...theme },
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-settings-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h2 id="site-settings-title" className="text-sm font-semibold text-gray-900 dark:text-white">
            Sayfa ayarları
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-100 px-3 pt-2 dark:border-gray-800">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-950">
            {[
              { id: 'look', label: 'Görünüm' },
              { id: 'seo', label: 'SEO' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-auto px-4 py-4 text-sm">
          {tab === 'look' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Google Font</label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  value={googleFont}
                  onChange={(e) => setGoogleFont(e.target.value)}
                >
                  <option value="">Sistem yazı tipi</option>
                  {GOOGLE_FONT_IDS.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400">
                  Sayfa kökünde ve dışa aktarılan HTML’de yüklenir; bileşenlerde Tailwind{' '}
                  <code className="font-mono">font-sans</code> ile uyumludur.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Renk paleti (CSS değişkenleri)</p>
                {['primary', 'secondary', 'accent', 'surface', 'text'].map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-xs capitalize text-gray-500 dark:text-gray-400">{key}</span>
                    <input
                      type="color"
                      className="h-9 w-12 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                      value={/^#[0-9a-f]{6}$/i.test(theme[key] || '') ? theme[key] : DEFAULT_THEME[key]}
                      onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 font-mono text-xs dark:border-gray-700 dark:bg-gray-950"
                      value={theme[key] || ''}
                      onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'seo' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300" htmlFor="wb-meta-title">
                  Tarayıcı sekmesi başlığı
                </label>
                <input
                  id="wb-meta-title"
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Boş bırakırsanız editördeki sayfa adı kullanılır"
                  maxLength={200}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300" htmlFor="wb-meta-desc">
                  Meta açıklama
                </label>
                <textarea
                  id="wb-meta-desc"
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Arama sonuçları ve paylaşım önizlemesi için kısa özet (isteğe bağlı)"
                  maxLength={320}
                />
                <p className="text-[10px] text-gray-400">
                  Dışa aktarma, zip ve dağıtımda <code className="font-mono">description</code> ile{' '}
                  <code className="font-mono">og:</code> etiketlerine yazılır.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium dark:border-gray-600"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
