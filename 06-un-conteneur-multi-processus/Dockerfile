# Cas 06 - Un seul conteneur, plusieurs processus (via supervisord)
# Deux processus tournent en même temps dans le MÊME conteneur : nginx et l'API Node.
# supervisord devient le PID 1, et lui-même lance et surveille les deux autres processus.

FROM node:20-alpine

# nginx : sert la page statique + fait proxy vers l'API
# supervisor : gère plusieurs processus dans un même conteneur
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Installation des dépendances de l'API
COPY api/package.json ./api/
RUN cd api && npm install --production

# Copie du code de l'API
COPY api/server.js ./api/

# Copie de la page statique servie par nginx
COPY public /usr/share/nginx/html

# Configuration nginx (remplace la config par défaut)
COPY nginx.conf /etc/nginx/http.d/default.conf

# Configuration supervisord
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

# supervisord devient PID 1, et lance nginx + node en sous-processus
CMD ["supervisord", "-c", "/etc/supervisord.conf"]