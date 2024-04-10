FROM node:20 AS base

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "dev", "--", "--host"]
