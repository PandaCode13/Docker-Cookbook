import express from 'express';
import { add } from './math';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Cas 03 - Multi-stage 3 étapes (deps → build → test → runtime)',
    exempleCalcul: add(2, 3),
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});