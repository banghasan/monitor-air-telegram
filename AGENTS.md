# Repository Guidelines

## Project Structure & Module Organization

- `src/monitor.ts`: Entrypoint utama yang mengatur alur logika (orchestrator).
- `src/config.ts`: Konfigurasi terpusat dan validasi environment variables.
- `src/services/`:
  - `provider.ts`: Mengambil data dari sumber XML dan parsing.
  - `state.ts`: Membaca/menulis state ke file (`data/`).
  - `telegram.ts`: Menangani pengiriman pesan ke API Telegram.
- `src/types.ts`: Definisi tipe data (interface) yang digunakan bersama.
- `src/lib.ts`: Fungsi utilitas murni (formatting, calculation).
- `src/monitor.test.ts`: Unit test untuk helper dan logika pesan.
- `data/`: Penyimpanan runtime state (`state.json` dan `pintu_air.json`).
- `docker/`: Entrypoint dan healthcheck container.
- `deno.json`: Task dan konfigurasi Deno.

## Build, Test, and Development Commands

Gunakan Deno task berikut:

- `deno task start`: jalankan monitor sekali dengan `.env`.
- `deno task dev`: sama dengan `start` tapi `FORCE_SEND=1`.
- `deno task test`: jalankan test Deno.
- `deno task lint`: linting Deno.
- `deno task fmt`: format kode sesuai `deno fmt`.

Contoh run manual:

```
deno run --env-file=.env --allow-env --allow-net --allow-read --allow-write src/monitor.ts
```

## Coding Style & Naming Conventions

- Indentasi 2 spasi; line ending LF; trailing whitespace dihapus.
- Format resmi: `deno fmt`. Lint: `deno lint`.
- Nama file mengikuti domain: `monitor.ts`, `lib.ts`, `monitor.test.ts`.

## Testing Guidelines

- Framework: Deno test + `@std/assert`.
- Nama test gunakan deskripsi singkat di `Deno.test("...", () => {})`.
- Jalankan: `deno task test`.

## Commit & Pull Request Guidelines

- Riwayat commit menggunakan gaya Conventional Commits (`chore: ...`).
- Ikuti pola yang sama untuk perubahan baru: `feat: ...`, `fix: ...`,
  `chore: ...`.
- PR sebaiknya menyertakan ringkasan perubahan, alasan, dan langkah verifikasi
  (mis. `deno task test`).

## Configuration Tips

- `.env` tidak otomatis dibaca Deno tanpa flag `--env-file=.env` (sudah diset di
  task).
- Untuk Docker, pastikan `.env` dimount jika ingin dibaca di runtime.
