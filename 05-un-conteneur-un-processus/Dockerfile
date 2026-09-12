# Cas 05 - Un seul conteneur, un seul processus
# Le processus lancé par CMD devient le PID 1 du conteneur.
# C'est lui qui reçoit directement les signaux envoyés par "docker stop" (SIGTERM).

FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY . .

EXPOSE 3000

# IMPORTANT : forme "exec" (tableau JSON), pas forme "shell" (chaîne de texte).
# CMD ["node", "server.js"]  -> node devient directement PID 1, reçoit bien SIGTERM.
# CMD "node server.js"        -> un shell (/bin/sh -c) devient PID 1, et node devient
#                                un sous-processus qui NE reçoit PAS SIGTERM automatiquement.
CMD ["node", "server.js"]