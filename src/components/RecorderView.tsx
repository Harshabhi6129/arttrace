import React, { useEffect, useCallback, useState } from 'react';
import { DrawCanvas } from '../canvas/DrawCanvas';
import {
  initCapture,
  onPointerDown as captureDown,
  onPointerMove as captureMove,
  onPointerUp   as captureUp,
  getStrokeCount,
  exportArtTrace,
} from '../capture/PointerCapture';
import type { ArtTraceTool } from '../types/arttrace';

const W = 800;
const H = 600;

const TOOL: ArtTraceTool = {
  id: 'pen-default',
  type: 'pen',
  color: '#1a1a2e',
  size: 6,
  opacity: 1.0,
  blendMode: 'source-over',
};

export const RecorderView: React.FC = () => {
  const [strokes, setStrokes] = useState(0);

  useEffect(() => { initCapture(W, H); }, []);

  const handleUp = useCallback((e: PointerEvent) => {
    captureUp(e);
    setStrokes(getStrokeCount());
  }, []);

  const save = useCallback(() => {
    const data = exportArtTrace();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `arttrace-${Date.now()}.arttrace`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={save} disabled={strokes === 0}>
          Save .arttrace
        </button>
        <span style={{ fontSize: 13, color: '#666' }}>
          {strokes} stroke{strokes !== 1 ? 's' : ''} recorded
        </span>
        <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>
          (use a stylus for pressure + tilt data)
        </span>
      </div>
      <DrawCanvas
        width={W} height={H} tool={TOOL}
        onPointerDown={captureDown}
        onPointerMove={captureMove}
        onPointerUp={handleUp}
      />
    </div>
  );
};
