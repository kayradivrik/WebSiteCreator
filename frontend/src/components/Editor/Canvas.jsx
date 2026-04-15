import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Renderer } from './Renderer';

export const Canvas = () => {
  const canvasState = useEditorStore((s) => s.canvasState);
  const canvasZoom = useEditorStore((s) => s.canvasZoom);
  const setSelectedElement = useEditorStore((s) => s.setSelectedElement);

  return (
    <div
      className="flex-1 bg-gray-100 overflow-y-auto p-8 relative dark:bg-black"
      onClick={() => setSelectedElement(null)}
    >
      <div
        className="max-w-5xl mx-auto bg-white min-h-[800px] shadow-sm rounded border border-gray-200 overflow-hidden dark:bg-gray-950 dark:border-gray-800 pointer-events-auto transition-[zoom] duration-150"
        style={{ zoom: `${canvasZoom}%` }}
      >
        <Renderer node={canvasState} />
      </div>
    </div>
  );
};
