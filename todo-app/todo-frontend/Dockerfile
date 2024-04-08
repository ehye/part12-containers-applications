# run tests
FROM node:20 as test-stage

WORKDIR /usr/src/app

COPY . .

ENV VITE_BACKEND_URL=http://localhost:3000/

RUN npm install

RUN npm run test

RUN npm run build

RUN npm install -g serve

CMD ["serve", "dist"]
