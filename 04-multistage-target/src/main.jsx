import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Cas 04 — Multi-stage avec --target</h1>
      <p>Le même Dockerfile sert à builder soit une image de dev (hot-reload), soit une image de prod (nginx).</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);