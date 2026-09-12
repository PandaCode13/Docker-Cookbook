# Cas 02 — Multi-stage (2 étapes)

## Quand utiliser ce pattern

Quand ton app nécessite une **étape de build** qui transforme le code source en fichiers statiques ou en binaire, et que ces outils de build ne sont pas nécessaires pour faire tourner l'app finale. Typique pour :
- **Frontend** : React, Vue, Angular, Svelte (build → HTML/CSS/JS statiques servis par nginx)
- **Langages compilés** : Go, Rust, C++ (build → binaire exécutable seul dans l'image finale)
- **TypeScript** compilé en JavaScript

L'idée clé : l'étape "builder" contient tout l'outillage lourd (Node, compilateurs, devDependencies), mais **seul le résultat du build** est copié dans l'image finale, via `COPY --from=builder`. L'image finale n'a donc plus besoin de Node ni du code source.

## Commande pour tester

### Windows (PowerShell)

```powershell
cd 02-multistage-2-etapes

docker build -t cas02-multistage .

docker run -p 8080:80 cas02-multistage
```

### Linux / Mac

```bash
cd 02-multistage-2-etapes

docker build -t cas02-multistage .

docker run -p 8080:80 cas02-multistage
```

Puis ouvrir `http://localhost:8080` — tu dois voir la page React "Cas 02 — Multi-stage".

## Comparer la taille avec le cas 01

```bash
docker images cas01-single-stage
docker images cas02-multistage
```

Tu verras que l'image du cas 02 (basée sur `nginx:alpine`) est nettement plus légère que si on avait gardé Node + les sources dans l'image finale — c'est tout l'intérêt du multi-stage.

## Pièges fréquents

- **Oublier `AS builder` / `AS runtime`** : sans nommer les étapes, `COPY --from=0` fonctionne mais devient illisible et fragile si tu ajoutes une étape plus tard.
- **Copier le mauvais dossier de build** : Vite build dans `dist/`, mais Create React App build dans `build/` — vérifie bien le nom selon ton outil.
- **Oublier `dist/` (ou `build/`) dans le `.dockerignore`** : sans ça, si tu as déjà buildé en local, l'ancien dossier `dist/` local pourrait être copié par erreur au lieu d'être régénéré proprement pendant le build Docker (selon l'ordre des instructions).
- **Garder `npm install` sans `--production` inutilement dans l'étape builder** : ici c'est normal d'installer aussi les devDependencies (comme Vite) car on en a besoin pour builder — contrairement au cas 01 où on visait une image finale directement.
- **Oublier que le port nginx par défaut est 80, pas 3000** : contrairement au cas 01 (Node/Express sur le port 3000), ici il faut mapper le port 80 du conteneur.