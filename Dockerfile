FROM denoland/deno:alpine

WORKDIR /app

COPY deno.json ./
COPY . .

RUN chmod +x /app/docker/entrypoint.sh /app/docker/healthcheck.sh /app/docker/cron.sh

ENV NODE_ENV=production
ENV TZ=Asia/Jakarta

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD /app/docker/healthcheck.sh

ENTRYPOINT ["/app/docker/entrypoint.sh"]
