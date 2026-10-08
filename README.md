# ArtTrace

> Full-fidelity artist process capture and interactive replay.

Phase 0 spike: prove that we can record **every** pointer event
(`x`, `y`, `pressure`, `tiltX`, `tiltY`, `twist`, timestamp) during an
artist's drawing session, export it as a self-describing `.arttrace` file,
and replay it stroke-by-stroke at controllable speed.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## Usage

| Tab | Action |
|-----|--------|
| **Record** | Draw with stylus or mouse. Click **Save .arttrace** to export. |
| **Replay** | Load a `.arttrace` file, press **Play** to watch it replay. Pressure is shown as dot radius. |

## Tech stack

- TypeScript + React 18 + Vite 5
- [`perfect-freehand`](https://github.com/steveruizok/perfect-freehand) — pressure-sensitive stroke rendering
- Browser [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent) — `pressure`, `tiltX`, `tiltY`, `twist`
- Phase 0 format: human-readable JSON (binary + zstd in Phase 3)

## The `.arttrace` format

An event-sourced log plus a manifest:

```json
{
  "manifest": {
    "version": "0.1.0",
    "schemaVersion": 1,
    "canvasWidth": 800,
    "canvasHeight": 600,
    "strokeCount": 12,
    "totalDurationMs": 9823,
    "createdAt": "2026-10-08T..."
  },
  "events": [
    { "type": "canvas_init", "t": 0, "width": 800, "height": 600, "colorSpace": "srgb" },
    { "type": "tool_select", "t": 0, "tool": { "id": "pen-default", "color": "#1a1a2e", "size": 6, ... } },
    { "type": "stroke_begin", "t": 142, "strokeId": "a3f9c2", "layerId": "layer-0" },
    { "type": "stroke_points", "t": 148, "strokeId": "a3f9c2",
      "points": [{ "x": 120.5, "y": 88.2, "pressure": 0.43, "tiltX": -12, "tiltY": 5, "twist": 0, "t": 148 }] },
    { "type": "stroke_end", "t": 610, "strokeId": "a3f9c2" }
  ]
}
```

## Phase roadmap

| Phase | Scope |
|-------|-------|
| **0 — this** | Capture + replay spike, JSON format |
| 1 | Ghost overlay, play/pause/step, auto tool/color sync |
| 2 | DTW stroke scoring, pressure feedback, practice mode |
| 3 | Binary point stream, layers, libmypaint-WASM brushes, seek with keyframes |
| 4 | Hosted gallery, shareable links, gamification |

## Live demo

Deployed to GitHub Pages: https://harshabhi6129.github.io/arttrace/
(Enable Pages in repo Settings → Pages → Source: GitHub Actions after first push.)
