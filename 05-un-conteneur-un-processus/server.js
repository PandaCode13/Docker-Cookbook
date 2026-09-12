const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Cas 05 - Un conteneur, un seul processus', pid: process.pid });
});

const server = app.listen(PORT, () => {
  console.log(`[PID ${process.pid}] Serveur lancé sur le port ${PORT}`);
});

// Ce processus (PID 1 dans le conteneur) doit gérer lui-même l'arrêt propre.
// Sans ça, "docker stop" doit attendre le timeout complet (10s par défaut)
// avant de tuer le processus au forceps (SIGKILL).
function arretPropre(signal) {
  console.log(`[PID ${process.pid}] Signal ${signal} reçu, arrêt en cours...`);
  server.close(() => {
    console.log(`[PID ${process.pid}] Serveur arrêté proprement.`);
    process.exit(0);
  });
}

process.on('SIGTERM', () => arretPropre('SIGTERM'));
process.on('SIGINT', () => arretPropre('SIGINT'));