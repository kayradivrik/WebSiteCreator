import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  Type,
  Layout,
  Image as ImageIcon,
  Box,
  Grid as GridIcon,
  Navigation,
  Type as TextIcon,
  MousePointer,
  Link2,
  Sparkles,
  LayoutTemplate,
  ChevronDown,
} from 'lucide-react';
import { PRESET_BLOCKS } from '../../lib/presetBlocks';
import { WEBSITE_TEMPLATES } from '../../lib/websiteTemplates';

export const Sidebar = () => {
  const addElement = useEditorStore((s) => s.addElement);
  const insertSubtree = useEditorStore((s) => s.insertSubtree);
  const applyWebsiteTemplate = useEditorStore((s) => s.applyWebsiteTemplate);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const findDropTargetParentId = useEditorStore((s) => s.findDropTargetParentId);
  const [blocksOpen, setBlocksOpen] = useState(true);

  const handleAdd = (type) => {
    const targetId = findDropTargetParentId(selectedElementId);
    addElement(targetId, type);
  };

  const handlePreset = (preset) => {
    const targetId = findDropTargetParentId(selectedElementId);
    insertSubtree(targetId, preset.root);
  };

  const handleWebsiteTemplate = (tpl) => {
    const ok = window.confirm(
      `"${tpl.name}" şablonu yüklensin mi?\n\nMevcut canvas tamamen değişir. Kaydetmediğiniz değişiklikler kaybolur.`
    );
    if (!ok) return;
    try {
      applyWebsiteTemplate(tpl.canvasState);
    } catch (e) {
      window.alert(e?.message || 'Şablon yüklenemedi');
    }
  };

  const components = [
    { type: 'Section', icon: <Box className="w-4 h-4" />, label: 'Bölüm', title: 'Sayfa bölümü (section)' },
    { type: 'Container', icon: <Layout className="w-4 h-4" />, label: 'Kutu', title: 'İçerik kutusu (div)' },
    {
      type: 'Grid',
      icon: <GridIcon className="w-4 h-4" />,
      label: 'Izgara',
      title: 'Satır/sütun düzeni — className ile grid veya flex (ör. flex gap-3)',
    },
    { type: 'Heading', icon: <Type className="w-4 h-4" />, label: 'Başlık', title: 'H1–H6' },
    { type: 'Text', icon: <TextIcon className="w-4 h-4" />, label: 'Metin', title: 'Paragraf' },
    { type: 'Button', icon: <MousePointer className="w-4 h-4" />, label: 'Düğme', title: 'Buton veya link (href ile)' },
    { type: 'Link', icon: <Link2 className="w-4 h-4" />, label: 'Link', title: 'Metin bağlantısı' },
    { type: 'Image', icon: <ImageIcon className="w-4 h-4" />, label: 'Görsel', title: 'Resim' },
    { type: 'Card', icon: <Box className="w-4 h-4" />, label: 'Kart', title: 'Kart kapsayıcı' },
  ];

  return (
    <div className="w-[280px] sm:w-72 shrink-0 bg-background border-r flex flex-col pt-3 overflow-y-auto dark:bg-gray-950 dark:border-gray-800 max-h-screen">
      <div className="px-4 mb-3 rounded-lg bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-950/50 pb-3 border-b border-indigo-100/80 dark:border-indigo-900/40">
        <h2 className="font-semibold text-xs uppercase tracking-wide text-indigo-800 dark:text-indigo-200 mb-0.5 flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 shrink-0" />
          Website şablonları
        </h2>
        <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 leading-snug mb-2">
          Tüm sayfayı değiştirir; sonra metin ve stilleri özelleştirin.
        </p>
        <div className="flex flex-col gap-1.5">
          {WEBSITE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleWebsiteTemplate(tpl)}
              className="text-left rounded-lg border border-indigo-200/90 dark:border-indigo-800 bg-white/90 dark:bg-gray-900/80 px-2.5 py-2 hover:border-indigo-400 hover:shadow-sm dark:hover:border-indigo-600 transition-all"
            >
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block leading-tight">{tpl.name}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">{tpl.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-3">
        <h2 className="font-semibold tracking-tight text-xs uppercase text-gray-500 mb-2">Bileşenler</h2>
        <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
          Seçili kutunun içine tek bileşen ekler.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {components.map((comp) => (
            <button
              key={comp.type}
              type="button"
              title={comp.title || comp.label}
              onClick={() => handleAdd(comp.type)}
              className="flex flex-col items-center justify-center p-2.5 border rounded-lg hover:bg-gray-50 hover:border-blue-200 dark:border-gray-800 dark:hover:bg-gray-900 transition-all gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-semibold uppercase tracking-wide"
            >
              {comp.icon}
              {comp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-2 border-t dark:border-gray-800 pt-3">
        <button
          type="button"
          onClick={() => setBlocksOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 text-left mb-1 rounded-md py-1 hover:bg-gray-50 dark:hover:bg-gray-900/80 px-0.5"
        >
          <span className="font-semibold text-xs uppercase text-gray-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            Hazır bloklar
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${blocksOpen ? 'rotate-180' : ''}`} />
        </button>
        <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
          Seçili alanın içine eklenir; kök otomatik seçilir.
        </p>
        {blocksOpen && (
          <div className="max-h-[min(42vh,22rem)] overflow-y-auto pr-1 space-y-1.5">
            {PRESET_BLOCKS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset)}
                className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-800 px-2.5 py-2 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 block leading-tight">{preset.label}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">{preset.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t dark:border-gray-800 pt-3 px-4 pb-4">
        <h3 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Katman özeti</h3>
        <div className="text-xs space-y-1.5 text-gray-500 dark:text-gray-500 font-medium">
          <span className="flex items-center gap-2">
            <Navigation className="w-3 h-3 shrink-0" />
            Kök (Section)
          </span>
          <span className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 ml-1 text-[10px]">
            Şablon veya bileşen ekleyerek ağaç oluşur
          </span>
        </div>
      </div>
    </div>
  );
};
