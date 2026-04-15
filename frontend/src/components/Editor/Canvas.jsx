import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Renderer } from './Renderer';
import { themeToCssVarsStyle } from '../../lib/pageSettingsDefaults.js';

export const Canvas = () => {
  const canvasState = useEditorStore((s) => s.canvasState);
  const canvasZoom = useEditorStore((s) => s.canvasZoom);
  const canvasViewport = useEditorStore((s) => s.canvasViewport);
  const showCanvasGrid = useEditorStore((s) => s.showCanvasGrid);
  const showCanvasGuides = useEditorStore((s) => s.showCanvasGuides);
  const pageSettings = useEditorStore((s) => s.pageSettings);
  const setSelectedElement = useEditorStore((s) => s.setSelectedElement);
  const theme = pageSettings?.theme || {};

  const frameWidth =
    canvasViewport === 'mobile'
      ? 'min(100%, 390px)'
      : canvasViewport === 'tablet'
        ? 'min(100%, 820px)'
        : '100%';

  const gridStyle =
    showCanvasGrid ?
      {
        backgroundImage: `linear-gradient(to right, rgba(100,116,139,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.22) 1px, transparent 1px)`,
        backgroundSize: '8px 8px',
      }
    : undefined;

  return (
    <div
      className="flex-1 bg-gray-100 overflow-y-auto overflow-x-auto p-8 relative dark:bg-black"
      onClick={() => setSelectedElement(null)}
    >
      <div
        className="wb-theme-root max-w-5xl mx-auto bg-white min-h-[800px] shadow-sm rounded border border-gray-200 overflow-hidden dark:bg-gray-950 dark:border-gray-800 pointer-events-auto transition-[width] duration-200 relative"
        style={{
          width: frameWidth,
          zoom: `${canvasZoom}%`,
          ...themeToCssVarsStyle(theme),
        }}
      >
        {showCanvasGrid && (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={gridStyle}
            aria-hidden
          />
        )}
        {showCanvasGuides && (
          <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden>
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-blue-500/30 dark:bg-sky-400/35" />
            <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-blue-500/30 dark:bg-sky-400/35" />
          </div>
        )}
        <div className="relative z-[3] min-h-[800px]">
          <Renderer node={canvasState} />
        </div>
      </div>
    </div>
  );
};
