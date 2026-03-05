# Yotago API - Node.js Express
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar código
COPY . .

# Fly.io usa PORT (por defecto 8080)
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
