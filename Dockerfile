FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY . .

ENV NODE_ENV=production
ENV TZ=Asia/Jakarta

ENTRYPOINT ["/app/docker/entrypoint.sh"]
