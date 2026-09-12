# Cas 05 — Un seul conteneur, un seul processus

## Quand utiliser ce pattern

C'est le principe **par défaut recommandé** pour la grande majorité des conteneurs : un conteneur ne devrait lancer qu'**un seul processus principal**. Ce n'est pas juste une convention — ça a un impact concret :

- Le processus lancé par `CMD` (ou `ENTRYPOINT`) devient le **PID 1** à l'intérieur du conteneur.
- Quand tu fais `docker stop`, Docker envoie un signal `SIGTERM` à ce PID 1, puis attend (10 secondes par défaut) avant d'envoyer un `SIGKILL` brutal si le processus n'a pas quitté.
- Si ton processus principal ne gère pas `SIGTERM`, ou si ce n'est pas lui qui reçoit le signal (voir piège ci-dessous), l'arrêt du conteneur est **toujours brutal et lent** — mauvais pour un arrêt propre (fermer les connexions DB, finir de traiter une requête en cours, etc.).

Ce cas illustre comment bien gérer ça, avec un exemple concret et testable.

## Le piège central : forme "exec" vs forme "shell" du CMD

```dockerfile
CMD ["node", "server.js"]   # forme EXEC → node devient directement PID 1
CMD "node server.js"        # forme SHELL → /bin/sh devient PID 1, node est un sous-processus
```

Avec la forme **shell**, c'est `/bin/sh -c "node server.js"` qui tourne comme PID 1. Le shell ne transmet pas automatiquement `SIGTERM` à `node` : ton `docker stop` semblera "bloquer" pendant 10 secondes avant que Docker tue tout au forceps, et ton code de `graceful shutdown` (dans `server.js`) ne sera jamais exécuté.

Ce Dockerfile utilise volontairement la forme **exec**, la bonne pratique.

## Commande pour tester

### Windows (PowerShell)

```powershell
cd 05-un-conteneur-un-processus

docker build -t cas05-un-processus .
docker run -d -p 3000:3000 --name test05 cas05-un-processus

# Vérifie que ça répond
curl http://localhost:3000

# Regarde les logs en temps réel dans un second terminal AVANT l'étape suivante
docker logs -f test05
```

Puis, dans le premier terminal :
```powershell
docker stop test05
```

### Linux / Mac

```bash
cd 05-un-conteneur-un-processus

docker build -t cas05-un-processus .
docker run -d -p 3000:3000 --name test05 cas05-un-processus

curl http://localhost:3000

docker logs -f test05
```

Puis, dans un autre terminal :
```bash
docker stop test05
```

## Ce que tu dois observer

Dans les logs (`docker logs -f test05`), au moment du `docker stop`, tu dois voir apparaître **immédiatement** :
```
[PID 1] Signal SIGTERM reçu, arrêt en cours...
[PID 1] Serveur arrêté proprement.
```
Et la commande `docker stop` doit se terminer **rapidement** (pas de blocage de 10 secondes).

## Vérifier le piège en le reproduisant volontairement

Modifie temporairement le Dockerfile pour utiliser la forme shell, rebuild, et relance le même test :

```dockerfile
CMD node server.js
```

Refais `docker build`, `docker run`, puis `docker stop`. Cette fois, la commande `docker stop` doit mettre **~10 secondes** à répondre (Docker attend le timeout, puis tue le conteneur au forceps), et tu ne verras **jamais** les logs "Signal SIGTERM reçu" apparaître.

N'oublie pas de nettoyer ensuite : `docker rm -f test05`.

## Pièges fréquents

- **Forme shell du CMD** : voir ci-dessus, le piège central de ce cas.
- **Ne pas écouter `SIGTERM` dans le code applicatif** : même avec la forme exec correcte, si ton code ne fait rien en réponse à `SIGTERM`, Node tue le processus immédiatement sans laisser le temps de fermer proprement les connexions en cours (comportement par défaut de Node face à SIGTERM : il termine directement, ce qui n'est pas forcément un "arrêt propre" applicatif).
- **Lancer via un gestionnaire de paquets** (`CMD ["npm", "start"]`) : même en forme exec, `npm` lui-même devient PID 1 et ne transmet pas toujours correctement les signaux à son sous-processus selon la version de npm — préfère lancer directement l'exécutable final (`node`, `python`, le binaire compilé...) plutôt que de passer par `npm start`.
- **Oublier `docker rm -f`** après un test avec `--name` : le nom reste réservé par le conteneur arrêté, un prochain `docker run --name test05` échouera tant que l'ancien conteneur n'est pas supprimé.