#!/bin/sh
set -e

CRON_SCHEDULE="${CRON_SCHEDULE:-}"
CRON_EVERY_MINUTES="${CRON_EVERY_MINUTES:-}"

if [ -z "$CRON_SCHEDULE" ]; then
  if [ -n "$CRON_EVERY_MINUTES" ]; then
    CRON_SCHEDULE="*/${CRON_EVERY_MINUTES} * * * *"
  else
    CRON_SCHEDULE="*/5 * * * *"
  fi
fi

if [ -z "$CRON_SCHEDULE" ]; then
  echo "Missing CRON_SCHEDULE/CRON_EVERY_MINUTES"
  exit 1
fi

CRON_COMMAND="cd /app && echo \"=== CRON RUN: \\$(date -Iseconds) ===\" >> /proc/1/fd/1 2>&1 && bun run src/monitor.ts >> /proc/1/fd/1 2>&1"

mkdir -p /app/data

echo "${CRON_SCHEDULE} ${CRON_COMMAND}" > /etc/crontabs/root
echo "Cron schedule: ${CRON_SCHEDULE}"

exec crond -f -l 0 -L /dev/null
