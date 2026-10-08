import React, { useState } from 'react';
import { RecorderView } from './components/RecorderView';
import { PlayerView } from './components/PlayerView';

type Tab = 'record' | 'play';

export const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('record');

  const btnStyle = (active: boolean): React.CSSProperties => ({
    fontWeight: active ? 700 : 400,
    borderColor: active ? '#0d6efd' : '#adb5bd',
    color: active ? '#0d6efd' : 'inherit',
  });

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>ArtTrace</h1>
      <p style={{ color: '#888', marginBottom: 20, fontSize: 13 }}>
        Phase 0 — full-fidelity capture &amp; replay
      </p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        <button onClick={() => setTab('record')} style={btnStyle(tab === 'record')}>
          Record
        </button>
        <button onClick={() => setTab('play')} style={btnStyle(tab === 'play')}>
          Replay
        </button>
      </div>
      {tab === 'record' ? <RecorderView /> : <PlayerView />}
    </div>
  );
};
