const express = require('express');
const app = express();
const PORT = 3001;

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Réponse depuis le conteneur backend', pid: process.pid });
});

app.listen(PORT, () => {
  console.log(`[API][PID ${process.pid}] Backend lancé sur le port ${PORT}`);
});