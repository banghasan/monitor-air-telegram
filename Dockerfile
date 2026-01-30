FROM denoland/deno:alpine

WORKDIR /app

COPY deno.json ./
COPY . .

ENV TZ=Asia/Jakarta
RUN apk add --no-cache tzdata && \
  ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
  echo $TZ > /etc/timezone

RUN chmod +x /app/docker/entrypoint.sh /app/docker/healthcheck.sh /app/docker/cron.sh

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD /app/docker/healthcheck.sh

ENTRYPOINT ["/app/docker/entrypoint.sh"]
