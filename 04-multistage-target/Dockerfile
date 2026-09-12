# Cas 04 - Multi-stage avec cible (--target)
# Un seul Dockerfile définit plusieurs "cibles" nommées.
# On choisit celle à construire avec : docker build --target=<nom> .
# Si --target n'est pas précisé, Docker construit la DERNIÈRE étape du fichier (ici "prod").

# ---- Cible commune : base ----
# Contient uniquement l'installation des dépendances, réutilisée par dev et build.
FROM node:20-alpine AS base

WORKDIR /app
COPY package.json .
RUN npm install

# ---- Cible : dev ----
# Image de développement avec hot-reload, pour lancer en local avec le code monté en volume.
FROM base AS dev

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- Cible : build ----
# Compile l'app en fichiers statiques, sans être l'image finale.
FROM base AS build

COPY . .
RUN npm run build

# ---- Cible : prod (dernière étape = cible par défaut) ----
# Image de production légère, ne contient que le résultat du build, servi par nginx.
FROM nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]