# Cas 06 — Un seul conteneur, plusieurs processus (supervisord)

## ⚠️ Note sur ce cas

Contrairement aux cas précédents, je n'ai **pas pu tester le build Docker complet** dans mon environnement (pas d'accès à `nginx`/`supervisord` en dehors de Docker ici). J'ai vérifié la syntaxe de chaque fichier individuellement (JS, JSON, configs), mais **c'est la première fois que tu seras le premier à valider que l'ensemble fonctionne**. Si quelque chose casse, montre-moi l'erreur et on corrige ensemble — c'est normal et ça fait partie du processus.

## Quand utiliser ce pattern

Faire tourner plusieurs processus dans un seul conteneur est **généralement déconseillé** en pratique — l'approche recommandée est plutôt le cas 07 (plusieurs conteneurs via docker-compose). Mais ce pattern existe et se justifie dans certains cas réels :
- Migrer une app legacy monolithique sans tout réarchitecturer immédiatement
- Un outil qui nécessite absolument un "sidecar" dans le même espace réseau/filesystem (rare, souvent mieux géré par un vrai sidecar Kubernetes)
- Certaines images tout-en-un fournies par des éditeurs tiers (à utiliser telles quelles, rarement à concevoir soi-même)

Ce cas te montre **comment** le faire proprement si tu n'as pas le choix, et surtout les inconvénients concrets à connaître.

## Ce que fait cet exemple

- **nginx** sert une page HTML statique (`public/index.html`) sur le port 80
- **Node/Express** fait tourner une petite API sur le port 3001 (interne au conteneur)
- nginx fait office de proxy : une requête vers `/api/hello` est redirigée vers l'API Node
- **supervisord** devient le PID 1 du conteneur, et lance/surveille les deux processus (nginx + node)

## Structure attendue

```
06-un-conteneur-multi-processus\
  Dockerfile
  nginx.conf
  supervisord.conf
  .dockerignore
  README.md
  api\
    server.js
    package.json
  public\
    index.html
```

## Commande pour tester

### Windows (PowerShell)

```powershell
cd 06-un-conteneur-multi-processus

docker build -t cas06-multi-processus .
docker run -d -p 8080:80 --name test06 cas06-multi-processus

# Vérifie les logs : tu dois voir les logs de nginx ET de l'API mélangés
docker logs -f test06
```

### Linux / Mac

```bash
cd 06-un-conteneur-multi-processus

docker build -t cas06-multi-processus .
docker run -d -p 8080:80 --name test06 cas06-multi-processus

docker logs -f test06
```

Puis ouvre `http://localhost:8080` — tu dois voir la page HTML, avec le message de l'API chargé automatiquement en dessous ("Réponse de l'API (processus n°2)...").

N'oublie pas de nettoyer ensuite : `docker stop test06 && docker rm test06`.

## Ce que tu dois observer (et qui illustre le problème)

1. **Les logs sont mélangés** : dans `docker logs -f test06`, tu verras les lignes de nginx et de l'API s'entremêler, préfixées différemment par supervisord. Impossible de "couper" juste un composant sans arrêter l'autre.
2. **Un seul point de défaillance** : si l'API Node plante en boucle, `supervisord` va la relancer (`autorestart=true`), mais nginx continue de tourner à côté sans savoir qu'il y a un souci — la page se charge, mais la partie API affiche une erreur.
3. **Impossible de scaler indépendamment** : si tu as besoin de plus de puissance pour l'API mais pas pour nginx, tu ne peux pas — les deux sont figés ensemble dans le même conteneur.

## Comparer avec le cas 05

Relance le cas 05 (single-process) à côté et compare : dans le cas 05, `docker stop` déclenche un arrêt propre et prévisible d'un seul processus clair. Ici, `supervisord` doit lui-même gérer l'arrêt de deux processus enfants — plus complexe, et souvent source de bugs si mal configuré (processus zombie, arrêt qui traîne, etc.).

## Pièges fréquents

- **Oublier `autostart=true`** sur un des programmes dans `supervisord.conf` : ce processus ne démarrera jamais, sans erreur explicite au premier abord.
- **Rediriger les logs vers un fichier plutôt que `/dev/stdout`/`/dev/stderr`** : si tu oublies ça (comme fait ici volontairement), `docker logs` ne verra rien, et tu devras aller fouiller dans le conteneur pour trouver les vrais logs.
- **Oublier que supervisord ne transmet pas automatiquement les signaux comme un OS le ferait** : arrêter proprement plusieurs processus enfants demande une configuration plus fine (`stopsignal`, `stopasgroup`) que ce README ne couvre pas en détail — encore un argument en faveur d'un seul processus par conteneur.
- **Chemin nginx incorrect** : sur Alpine, la config nginx par défaut se trouve dans `/etc/nginx/http.d/`, pas `/etc/nginx/conf.d/` comme sur l'image officielle `nginx:alpine` — attention si tu compares avec le cas 02/04.