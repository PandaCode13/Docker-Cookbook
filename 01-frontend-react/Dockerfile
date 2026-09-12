# Cas 01 - Single-stage
# Tout se passe dans une seule étape : installation des dépendances,
# copie du code, et exécution. Pas de séparation build/runtime.

FROM node:20-alpine

WORKDIR /app

# On copie d'abord package.json pour profiter du cache Docker :
# si le code change mais pas les dépendances, cette étape n'est pas rejouée.
COPY package.json .
RUN npm install --production

# Copie du reste du code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]