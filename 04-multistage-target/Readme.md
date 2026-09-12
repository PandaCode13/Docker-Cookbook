# Cas 04 — Multi-stage avec cible (`--target`)

## Quand utiliser ce pattern

Quand tu veux **un seul Dockerfile** qui sert plusieurs usages différents selon le contexte, plutôt que de maintenir plusieurs fichiers (`Dockerfile.dev`, `Dockerfile.prod`...). Typique pour :
- Une image de **développement** avec hot-reload, code monté en volume, tous les outils de dev
- Une image de **production** optimisée, légère, sans les outils de dev
- Un pipeline CI qui a besoin de builder juste une étape intermédiaire (ex: juste pour lancer des tests, comme évoqué au cas 03) sans aller jusqu'à l'image finale

Le mot-clé `AS nom` sur chaque `FROM` définit une **cible nommée**. On choisit laquelle construire avec `docker build --target=nom`. Sans `--target`, Docker construit la **dernière étape du fichier** par défaut (ici `prod`).

## Structure du Dockerfile

Ce cas définit 4 cibles :
- `base` : installation des dépendances (partagée par `dev` et `build`)
- `dev` : lance le serveur Vite avec hot-reload
- `build` : compile l'app en fichiers statiques
- `prod` : sert les fichiers statiques via nginx (cible par défaut)

## Commande pour tester

### Windows (PowerShell)

```powershell
cd 04-multistage-target

# Builder et lancer la cible "prod" (par défaut, sans --target)
docker build -t cas04-prod .
docker run -p 8080:80 cas04-prod

# Builder et lancer la cible "dev" avec hot-reload
docker build --target dev -t cas04-dev .
docker run -p 5173:5173 -v ${PWD}:/app -v /app/node_modules cas04-dev
```

### Linux / Mac

```bash
cd 04-multistage-target

# Builder et lancer la cible "prod" (par défaut, sans --target)
docker build -t cas04-prod .
docker run -p 8080:80 cas04-prod

# Builder et lancer la cible "dev" avec hot-reload
docker build --target dev -t cas04-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules cas04-dev
```

- Cible **prod** → ouvrir `http://localhost:8080`
- Cible **dev** → ouvrir `http://localhost:5173`, puis modifie `src/main.jsx` : la page doit se rafraîchir toute seule (hot-reload), sans reconstruire l'image.

## Comprendre le double volume sur la cible dev

`-v ${PWD}:/app` monte ton code local dans le conteneur (pour le hot-reload). Mais ça écraserait aussi le `node_modules` déjà installé dans l'image par un dossier vide côté hôte. Le second volume `-v /app/node_modules` (un "volume anonyme") protège spécifiquement ce sous-dossier : il garde celui de l'image, sans qu'il soit écrasé par le montage du dossier local.

## Pièges fréquents

- **Oublier `--target`** : sans le préciser, Docker construit toujours la dernière cible du fichier (`prod` ici), jamais `dev`. C'est un piège classique si tu attends une image de dev par défaut.
- **Oublier `--host 0.0.0.0` (ou `server.host: true` dans `vite.config.js`)** : par défaut, Vite n'écoute que sur `localhost` à l'intérieur du conteneur, donc inaccessible depuis l'extérieur. Il faut explicitement ouvrir l'écoute sur toutes les interfaces.
- **Oublier le volume anonyme sur `node_modules`** : sans lui, monter tout ton dossier local écrase le `node_modules` installé dans l'image par le contenu (souvent vide ou absent) de ta machine hôte, ce qui casse le conteneur au démarrage.
- **Confondre `build` (la cible) et `npm run build` (le script)** : dans ce Dockerfile, la cible nommée `build` exécute justement `RUN npm run build` — les deux existent à des niveaux différents (Docker vs npm), ne pas les confondre en lisant le fichier.