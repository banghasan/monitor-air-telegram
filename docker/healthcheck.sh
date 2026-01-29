#!/bin/sh
set -e

if [ ! -r /proc/1/comm ]; then
  exit 1
fi

if [ "$(cat /proc/1/comm)" != "crond" ]; then
  exit 1
fi

if [ ! -d /app/data ]; then
  exit 1
fi
