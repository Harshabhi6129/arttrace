import React, { useCallback, useRef, useState } from 'react';
import type { ArtTraceFile, StrokePointsEvent } from '../types/arttrace';
import { StrokeReplayer } from '../replay/StrokeReplayer';
import type { ReplayState } from '../replay/StrokeReplayer';

const W = 800;
const H = 600;

export const PlayerView: React.FC = () => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const replayerRef = useRef<StrokeReplayer | null>(null);
  const [replayState, setReplayState] = useState<ReplayState>('idle');
  const [loaded,  setLoaded]  = useState(false);
  const [summary, setSummary] = useState('');

  const load = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data: ArtTraceFile = JSON.parse(ev.target!.result as string);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      setSummary(
        `${data.manifest.strokeCount} strokes · ${(data.manifest.totalDurationMs / 1000).toFixed(1)}s`
      );
      replayerRef.current = new StrokeReplayer(data, {
        onToolChange:   () => {},
        onStrokeBegin:  () => {},
        onStrokePoints: (ev: StrokePointsEvent) => {
          if (!ctx) return;
          for (const pt of ev.points) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(0.5, pt.pressure * 8), 0, Math.PI * 2);
            ctx.fillStyle = '#1a1a2e';
            ctx.fill();
          }
        },
        onStrokeEnd:   () => {},
        onStateChange: setReplayState,
      });
      setLoaded(true);
    };
    reader.readAsText(file);
  }, []);

  const stateColor = replayState === 'playing' ? '#2a9d8f'
                   : replayState === 'done'    ? '#6c757d'
                   : '#888';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, cursor: 'pointer' }}>
          Load .arttrace
          <input type="file" accept=".arttrace" onChange={load} style={{ marginLeft: 8 }} />
        </label>
        {loaded && (
          <>
            <button onClick={() => replayerRef.current?.play(1)} disabled={replayState === 'playing'}>
              Play 1x
            </button>
            <button onClick={() => replayerRef.current?.play(2)} disabled={replayState === 'playing'}>
              Play 2x
            </button>
            <button onClick={() => replayerRef.current?.pause()} disabled={replayState !== 'playing'}>
              Pause
            </button>
          </>
        )}
        <span style={{ fontSize: 13, color: stateColor }}>
          {replayState}{summary ? ` · ${summary}` : ''}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ border: '1px solid #dee2e6', background: '#fff', display: 'block' }}
      />
      {loaded && (
        <p style={{ fontSize: 12, color: '#999' }}>
          Dot radius = pressure. Play at 2x to verify timing fidelity.
        </p>
      )}
    </div>
  );
};
