FROM node:20-slim AS base

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

RUN npm install -g serve

CMD ["serve", "dist"]
