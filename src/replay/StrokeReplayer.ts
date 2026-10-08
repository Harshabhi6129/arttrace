import type {
  ArtTraceFile,
  ArtTraceEvent,
  StrokePointsEvent,
  ToolSelectEvent,
} from '../types/arttrace';

export type ReplayState = 'idle' | 'playing' | 'paused' | 'done';

interface Callbacks {
  onToolChange:   (ev: ToolSelectEvent) => void;
  onStrokeBegin:  (strokeId: string) => void;
  onStrokePoints: (ev: StrokePointsEvent) => void;
  onStrokeEnd:    (strokeId: string) => void;
  onStateChange:  (state: ReplayState) => void;
}

export class StrokeReplayer {
  private file: ArtTraceFile;
  private cb: Callbacks;
  private idx = 0;
  private raf: number | null = null;
  private replayStart = 0;
  private speed = 1.0;
  private state: ReplayState = 'idle';

  constructor(file: ArtTraceFile, callbacks: Callbacks) {
    this.file = file;
    this.cb   = callbacks;
  }

  play(speed = 1.0): void {
    if (this.raf !== null) { cancelAnimationFrame(this.raf); this.raf = null; }
    this.speed = speed;
    if (this.state === 'paused' && this.idx < this.file.events.length) {
      const currentT = this.file.events[this.idx]?.t ?? 0;
      this.replayStart = performance.now() - currentT / this.speed;
    } else {
      this.idx = 0;
      this.replayStart = performance.now();
    }
    this.setState('playing');
    this.tick();
  }

  pause(): void {
    if (this.raf !== null) { cancelAnimationFrame(this.raf); this.raf = null; }
    this.setState('paused');
  }

  private tick(): void {
    const elapsed = (performance.now() - this.replayStart) * this.speed;
    while (this.idx < this.file.events.length && this.file.events[this.idx].t <= elapsed) {
      this.dispatch(this.file.events[this.idx]);
      this.idx++;
    }
    if (this.idx >= this.file.events.length) { this.setState('done'); return; }
    this.raf = requestAnimationFrame(() => this.tick());
  }

  private dispatch(ev: ArtTraceEvent): void {
    switch (ev.type) {
      case 'tool_select':   this.cb.onToolChange(ev);          break;
      case 'stroke_begin':  this.cb.onStrokeBegin(ev.strokeId); break;
      case 'stroke_points': this.cb.onStrokePoints(ev);         break;
      case 'stroke_end':    this.cb.onStrokeEnd(ev.strokeId);   break;
    }
  }

  private setState(s: ReplayState): void {
    this.state = s;
    this.cb.onStateChange(s);
  }
}
