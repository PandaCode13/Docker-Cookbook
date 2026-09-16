# Cas 07 — Plusieurs conteneurs orchestrés via docker-compose

## Quand utiliser ce pattern

C'est l'approche **recommandée** dans la grande majorité des projets multi-services, et le contraire direct du cas 06. Chaque service (frontend, backend, base de données...) vit dans son **propre conteneur**, avec sa propre image, ses propres logs, son propre cycle de vie — et `docker-compose.yml` orchestre le tout : réseau interne, ordre de démarrage, ports exposés.

Typique pour :
- Un frontend + un backend qui communiquent entre eux
- Ajouter une base de données, un cache Redis, etc. (chaque nouveau service = un bloc de plus dans `docker-compose.yml`)
- N'importe quel projet avec plusieurs briques qui doivent tourner ensemble en local

## Comparer avec le cas 06

| | Cas 06 (1 conteneur, 2 processus) | Cas 07 (2 conteneurs) |
|---|---|---|
| Logs | Mélangés dans un seul flux | Séparés par conteneur (`docker compose logs frontend`) |
| Si un service plante | supervisord doit gérer ça en interne | Le conteneur concerné redémarre seul, l'autre n'est pas affecté |
| Scaler un composant | Impossible indépendamment | `docker compose up --scale backend=3` (facile) |
| Communication interne | `127.0.0.1` (même machine) | Nom du service (`http://backend:3001`, DNS interne à Compose) |

## Commande pour tester

### Windows (PowerShell)

```powershell
cd 07-multi-conteneurs-compose

docker compose up --build
```

### Linux / Mac

```bash
cd 07-multi-conteneurs-compose

docker compose up --build
```

Puis ouvre `http://localhost:8080` — tu dois voir la page, avec le message du backend chargé en dessous.

Pour arrêter : `Ctrl+C`, puis `docker compose down` pour bien nettoyer les conteneurs et le réseau créés.

## Structure attendue

```
07-multi-conteneurs-compose\
  docker-compose.yml
  README.md
  frontend\
    Dockerfile
    nginx.conf
    index.html
  backend\
    Dockerfile
    server.js
    package.json
```

## Vérifier que les conteneurs sont bien séparés

```powershell
docker compose ps
```

Tu dois voir **deux** conteneurs listés (un pour `frontend`, un pour `backend`), chacun avec son propre nom, contrairement au cas 06 où un seul conteneur apparaissait dans `docker ps`.

## Voir les logs séparément

```powershell
docker compose logs frontend
docker compose logs backend
```

Contrairement au cas 06 où tout était mélangé dans un seul flux de logs, ici chaque service a ses logs bien isolés — beaucoup plus facile à déboguer.

## Pièges fréquents

- **Utiliser `127.0.0.1` ou `localhost` dans `nginx.conf` pour joindre le backend** : ça ne fonctionnera JAMAIS ici, contrairement au cas 06. Chaque conteneur a son propre `localhost` isolé. Il faut utiliser le **nom du service** Compose (`backend`), résolu automatiquement par le DNS interne de Docker.
- **Oublier `depends_on`** : sans ça, Compose peut démarrer les deux conteneurs en parallèle, et le frontend pourrait tenter une requête vers le backend avant qu'il soit prêt. `depends_on` garantit l'ordre de démarrage (mais pas que le service est "prêt" à répondre — juste qu'il a démarré).
- **Exposer inutilement tous les ports vers l'hôte** : ici, seul `frontend` a un `ports:` vers ta machine. Le `backend` n'a pas besoin d'être accessible depuis l'extérieur — seul le frontend doit pouvoir le joindre, via le réseau interne de Compose.
- **Oublier `docker compose down`** : contrairement à `docker run`, `docker compose up` crée aussi un réseau dédié en plus des conteneurs. Sans `down`, ce réseau reste en place même après avoir arrêté les conteneurs.