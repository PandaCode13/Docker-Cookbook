# Cas 01 — Single-stage

## Quand utiliser ce pattern

Quand ton app tourne **telle quelle**, sans étape de build qui transforme le code en artefacts statiques. Typique pour :
- Une API backend (Node, Python, Ruby) qui s'exécute directement avec un interpréteur
- Un script qui n'a pas besoin de compilation
- Un prototype ou un projet simple où optimiser la taille de l'image n'est pas prioritaire

**Ne pas utiliser** ce pattern si ton app doit être "buildée" (React, Vue, Go, Rust, TypeScript compilé...) : l'image finale contiendrait alors des outils de build (compilateurs, devDependencies) inutiles en production, ce qui l'alourdit inutilement → voir plutôt le cas 02 (multi-stage).

## Commande pour tester

```bash
# Se placer dans le dossier du cas
cd 01-single-stage

# Builder l'image
docker build -t cas01-single-stage .

# Lancer le conteneur
docker run -p 3000:3000 cas01-single-stage
```

Puis ouvrir `http://localhost:3000` — tu dois voir le message JSON de bienvenue.

## Pièges fréquents

- **Oublier le `.dockerignore`** : sans lui, `node_modules` local (s'il existe) ou le `.git` sont copiés dans l'image, ce qui la rend énorme et peut même écraser les dépendances installées dans le conteneur avec une version incompatible (ex: modules natifs compilés pour macOS copiés dans une image Linux).
- **Copier tout le code avant `npm install`** : ça casse le cache Docker. Il faut toujours copier `package.json` en premier, installer les dépendances, puis copier le reste — sinon chaque modification de code (même un simple `console.log`) force à réinstaller toutes les dépendances.
- **Utiliser `npm install` au lieu de `npm ci`** en production : `npm ci` est plus rapide et garantit une installation identique à celle du `package-lock.json`, sans divergence de versions.
- **Image finale trop lourde** : ce pattern garde tout dans une seule image (y compris les outils utilisés pendant `npm install`). Acceptable pour un backend simple, mais si l'image devient trop grosse, c'est un signal pour passer au multi-stage.