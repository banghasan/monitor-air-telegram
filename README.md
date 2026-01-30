# Monitor Air

Script ini mengambil data dari Posko Banjir DKI Jakarta, memantau pintu air
**P.S. Angke Hulu (Baru)** (ID 158), dan mengirim notifikasi Telegram hanya jika
**STATUS_SIAGA berubah**.

![Monitor Air Screenshot](./screenshot/monitor-air.jpg)

## Struktur

- `src/monitor.ts`: entrypoint utama
- `src/lib.ts`: helper untuk parsing dan format pesan
- `src/monitor.test.ts`: test

## Prasyarat

- Deno terpasang
- Bot Telegram + Chat ID

## Konfigurasi

Buat file `.env` di folder ini:

```
TELEGRAM_BOT_TOKEN=123456:ABCDEF...
TELEGRAM_CHAT_ID=123456789
PINTU_AIR_ID=158
NTFY_SERVER=ntfy.sh
NTFY_TOPIC=monitor-air-hulu
NTFY_ENABLE=false
DRY_RUN=1
FORCE_SEND=1
```

`PINTU_AIR_ID` opsional. Default `158` (P.S. Angke Hulu).\
`NTFY_SERVER` opsional. Default `ntfy.sh`.\
`NTFY_TOPIC` opsional. Default `monitor-air-hulu`.\
`NTFY_ENABLE` opsional. Jika `true`, kirim notifikasi ke ntfy (mode `dev` tetap
mengirim ke ntfy).\
`DRY_RUN` opsional. Jika diaktifkan, script **tidak** mengirim ke Telegram/ntfy
dan hanya menulis pesan ke stdout (state tetap diperbarui).\
`FORCE_SEND` opsional. Jika diaktifkan, pesan akan dikirim **meskipun** status
tidak berubah (tetap menghormati `DRY_RUN`).

## Output tambahan

Setiap kali jalan, script akan:

- Menulis daftar pintu air ke `pintu_air.json`.
- Menampilkan output lengkap di stdout (pesan + data mentah).

## Menjalankan manual

```
deno run --allow-env --allow-net --allow-read --allow-write src/monitor.ts
```

Atau pakai tasks:

```
deno task start
deno task dev
deno task test
deno task lint
deno task fmt
```

## Menjalankan via Docker (GHCR)

1. Siapkan file `.env` seperti di atas.
2. Buat folder `data` untuk file state:

```
mkdir -p data
touch data/state.json data/pintu_air.json
```

3. Jalankan dengan Docker:

```
docker run --rm \\
  --env-file .env \\
  -e CRON_EVERY_MINUTES=5 \\
  -v $(pwd)/data:/app/data \\
  ghcr.io/banghasan/monitor-air-telegram:latest
```

Image ini menjalankan cron di dalam container.

Atau pakai docker-compose:

```
docker compose -f docker-compose.ghcr.yml up
```

Override env saat run (nilai `environment` lebih tinggi dari `env_file`):

```
TELEGRAM_CHAT_ID=123456789 DRY_RUN=1 docker compose -f docker-compose.ghcr.yml up
```

Jadwal cron di dalam container:

- `CRON_EVERY_MINUTES` untuk interval menit (default `5`)
- `CRON_SCHEDULE` untuk ekspresi cron penuh (menimpa `CRON_EVERY_MINUTES`)
- `TZ` untuk zona waktu log (default `Asia/Jakarta`)

Contoh:

```
# setiap 5 menit
CRON_EVERY_MINUTES=5 docker compose -f docker-compose.ghcr.yml up

# jam 07:00 setiap hari
CRON_SCHEDULE="0 7 * * *" docker compose -f docker-compose.ghcr.yml up
```

Catatan:

- Pertama kali dijalankan, script hanya menyimpan status awal ke `state.json`
  dan **tidak** mengirim notifikasi.
- Notifikasi hanya dikirim jika `STATUS_SIAGA` berubah pada run berikutnya.

## Lint & Test

- Lint: `deno task lint`
- Format: `deno task fmt`
- Test: `deno task test`

## Cronjob tiap 5 menit

1. Cek lokasi deno:

```
which deno
```

2. Tambahkan ke crontab (`crontab -e`):

```
*/5 * * * * /path/to/deno run --allow-env --allow-net --allow-read --allow-write /home/DATA/deno/monitor-air-telegram/src/monitor.ts >> /home/DATA/deno/monitor-air-telegram/monitor.log 2>&1
```

Ganti `/path/to/deno` sesuai output `which deno`.

## Format pesan

Pesan dikirim dengan dua format:

- Telegram memakai **MarkdownV2**.
- ntfy memakai **Markdown** (aktif jika `NTFY_ENABLE=true`).

Tampilan pesan di Telegram akan seperti:

- Judul bold
- Link sumber Posko Banjir DKI Jakarta
- Link lokasi Google Maps berdasarkan `LATITUDE` dan `LONGITUDE`
- Tanggal dalam format WIB
- Icon naik/turun berdasarkan `TINGGI_AIR` dibanding `TINGGI_AIR_SEBELUMNYA`
