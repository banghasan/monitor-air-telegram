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

  return `${day} ${month} ${year} pukul ${hour}.${minute}.${second} WIB`;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildMessage(record: {
  name: string;
  latitude: string;
  longitude: string;
  tanggal: string;
  tinggi: string;
  tinggiSebelumnya: string;
  status: string;
  siaga1: string;
  siaga2: string;
  siaga3: string;
}): string {
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
    `👀 <b>PEMANTAUAN TINGGI MUKA AIR (TMA)</b>`,
    `📍 Sumber : <a href="${SOURCE_URL}">Posko Banjir DKI Jakarta</a>`,
    "",
    `🔰 <a href="${mapsUrl}">${escapeHtml(record.name)}</a>`,
    `  ├  ⏰ <code>${escapeHtml(dateStr)}</code>`,
    `  ├  ${icon} Ketinggian <code>${tinggiCm}</code> cm`,
    `  └  🖐🏼 Status : <b>${escapeHtml(status)}</b>`,
    "",
    "📑 <b>Keterangan</b>:",
    `  ├  Siaga 1: &gt; <code>${siaga1}</code> cm`,
    `  ├  Siaga 2: &gt; <code>${siaga2}</code> cm`,
    `  ├  Siaga 3: &gt; <code>${siaga3}</code> cm`,
    `  └  Normal &lt; <code>${siaga3}</code> cm`,
    "",
    "🔖 <b>Legenda:</b>",
    " ├ 🔺 naik",
    " └ ⤵️ turun",
  ].join("\n");
}
