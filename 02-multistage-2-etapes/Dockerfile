# Cas 02 - Multi-stage (2 étapes)
# Étape 1 : "builder" — contient Node, les devDependencies, et compile l'app.
# Étape 2 : "runtime" — image finale légère, ne contient QUE les fichiers statiques buildés.
# Le résultat : l'image finale ne contient ni Node, ni les devDependencies, ni les sources.

# ---- Étape 1 : build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build
# Résultat : un dossier /app/dist contenant les fichiers statiques (html, js, css)

# ---- Étape 2 : runtime ----
FROM nginx:alpine AS runtime

# On copie uniquement le résultat du build depuis l'étape précédente,
# rien d'autre (pas de node_modules, pas de sources, pas de Node lui-même).
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]