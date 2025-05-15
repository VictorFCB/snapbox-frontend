# Etapa 1: Build da aplicação
FROM node:22-alpine3.20 as build

WORKDIR /app

# Copia os arquivos de dependência primeiro (para cache mais eficiente)
COPY ./package.json ./package-lock.json ./
RUN npm install

# Copia o restante do código
COPY ./ ./

# Gera o build da aplicação React
RUN npm run build

# Etapa 2: Servir os arquivos com 'serve'
FROM node:22-alpine3.20

WORKDIR /app

# Instala o pacote 'serve'
RUN npm install -g serve

# Copia o build da etapa anterior
COPY --from=build /app/build ./build

# Expor a porta usada pela aplicação
EXPOSE 3000

# Comando para servir a aplicação com fallback para index.html (essencial para BrowserRouter)
CMD ["serve", "-s", "build", "-l", "3000"]
