import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Settings, Palette, Type, Layout, Trash2, Copy, Spline, Move } from 'lucide-react';

function PropertiesPanel() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectedNode = useEditorStore((s) =>
    s.selectedElementId ? s.getElement(s.selectedElementId) : null
  );
  const updateElementProps = useEditorStore((s) => s.updateElementProps);
  const updateElementClass = useEditorStore((s) => s.updateElementClass);
  const removeElement = useEditorStore((s) => s.removeElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const [activeTab, setActiveTab] = useState('content');

  if (!selectedNode) {
    return (
      <div className="w-80 bg-background border-l flex flex-col items-center justify-center text-gray-400 text-sm dark:bg-gray-950 dark:border-gray-800 p-8 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border dark:border-gray-800">
          <Settings className="w-6 h-6 text-gray-300" />
        </div>
        <p>Düzenlemek için canvas üzerinden bir bileşen seçin.</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    updateElementProps(selectedElementId, { [key]: value });
  };

  const handleVisualClass = (prefix, value) => {
    updateElementClass(selectedElementId, prefix, value);
  };

  const applyPositionMode = (mode) => {
    let c = selectedNode.props.className || '';
    c = c.replace(/\b(static|relative|absolute|fixed|sticky)\b/g, ' ').replace(/\s+/g, ' ').trim();
    if (mode) c = `${c} ${mode}`.trim();
    updateElementProps(selectedElementId, { className: c });
  };

  const currentClassName = selectedNode.props.className || '';

  const positionMode = /\babsolute\b/.test(currentClassName)
    ? 'absolute'
    : /\bfixed\b/.test(currentClassName)
      ? 'fixed'
      : /\brelative\b/.test(currentClassName)
        ? 'relative'
        : /\bstatic\b/.test(currentClassName)
          ? 'static'
          : /\bsticky\b/.test(currentClassName)
            ? 'sticky'
            : '';

  const paddingMatch = currentClassName.match(/(?:^|\s)p-(\d{1,2})(?:\s|$)/);
  const paddingSliderValue = paddingMatch ? Math.min(16, parseInt(paddingMatch[1], 10)) : 0;
  const marginMatch = currentClassName.match(/(?:^|\s)m-(\d{1,2})(?:\s|$)/);
  const marginSliderValue = marginMatch ? Math.min(16, parseInt(marginMatch[1], 10)) : 0;

  const parseTwAxis = (prefix) => {
    const m = currentClassName.match(new RegExp(`(?:^|\\s)${prefix}-(\\d+)(?:\\s|$)`));
    return m ? m[1] : '';
  };
  const topVal = parseTwAxis('top');
  const leftVal = parseTwAxis('left');
  const spacingSelectValues = ['', '0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32'];

  return (
    <div className="w-[340px] shrink-0 bg-white border-l shadow-xl z-20 flex flex-col dark:bg-gray-950 dark:border-gray-800 h-full overflow-hidden">
      
      {/* Header with Duplicate & Delete actions */}
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
        <div>
          <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">Özellikler</h2>
          <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-mono">
            {selectedNode.type} &middot; {selectedNode.id.substring(0, 6)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedElementId !== 'root' && (
            <>
              <button 
                onClick={() => duplicateElement(selectedElementId)}
                title="Duplicate Element"
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
               >
                <Copy className="w-4 h-4"/>
              </button>
              <button 
                onClick={() => removeElement(selectedElementId)}
                 title="Delete Element"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
               >
                <Trash2 className="w-4 h-4"/>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-800 text-xs font-medium shrink-0">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
        >
          <Type className="w-3.5 h-3.5" /> Content
        </button>
        <button 
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
        >
          <Palette className="w-3.5 h-3.5" /> Styling
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 pb-12">
        {activeTab === 'content' && (
          <div className="space-y-6 text-sm">
            {selectedNode.props.text !== undefined && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">İçerik (Text)</label>
                <textarea 
                  className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 min-h-[100px] resize-y" 
                  value={selectedNode.props.text} 
                  onChange={(e) => handleChange('text', e.target.value)}
                />
              </div>
            )}
            {selectedNode.type === 'Image' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Image Source</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700" 
                  value={selectedNode.props.src || ''} 
                  onChange={(e) => handleChange('src', e.target.value)}
                />
              </div>
            )}
            {selectedNode.type === 'Heading' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Heading Level</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm outline-none dark:bg-gray-900 dark:border-gray-700"
                  value={selectedNode.props.level || 'h2'}
                  onChange={(e) => handleChange('level', e.target.value)}
                >
                  <option value="h1">H1 - Ana Başlık</option>
                  <option value="h2">H2 - Alt Başlık</option>
                  <option value="h3">H3 - Başlık 3</option>
                  <option value="h4">H4 - Başlık 4</option>
                </select>
              </div>
            )}

            {['Button', 'Link', 'Heading', 'Text', 'Image'].includes(selectedNode.type) && (
              <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bağlantı</h3>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {selectedNode.type === 'Image' ? 'Resme tıklanınca (URL)' : 'Hedef URL (href)'}
                  </label>
                  <input
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    placeholder={
                      selectedNode.type === 'Image'
                        ? 'https://...'
                        : 'https:// veya /sayfa yolu'
                    }
                    className="w-full p-2 border rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
                    value={
                      selectedNode.type === 'Image'
                        ? selectedNode.props.linkHref || ''
                        : selectedNode.props.href || ''
                    }
                    onChange={(e) =>
                      handleChange(
                        selectedNode.type === 'Image' ? 'linkHref' : 'href',
                        e.target.value
                      )
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={!!selectedNode.props.targetBlank}
                    onChange={(e) => handleChange('targetBlank', e.target.checked)}
                  />
                  Yeni sekmede aç
                </label>
              </div>
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-8">
            
            {/* Visual Styling Helpers */}
            <div className="space-y-5">
              
              {/* Flexbox/Layout Quick Setters */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"><Layout className="w-3.5 h-3.5" /> Layout Mode</label>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => updateElementClass(selectedElementId, 'flex', 'flex flex-col gap-4')} className="p-2 border dark:border-gray-700 hover:bg-gray-50 flex flex-col items-center text-xs gap-1 rounded font-medium text-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                        <div className="flex flex-col gap-0.5"><div className="w-4 h-1 bg-current rounded"/><div className="w-4 h-1 bg-current rounded"/></div> Flex Col
                    </button>
                    <button onClick={() => updateElementClass(selectedElementId, 'flex', 'flex items-center gap-4')} className="p-2 border dark:border-gray-700 hover:bg-gray-50 flex flex-col items-center text-xs gap-1 rounded font-medium text-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                        <div className="flex gap-0.5"><div className="w-1 h-3 bg-current rounded"/><div className="w-1 h-3 bg-current rounded"/></div> Flex Row
                    </button>
                    <button onClick={() => updateElementClass(selectedElementId, 'flex', '')} className="p-2 border dark:border-gray-700 hover:bg-gray-50 flex flex-col items-center text-xs gap-1 rounded font-medium text-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                         Block
                    </button>
                </div>
              </div>

               {/* Background Color Quick */}
               <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Background</label>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleVisualClass('bg-', '')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 font-bold bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMGgxMHYxMEgwem0wIDV2NWg1VjVIMHptNSAwaDVWMUg1em0wIDV2NUgwdjVoNXoiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')]" title="Transparent"></button>
                  <button onClick={() => handleVisualClass('bg-', 'bg-white')} className="w-8 h-8 rounded-full border border-gray-300 bg-white" title="White"></button>
                  <button onClick={() => handleVisualClass('bg-', 'bg-gray-50')} className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50" title="Gray 50"></button>
                  <button onClick={() => handleVisualClass('bg-', 'bg-gray-900')} className="w-8 h-8 rounded-full border border-gray-800 bg-gray-900" title="Gray 900"></button>
                  <button onClick={() => handleVisualClass('bg-', 'bg-blue-600')} className="w-8 h-8 rounded-full border-blue-600 bg-blue-600" title="Blue 600"></button>
                  <button onClick={() => handleVisualClass('bg-', 'bg-rose-500')} className="w-8 h-8 rounded-full border-rose-500 bg-rose-500" title="Rose 500"></button>
                  <button onClick={() => handleVisualClass('bg-', 'bg-emerald-500')} className="w-8 h-8 rounded-full border-emerald-500 bg-emerald-500" title="Emerald 500"></button>
                </div>
              </div>

               {/* Text Color Quick */}
               <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"><Type className="w-3.5 h-3.5" /> Text Color</label>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleVisualClass('text-', 'text-gray-900')} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-900">A</button>
                  <button onClick={() => handleVisualClass('text-', 'text-gray-500')} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-500">A</button>
                  <button onClick={() => handleVisualClass('text-', 'text-white')} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gray-900 text-white">A</button>
                  <button onClick={() => handleVisualClass('text-', 'text-blue-600')} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-50 text-blue-600">A</button>
                </div>
              </div>

              {/* Spacing (Padding) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"><Spline className="w-3.5 h-3.5" /> Inner Spacing (Padding)</label>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-gray-400">Small</span>
                    <input 
                      type="range" min="0" max="16" className="flex-1 accent-blue-600" 
                      value={paddingSliderValue}
                      onChange={(e) => {
                          const val = e.target.value;
                          handleVisualClass('p-', val === "0" ? '' : `p-${val}`);
                      }}
                    />
                    <span className="w-8 text-right text-gray-400">Large</span>
                </div>
              </div>

              {/* Outer margin (uniform m-*) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Spline className="w-3.5 h-3.5" /> Dış boşluk (Margin)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-gray-400">0</span>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    className="flex-1 accent-blue-600"
                    value={marginSliderValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleVisualClass('m-', val === '0' ? '' : `m-${val}`);
                    }}
                  />
                  <span className="w-8 text-right text-gray-400">16</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  Kenarlardan uzaklık (tüm yönler). İnce ayar için aşağıdaki gelişmiş alana{' '}
                  <code className="font-mono">mx-4 mt-8</code> gibi yazabilirsiniz.
                </p>
              </div>

              {/* Position + offset (serbest yerleştirme için absolute + top/left) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Move className="w-3.5 h-3.5" /> Konum (Position)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPositionMode('')}
                    className={`py-2 text-xs border rounded-md dark:border-gray-700 ${
                      !positionMode ? 'ring-2 ring-blue-500 border-blue-500' : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    Akış
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPositionMode('relative')}
                    className={`py-2 text-xs border rounded-md dark:border-gray-700 ${
                      positionMode === 'relative' ? 'ring-2 ring-blue-500 border-blue-500' : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    Relative
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPositionMode('absolute')}
                    className={`py-2 text-xs border rounded-md dark:border-gray-700 ${
                      positionMode === 'absolute' ? 'ring-2 ring-blue-500 border-blue-500' : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    Absolute
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  <strong className="text-gray-500 dark:text-gray-400">Absolute</strong> ile kutuyu ebeveyne göre serbest
                  konumlandırırsınız; ebeveynde <code className="font-mono">relative</code> olması genelde gerekir.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">Top</span>
                    <select
                      className="w-full p-2 border rounded-lg text-xs dark:bg-gray-900 dark:border-gray-700"
                      value={topVal}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleVisualClass('top-', v ? `top-${v}` : '');
                      }}
                    >
                      {spacingSelectValues.map((v) => (
                        <option key={`top-${v}`} value={v}>
                          {v === '' ? '—' : `top-${v}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">Left</span>
                    <select
                      className="w-full p-2 border rounded-lg text-xs dark:bg-gray-900 dark:border-gray-700"
                      value={leftVal}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleVisualClass('left-', v ? `left-${v}` : '');
                      }}
                    >
                      {spacingSelectValues.map((v) => (
                        <option key={`left-${v}`} value={v}>
                          {v === '' ? '—' : `left-${v}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">Right</span>
                    <select
                      className="w-full p-2 border rounded-lg text-xs dark:bg-gray-900 dark:border-gray-700"
                      value={parseTwAxis('right')}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleVisualClass('right-', v ? `right-${v}` : '');
                      }}
                    >
                      {spacingSelectValues.map((v) => (
                        <option key={`right-${v}`} value={v}>
                          {v === '' ? '—' : `right-${v}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">Bottom</span>
                    <select
                      className="w-full p-2 border rounded-lg text-xs dark:bg-gray-900 dark:border-gray-700"
                      value={parseTwAxis('bottom')}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleVisualClass('bottom-', v ? `bottom-${v}` : '');
                      }}
                    >
                      {spacingSelectValues.map((v) => (
                        <option key={`bottom-${v}`} value={v}>
                          {v === '' ? '—' : `bottom-${v}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

               {/* Border Radius */}
               <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"><Spline className="w-3.5 h-3.5" /> Border Radius</label>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleVisualClass('rounded', 'rounded-none')} className="py-1 text-xs border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">0</button>
                  <button onClick={() => handleVisualClass('rounded', 'rounded-md')} className="py-1 text-xs border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">MD</button>
                  <button onClick={() => handleVisualClass('rounded', 'rounded-xl')} className="py-1 text-xs border rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700">XL</button>
                  <button onClick={() => handleVisualClass('rounded', 'rounded-full')} className="py-1 text-xs border rounded-full bg-gray-50 dark:bg-gray-800 dark:border-gray-700">Full</button>
                </div>
              </div>

            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 md:my-6 my-4 w-full" />

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Gelişmiş CSS (Tailwind Classes)
              </label>
              <textarea 
                className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 font-mono resize-y min-h-[140px] text-[13px] leading-relaxed text-gray-700 dark:text-gray-300 shadow-inner" 
                value={selectedNode.props.className || ''} 
                onChange={(e) => handleChange('className', e.target.value)}
                placeholder="Örn: mx-auto max-w-lg shadow-lg translate-x-2 z-10..."
                spellCheck={false}
              />
            </div>
            
          </div>
        )}
      </div>

    </div>
  );
}

export { PropertiesPanel };
export default PropertiesPanel;
