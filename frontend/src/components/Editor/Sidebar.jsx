import React from 'react';
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
} from 'lucide-react';
import { PRESET_BLOCKS } from '../../lib/presetBlocks';

export const Sidebar = () => {
  const addElement = useEditorStore((s) => s.addElement);
  const insertSubtree = useEditorStore((s) => s.insertSubtree);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const findDropTargetParentId = useEditorStore((s) => s.findDropTargetParentId);

  const handleAdd = (type) => {
    const targetId = findDropTargetParentId(selectedElementId);
    addElement(targetId, type);
  };

  const handlePreset = (preset) => {
    const targetId = findDropTargetParentId(selectedElementId);
    insertSubtree(targetId, preset.root);
  };

  const components = [
    { type: 'Section', icon: <Box className="w-4 h-4"/>, label: 'Section' },
    { type: 'Container', icon: <Layout className="w-4 h-4"/>, label: 'Container' },
    { type: 'Grid', icon: <GridIcon className="w-4 h-4"/>, label: 'Grid' },
    { type: 'Heading', icon: <Type className="w-4 h-4"/>, label: 'Heading' },
    { type: 'Text', icon: <TextIcon className="w-4 h-4"/>, label: 'Text' },
    { type: 'Button', icon: <MousePointer className="w-4 h-4"/>, label: 'Button' },
    { type: 'Link', icon: <Link2 className="w-4 h-4"/>, label: 'Link' },
    { type: 'Image', icon: <ImageIcon className="w-4 h-4"/>, label: 'Image' },
    { type: 'Card', icon: <Box className="w-4 h-4"/>, label: 'Card' },
  ];

  return (
    <div className="w-64 bg-background border-r flex flex-col pt-4 overflow-y-auto dark:bg-gray-950 dark:border-gray-800">
      <div className="px-5 mb-4">
        <h2 className="font-semibold tracking-tight text-sm uppercase text-gray-500 mb-4 flex items-center gap-2">
          Bileşenler
        </h2>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Tıklayarak seçili kutunun içine tek bileşen ekleyin; hazır bloklar için aşağıya bakın.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {components.map(comp => (
            <button 
              key={comp.type}
              onClick={() => handleAdd(comp.type)}
              className="flex flex-col items-center justify-center p-3 border rounded-xl hover:bg-gray-50 hover:border-blue-200 dark:border-gray-800 dark:hover:bg-gray-900 transition-all gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm"
            >
               {comp.icon}
               <span className="text-[10px] uppercase tracking-wider font-semibold">{comp.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mb-4 border-t dark:border-gray-800 pt-4">
        <h2 className="font-semibold tracking-tight text-sm uppercase text-gray-500 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Hazır bloklar
        </h2>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          Seçili kutunun içine (veya uygun ebeveyne) tam bölüm eklenir; eklenen kök otomatik seçilir.
        </p>
        <div className="flex flex-col gap-2">
          {PRESET_BLOCKS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePreset(preset)}
              className="text-left rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 transition-colors"
            >
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 block">{preset.label}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Mock Katmanlar */}
      <div className="mt-4 border-t dark:border-gray-800 pt-4 px-5 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Layers Tree</h3>
        <div className="text-sm space-y-2 text-gray-600 dark:text-gray-400 font-medium">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2"><Navigation className="w-3 h-3"/> Section (Root)</span>
            <span className="flex items-center gap-2 pl-4 border-l ml-1"><Navigation className="w-3 h-3 text-gray-300"/> Container</span>
            <span className="flex items-center gap-2 pl-8 border-l ml-1"><Navigation className="w-3 h-3 text-gray-300"/> Heading</span>
          </div>
        </div>
      </div>
    </div>
  );
};
