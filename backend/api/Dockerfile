FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/app.js"]
