# Cas 03 - Multi-stage (3+ étapes : deps → build → test → runtime)
# Chaque étape a une responsabilité unique et isolée.
# Si l'étape "test" échoue, tout le build Docker échoue : impossible
# de produire une image finale avec du code cassé.

# ---- Étape 1 : deps ----
# Installe TOUTES les dépendances (dev incluses), une seule fois.
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json .
RUN npm install

# ---- Étape 2 : build ----
# Réutilise les deps déjà installées, compile le TypeScript en JS.
FROM deps AS build

WORKDIR /app
COPY . .
RUN npm run build
# Résultat : /app/dist contient le JS compilé (server.js, math.js, test/math.test.js)

# ---- Étape 3 : test ----
# Réutilise le résultat du build, exécute les tests sur le JS compilé.
# RUN échoue si les tests échouent => le build entier s'arrête ici.
FROM build AS test

RUN npm test

# ---- Étape 4 : runtime ----
# Image finale : uniquement les dépendances de PROD + le JS compilé.
# Ni TypeScript, ni les devDependencies, ni les fichiers de test ne sont présents.
FROM node:20-alpine AS runtime

WORKDIR /app
COPY package.json .
RUN npm install --production

# On copie uniquement le dossier dist depuis l'étape "test" (qui a hérité du build).
# Utiliser --from=test (et pas --from=build) garantit qu'on ne copie
# jamais un artefact qui n'a pas passé les tests.
COPY --from=test /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/server.js"]