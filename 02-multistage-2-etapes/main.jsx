import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Cas 02 — Multi-stage</h1>
      <p>Cette app React a été buildée dans une étape séparée, puis servie par nginx.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);