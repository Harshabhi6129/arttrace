import type {
  ArtTracePoint,
  ArtTraceEvent,
  ArtTraceFile,
  ArtTraceTool,
  ArtTraceManifest,
} from '../types/arttrace';

let events: ArtTraceEvent[] = [];
let sessionStart = 0;
let currentStrokeId: string | null = null;
let strokeCount = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let activeTool: ArtTraceTool = {
  id: 'pen-default',
  type: 'pen',
  color: '#1a1a2e',
  size: 6,
  opacity: 1.0,
  blendMode: 'source-over',
};

const elapsed = () => performance.now() - sessionStart;
const uid = () => Math.random().toString(36).slice(2, 10);

export function initCapture(width: number, height: number): void {
  events = [];
  sessionStart = performance.now();
  strokeCount = 0;
  canvasWidth = width;
  canvasHeight = height;
  events.push({ type: 'canvas_init', t: 0, width, height, colorSpace: 'srgb' });
  events.push({ type: 'tool_select', t: 0, tool: { ...activeTool } });
}

export function setTool(patch: Partial<ArtTraceTool>): void {
  activeTool = { ...activeTool, ...patch };
  events.push({ type: 'tool_select', t: elapsed(), tool: { ...activeTool } });
}

export function onPointerDown(e: PointerEvent): void {
  currentStrokeId = uid();
  strokeCount++;
  events.push({
    type: 'stroke_begin',
    t: elapsed(),
    strokeId: currentStrokeId,
    layerId: 'layer-0',
  });
  events.push({
    type: 'stroke_points',
    t: elapsed(),
    strokeId: currentStrokeId,
    points: [extractPoint(e)],
  });
}

export function onPointerMove(e: PointerEvent): void {
  if (!currentStrokeId) return;
  const coalesced = e.getCoalescedEvents?.() ?? [e];
  events.push({
    type: 'stroke_points',
    t: elapsed(),
    strokeId: currentStrokeId,
    points: coalesced.map(extractPoint),
  });
}

export function onPointerUp(e: PointerEvent): void {
  if (!currentStrokeId) return;
  events.push({ type: 'stroke_end', t: elapsed(), strokeId: currentStrokeId });
  currentStrokeId = null;
}

export function getStrokeCount(): number {
  return strokeCount;
}

export function exportArtTrace(): ArtTraceFile {
  const manifest: ArtTraceManifest = {
    version: '0.1.0',
    schemaVersion: 1,
    canvasWidth,
    canvasHeight,
    colorSpace: 'srgb',
    totalDurationMs: elapsed(),
    strokeCount,
    createdAt: new Date().toISOString(),
  };
  return { manifest, events: [...events] };
}

function extractPoint(e: PointerEvent): ArtTracePoint {
  return {
    x: e.offsetX,
    y: e.offsetY,
    pressure: e.pressure,
    tiltX: e.tiltX,
    tiltY: e.tiltY,
    twist: e.twist,
    t: elapsed(),
  };
}
