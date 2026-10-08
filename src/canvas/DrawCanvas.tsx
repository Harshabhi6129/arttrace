import React, { useRef, useEffect, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';
import type { ArtTraceTool } from '../types/arttrace';

interface DrawCanvasProps {
  width:  number;
  height: number;
  tool:   ArtTraceTool;
  onPointerDown?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerUp?:   (e: PointerEvent) => void;
  readonly?: boolean;
}

function toSvgPath(stroke: number[][]): string {
  if (!stroke.length) return '';
  const d: string[] = ['M', stroke[0][0].toFixed(1), stroke[0][1].toFixed(1), 'Q'];
  for (let i = 0; i < stroke.length; i++) {
    const p0 = stroke[i];
    const p1 = stroke[(i + 1) % stroke.length];
    d.push(
      p0[0].toFixed(1), p0[1].toFixed(1),
      ((p0[0] + p1[0]) / 2).toFixed(1), ((p0[1] + p1[1]) / 2).toFixed(1)
    );
  }
  d.push('Z');
  return d.join(' ');
}

function renderStroke(
  ctx:  CanvasRenderingContext2D,
  pts:  [number, number, number][],
  tool: ArtTraceTool
): void {
  if (!pts.length) return;
  const outline = getStroke(pts, {
    size: tool.size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: false,
  });
  const path = new Path2D(toSvgPath(outline));
  ctx.save();
  ctx.globalCompositeOperation = tool.blendMode;
  ctx.globalAlpha = tool.opacity;
  ctx.fillStyle = tool.color;
  ctx.fill(path);
  ctx.restore();
}

export const DrawCanvas: React.FC<DrawCanvasProps> = ({
  width, height, tool,
  onPointerDown, onPointerMove, onPointerUp,
  readonly = false,
}) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const committedRef = useRef<HTMLCanvasElement | null>(null);
  const ptsRef       = useRef<[number, number, number][]>([]);
  const drawingRef   = useRef(false);

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    committedRef.current = c;
  }, [width, height]);

  const composite = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const committed = committedRef.current;
    if (!ctx || !committed) return;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(committed, 0, 0);
    renderStroke(ctx, ptsRef.current, tool);
  }, [width, height, tool]);

  const handleDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readonly) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    ptsRef.current = [[e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.nativeEvent.pressure]];
    onPointerDown?.(e.nativeEvent);
  }, [onPointerDown, readonly]);

  const handleMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || readonly) return;
    for (const ce of (e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent])) {
      ptsRef.current.push([ce.offsetX, ce.offsetY, ce.pressure]);
    }
    composite();
    onPointerMove?.(e.nativeEvent);
  }, [composite, onPointerMove, readonly]);

  const handleUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || readonly) return;
    drawingRef.current = false;
    const committed = committedRef.current?.getContext('2d');
    if (committed) renderStroke(committed, ptsRef.current, tool);
    ptsRef.current = [];
    composite();
    onPointerUp?.(e.nativeEvent);
  }, [composite, onPointerUp, readonly, tool]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ touchAction: 'none', cursor: readonly ? 'default' : 'crosshair', display: 'block' }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
    />
  );
};
