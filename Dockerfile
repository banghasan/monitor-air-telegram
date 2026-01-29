FROM denoland/deno:alpine

WORKDIR /app

COPY deno.json ./
COPY . .

ENV NODE_ENV=production
ENV TZ=Asia/Jakarta

ENTRYPOINT ["/app/docker/entrypoint.sh"]
