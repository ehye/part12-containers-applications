FROM node:20-slim

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm ci

ENV DEBUG=playground:*

USER node

CMD [ "node", "index.js" ]