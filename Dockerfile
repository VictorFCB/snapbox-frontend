# Etapa 1: Build da aplicação Reacta
FROM node:22-alpine3.20 as build

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir com serve
FROM node:22-alpine3.20

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build /app/build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
