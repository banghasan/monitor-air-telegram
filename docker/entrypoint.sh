#!/bin/sh
set -e

CRON_SCHEDULE="${CRON_SCHEDULE:-}"
CRON_EVERY_MINUTES="${CRON_EVERY_MINUTES:-}"
TZ="${TZ:-Asia/Jakarta}"
export TZ

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

CRON_COMMAND="/app/docker/cron.sh"

mkdir -p /app/data

{
  echo "SHELL=/bin/sh"
  echo "PATH=/usr/local/bin:/usr/bin:/bin"
  echo "${CRON_SCHEDULE} /bin/sh -c '${CRON_COMMAND}' >> /proc/1/fd/1 2>&1"
} > /etc/crontabs/root
echo "Cron schedule: ${CRON_SCHEDULE}"

exec crond -f -l 0 -L /dev/null
