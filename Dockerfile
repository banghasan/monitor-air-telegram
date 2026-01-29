FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY . .

ENV NODE_ENV=production

ENTRYPOINT ["/app/docker/entrypoint.sh"]
