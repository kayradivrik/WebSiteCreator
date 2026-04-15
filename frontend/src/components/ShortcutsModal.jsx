import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

const ROWS = [
  ['Kaydet', 'Ctrl / ⌘ + S'],
  ['Kısayol listesi', '? (input dışında)'],
  ['Canvas yakınlaştır', 'Üst çubukta + / −'],
  ['Panoya dön', 'Üstteki ev ikonu'],
  ['Önizleme', 'Önizle (önce kaydeder)'],
  ['JSON içe aktar', 'Üst çubuk yükle ikonu'],
  ['Bileşen çoğalt', 'Özelliklerde kopya ikonu'],
  ['Seçimi kaldır', 'Canvas boş alanına tıklama'],
];

export function ShortcutsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white" id="shortcuts-title">
            <Keyboard className="w-4 h-4 text-blue-600" />
            Kısayollar
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul className="max-h-[70vh] overflow-auto px-4 py-3 text-sm">
          {ROWS.map(([label, keys]) => (
            <li key={label} className="flex items-center justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-800">
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
              <kbd className="shrink-0 rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Soru işareti (?) ile bu pencereyi açıp kapatabilirsiniz.
        </p>
      </div>
    </div>
  );
}
