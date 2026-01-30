#!/bin/sh
set -e

ENV_FILE_FLAG=""
if [ -f "/app/.env" ]; then
  ENV_FILE_FLAG="--env-file=.env"
fi

cd /app
echo "[cron] $(date '+%d %B %Y %H:%M:%S WIB')"
exec deno run ${ENV_FILE_FLAG} --allow-env --allow-net --allow-read --allow-write src/monitor.ts
