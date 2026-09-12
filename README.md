# Docker Cookbook

Collection de cas concrets et testables d'utilisation de Docker (build multi-stage, docker-compose, reverse proxy, dev containers, etc.) — un plan d'étude personnel pour comprendre chaque structure et savoir quand l'utiliser.

## Objectif

Plutôt qu'une documentation théorique, ce repo regroupe des **exemples fonctionnels et isolés**, organisés par cas d'usage réel. Chaque dossier peut être testé indépendamment avec `docker build` ou `docker compose up` pour vérifier qu'il fonctionne, et pour comprendre concrètement le pattern étudié.

## Structure

Chaque cas suit la même organisation :

```
NN-nom-du-cas/
├── Dockerfile (ou docker-compose.yml)
├── .dockerignore
└── README.md
```

Le `README.md` de chaque cas contient :
- **Quand utiliser ce pattern**
- **Commande pour tester**
- **Piège(s) fréquent(s)**

## Sommaire des 30 cas

### Selon le nombre d'étapes dans le Dockerfile
| # | Cas | Statut |
|---|-----|--------|
| 01 | [Single-stage (une seule étape)](./01-single-stage) | ⬜ |
| 02 | [Multi-stage (2 étapes : build + runtime)](./02-multistage-2-etapes) | ⬜ |
| 03 | [Multi-stage (3+ étapes : deps → build → test → runtime)](./03-multistage-3-etapes) | ⬜ |
| 04 | [Multi-stage avec cible (`--target`)](./04-multistage-target) | ⬜ |

### Selon le nombre de conteneurs/services
| # | Cas | Statut |
|---|-----|--------|
| 05 | [Un seul conteneur, un seul processus](./05-un-conteneur-un-processus) | ⬜ |
| 06 | [Un seul conteneur, plusieurs processus (supervisord/s6)](./06-un-conteneur-multi-processus) | ⬜ |
| 07 | [Plusieurs conteneurs orchestrés via docker-compose](./07-multi-conteneurs-compose) | ⬜ |
| 08 | [Conteneur sidecar](./08-sidecar) | ⬜ |
| 09 | [Conteneur d'initialisation (init container)](./09-init-container) | ⬜ |

### Selon l'organisation du code source
| # | Cas | Statut |
|---|-----|--------|
| 10 | [Un repo = un Dockerfile](./10-un-repo-un-dockerfile) | ⬜ |
| 11 | [Monorepo, un Dockerfile par service](./11-monorepo-multi-dockerfile) | ⬜ |
| 12 | [Monorepo, un seul Dockerfile multi-services](./12-monorepo-un-dockerfile) | ⬜ |

### Selon la stratégie d'images de base
| # | Cas | Statut |
|---|-----|--------|
| 13 | [Image de base standard officielle](./13-image-base-standard) | ⬜ |
| 14 | [Image de base personnalisée partagée](./14-image-base-personnalisee) | ⬜ |
| 15 | [Image minimaliste (distroless / scratch)](./15-image-minimaliste) | ⬜ |

### Selon l'orchestration multi-environnements
| # | Cas | Statut |
|---|-----|--------|
| 16 | [Un seul docker-compose.yml](./16-compose-unique) | ⬜ |
| 17 | [docker-compose avec fichiers d'override](./17-compose-override) | ⬜ |
| 18 | [Dockerfile paramétré par build args](./18-dockerfile-build-args) | ⬜ |

### Selon le réseau et le routage
| # | Cas | Statut |
|---|-----|--------|
| 19 | [Reverse proxy / gateway unique (nginx, Traefik, Caddy)](./19-reverse-proxy) | ⬜ |
| 20 | [Réseaux Docker dédiés par groupe de services](./20-reseaux-dedies) | ⬜ |

### Selon l'orchestration (au-delà de docker-compose)
| # | Cas | Statut |
|---|-----|--------|
| 21 | [Docker Swarm (mode stack)](./21-docker-swarm) | ⬜ |
| 22 | [Kubernetes avec pods multi-conteneurs](./22-kubernetes-pods) | ⬜ |

### Selon le workflow de développement
| # | Cas | Statut |
|---|-----|--------|
| 23 | [Dev container avec bind-mount du code source](./23-devcontainer-bind-mount) | ⬜ |
| 24 | [Devcontainer.json (VS Code / Dev Containers)](./24-devcontainer-json) | ⬜ |
| 25 | [Docker Compose avec `profiles`](./25-compose-profiles) | ⬜ |

### Selon l'optimisation du build
| # | Cas | Statut |
|---|-----|--------|
| 26 | [Cache mounts BuildKit (`--mount=type=cache`)](./26-buildkit-cache-mounts) | ⬜ |
| 27 | [Build multi-plateforme (buildx)](./27-buildx-multiplateforme) | ⬜ |

### Selon la gestion des données et de l'état
| # | Cas | Statut |
|---|-----|--------|
| 28 | [Named volumes pour la persistance](./28-named-volumes) | ⬜ |
| 29 | [Conteneurs éphémères pour les tests (testcontainers)](./29-testcontainers) | ⬜ |

### Selon la gestion de version des images
| # | Cas | Statut |
|---|-----|--------|
| 30 | [Image "golden" versionnée en interne](./30-image-golden-versionnee) | ⬜ |

## Progression

**0 / 30 cas complétés**

## Comment ajouter/étudier un nouveau cas

1. Créer le dossier numéroté : `NN-nom-du-cas/`
2. Écrire un exemple minimal mais fonctionnel
3. Tester réellement (`docker build`, `docker run`, `docker compose up`)
4. Ajouter un `README.md` local (contexte, commande de test, pièges)
5. Mettre à jour le statut dans le sommaire ci-dessus (⬜ → ✅)

## Philosophie

Ce repo n'est pas une liste théorique : chaque cas doit être testé et fonctionner réellement avant d'être coché. L'objectif est de construire une compréhension pratique et durable de Docker, cas par cas, plutôt que de mémoriser des concepts abstraits.