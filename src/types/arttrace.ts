// ArtTrace event-sourced format — schema v0.1.0

export interface ArtTracePoint {
  x: number;
  y: number;
  pressure: number;   // 0.0–1.0  (stylus pressure)
  tiltX: number;      // degrees -90 to 90
  tiltY: number;      // degrees -90 to 90
  twist: number;      // degrees 0 to 359
  t: number;          // ms since session start
}

export interface ArtTraceTool {
  id: string;
  type: 'pen' | 'pencil' | 'brush' | 'eraser' | 'fill';
  color: string;      // CSS color, e.g. "#1a1a2e"
  size: number;       // base size in canvas units
  opacity: number;    // 0.0–1.0
  blendMode: GlobalCompositeOperation;
}

// ─── Event types ──────────────────────────────────────────────────────────────

export interface CanvasInitEvent {
  type: 'canvas_init';
  t: number;
  width: number;
  height: number;
  colorSpace: 'srgb' | 'display-p3';
}

export interface ToolSelectEvent {
  type: 'tool_select';
  t: number;
  tool: ArtTraceTool;
}

export interface StrokeBeginEvent {
  type: 'stroke_begin';
  t: number;
  strokeId: string;
  layerId: string;
}

export interface StrokePointsEvent {
  type: 'stroke_points';
  t: number;
  strokeId: string;
  points: ArtTracePoint[];
}

export interface StrokeEndEvent {
  type: 'stroke_end';
  t: number;
  strokeId: string;
}

export type ArtTraceEvent =
  | CanvasInitEvent
  | ToolSelectEvent
  | StrokeBeginEvent
  | StrokePointsEvent
  | StrokeEndEvent;

// ─── File container ───────────────────────────────────────────────────────────

export interface ArtTraceManifest {
  version: '0.1.0';
  schemaVersion: 1;
  canvasWidth: number;
  canvasHeight: number;
  colorSpace: 'srgb' | 'display-p3';
  totalDurationMs: number;
  strokeCount: number;
  createdAt: string;  // ISO 8601
}

export interface ArtTraceFile {
  manifest: ArtTraceManifest;
  events: ArtTraceEvent[];
}
