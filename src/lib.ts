import { GateData } from "./types.ts";

const SOURCE_URL = "https://poskobanjir.dsdadki.web.id";

export function extractTag(xmlBlock: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = xmlBlock.match(re);
  return match?.[1]?.trim() ?? "";
}

export function cleanStatus(status: string): string {
  return status.replace(/^Status\s*:\s*/i, "").trim();
}

export function toCm(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / 10);
}

export function formatJakarta(dateIso: string): string {
  const date = new Date(dateIso);
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  return `${day} ${month} ${year} ${hour}:${minute}:${second} WIB`;
}

export function escapeMarkdownV2(input: string): string {
  return input.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

function escapeMarkdownUrl(input: string): string {
  return input.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

function escapeMarkdownBasic(input: string): string {
  return input.replace(/[_*\[\]()]/g, "\\$&");
}

export function buildMessageTelegram(record: GateData): string {
  const tinggiCm = toCm(record.tinggi);
  const tinggiSebelumnyaCm = toCm(record.tinggiSebelumnya);
  const icon = tinggiCm > tinggiSebelumnyaCm ? "🔺" : "⤵️";
  const dateStr = formatJakarta(record.tanggal);
  const status = cleanStatus(record.status);
  const siaga1 = toCm(record.siaga1);
  const siaga2 = toCm(record.siaga2);
  const siaga3 = toCm(record.siaga3);

  const mapsUrl =
    `https://www.google.com/maps?q=${record.latitude},${record.longitude}`;

  return [
    `👀 *${escapeMarkdownV2("TINGGI MUKA AIR (TMA)")}*`,
    `📍 Sumber : [${escapeMarkdownV2("Posko Banjir DKI Jakarta")}](${
      escapeMarkdownUrl(SOURCE_URL)
    })`,
    "",
    `🔰 [${escapeMarkdownV2(record.name)}](${escapeMarkdownUrl(mapsUrl)})`,
    `  ├  ⏰ \`${escapeMarkdownV2(dateStr)}\``,
    `  ├  ${icon} Ketinggian \`${tinggiCm}\` cm`,
    `  └  🖐🏼 Status : *${escapeMarkdownV2(status)}*`,
    "",
    "📑 *Keterangan*:",
    `  ├  ${escapeMarkdownV2("Siaga 1")}: \\> \`${siaga1}\` cm`,
    `  ├  ${escapeMarkdownV2("Siaga 2")}: \\> \`${siaga2}\` cm`,
    `  ├  ${escapeMarkdownV2("Siaga 3")}: \\> \`${siaga3}\` cm`,
    `  └  ${escapeMarkdownV2("Normal")} < \`${siaga3}\` cm`,
    "",
    "🔖 *Legenda:*",
    " ├ 🔺 naik",
    " └ ⤵️ turun",
  ].join("\n");
}

export function buildMessageNtfy(record: GateData): string {
  const tinggiCm = toCm(record.tinggi);
  const tinggiSebelumnyaCm = toCm(record.tinggiSebelumnya);
  const icon = tinggiCm > tinggiSebelumnyaCm ? "🔺" : "⤵️";
  const dateStr = formatJakarta(record.tanggal);
  const status = cleanStatus(record.status);
  const siaga1 = toCm(record.siaga1);
  const siaga2 = toCm(record.siaga2);
  const siaga3 = toCm(record.siaga3);

  const mapsUrl =
    `https://www.google.com/maps?q=${record.latitude},${record.longitude}`;

  return [
    `**${escapeMarkdownBasic("TINGGI MUKA AIR (TMA)")}**`,
    `📍 Sumber : [${
      escapeMarkdownBasic("Posko Banjir DKI Jakarta")
    }](${SOURCE_URL})`,
    "",
    `🔰 [${escapeMarkdownBasic(record.name)}](${mapsUrl})`,
    `  ├  ⏰ \`${escapeMarkdownBasic(dateStr)}\``,
    `  ├  ${icon} Ketinggian \`${tinggiCm}\` cm`,
    `  └  🖐🏼 Status : **${escapeMarkdownBasic(status)}**`,
    "",
    "**Keterangan**:",
    `  ├  ${escapeMarkdownBasic("Siaga 1")}: > \`${siaga1}\` cm`,
    `  ├  ${escapeMarkdownBasic("Siaga 2")}: > \`${siaga2}\` cm`,
    `  ├  ${escapeMarkdownBasic("Siaga 3")}: > \`${siaga3}\` cm`,
    `  └  ${escapeMarkdownBasic("Normal")} < \`${siaga3}\` cm`,
    "",
    "**Legenda:**",
    " ├ 🔺 naik",
    " └ ⤵️ turun",
  ].join("\n");
}
