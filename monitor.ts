const XML_URL = "https://poskobanjir.dsdadki.web.id/xmldata.xml";
const SOURCE_URL = "https://poskobanjir.dsdadki.web.id";
const DEFAULT_PINTU_AIR_ID = "158";
const STATE_PATH = "./state.json";
const LIST_PATH = "./pintu_air.json";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function isDryRun(): boolean {
  const raw = (process.env.DRY_RUN ?? "").toLowerCase().trim();
  return raw === "1" || raw === "true" || raw === "yes";
}

function isForceSend(): boolean {
  const raw = (process.env.FORCE_SEND ?? "").toLowerCase().trim();
  return raw === "1" || raw === "true" || raw === "yes";
}

function getPintuAirId(): string {
  const raw = (process.env.PINTU_AIR_ID ?? "").trim();
  return raw || DEFAULT_PINTU_AIR_ID;
}

function extractTag(xmlBlock: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = xmlBlock.match(re);
  return match?.[1]?.trim() ?? "";
}

function cleanStatus(status: string): string {
  return status.replace(/^Status\s*:\s*/i, "").trim();
}

function toCm(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / 10);
}

function formatJakarta(dateIso: string): string {
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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function readState(): Promise<{ status: string } | null> {
  try {
    const file = Bun.file(STATE_PATH);
    if (!(await file.exists())) return null;
    const json = await file.text();
    const data = JSON.parse(json);
    if (typeof data?.status === "string") {
      return { status: data.status };
    }
    return null;
  } catch {
    return null;
  }
}

async function writeState(status: string): Promise<void> {
  await Bun.write(STATE_PATH, JSON.stringify({ status }, null, 2));
}

async function writeList(list: Array<Record<string, string>>): Promise<void> {
  await Bun.write(LIST_PATH, JSON.stringify(list, null, 2));
}

function buildMessage(record: {
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

  const mapsUrl = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`;

  return [
    `<b>PEMANTAUAN TINGGI MUKA AIR (TMA)</b>`,
    `Sumber : <a href="${SOURCE_URL}">Posko Banjir DKI Jakarta</a>`,
    "",
    `🔰 <a href="${mapsUrl}">${escapeHtml(record.name)}</a>`,
    `  ├  ⏰ <code>${escapeHtml(dateStr)}</code>`,
    `  ├  ${icon} Ketinggian <code>${tinggiCm}</code> cm`,
    `  └  🖐🏼 Status : <b>${escapeHtml(status)}</b>`,
    "",
    "📑 Keterangan:",
    `  ├  Siaga 1: &gt; <code>${siaga1}</code> cm`,
    `  ├  Siaga 2: &gt; <code>${siaga2}</code> cm`,
    `  ├  Siaga 3: &gt; <code>${siaga3}</code> cm`,
    `  └  Normal &lt; <code>${siaga3}</code> cm`,
    "",
    "🔖 Legenda:",
    " ├ 🔺 naik",
    " └ ⤵️ turun",
  ].join("\n");
}

async function sendTelegram(message: string): Promise<void> {
  const token = getEnv("TELEGRAM_BOT_TOKEN");
  const chatId = getEnv("TELEGRAM_CHAT_ID");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram API error: ${res.status} ${text}`);
  }
}

async function main() {
  const response = await fetch(XML_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.status}`);
  }

  const xml = await response.text();
  const blocks = xml.matchAll(
    /<SP_GET_LAST_STATUS_PINTU_AIR>([\s\S]*?)<\/SP_GET_LAST_STATUS_PINTU_AIR>/gi,
  );
  const pintuAirId = getPintuAirId();
  let recordBlock = "";
  const list: Array<Record<string, string>> = [];
  for (const match of blocks) {
    const block = match[1] ?? "";
    const id = extractTag(block, "ID_PINTU_AIR");
    if (id) {
      list.push({
        id,
        name: extractTag(block, "NAMA_PINTU_AIR"),
        lokasi: extractTag(block, "LOKASI"),
        latitude: extractTag(block, "LATITUDE"),
        longitude: extractTag(block, "LONGITUDE"),
      });
    }
    if (id === pintuAirId) {
      recordBlock = block;
    }
  }

  if (!recordBlock) {
    await writeList(list);
    throw new Error(`Record with ID_PINTU_AIR=${pintuAirId} not found`);
  }

  const data = {
    name: extractTag(recordBlock, "NAMA_PINTU_AIR"),
    latitude: extractTag(recordBlock, "LATITUDE"),
    longitude: extractTag(recordBlock, "LONGITUDE"),
    tanggal: extractTag(recordBlock, "TANGGAL"),
    tinggi: extractTag(recordBlock, "TINGGI_AIR"),
    tinggiSebelumnya: extractTag(recordBlock, "TINGGI_AIR_SEBELUMNYA"),
    status: extractTag(recordBlock, "STATUS_SIAGA"),
    siaga1: extractTag(recordBlock, "SIAGA1"),
    siaga2: extractTag(recordBlock, "SIAGA2"),
    siaga3: extractTag(recordBlock, "SIAGA3"),
  };

  await writeList(list);

  const message = buildMessage(data);
  console.log("=== OUTPUT LENGKAP ===");
  console.log(message);
  console.log("");
  console.log("=== DATA RAW ===");
  console.log(JSON.stringify({ pintuAirId, ...data }, null, 2));

  const currentStatus = cleanStatus(data.status);
  const previous = await readState();
  const forceSend = isForceSend();
  const shouldSend =
    forceSend || (!!previous && previous.status !== currentStatus);

  if (!previous) {
    if (!shouldSend) {
      await writeState(currentStatus);
      console.log(`State initialized with status: ${currentStatus}`);
      return;
    }
  }

  if (!shouldSend) {
    console.log(`No status change: ${currentStatus}`);
    return;
  }

  if (isDryRun()) {
    console.log("DRY_RUN enabled, Telegram message skipped:");
    console.log(message);
  } else {
    await sendTelegram(message);
  }
  await writeState(currentStatus);
  if (!previous) {
    console.log(`Force send without previous state: ${currentStatus}`);
  } else if (forceSend) {
    console.log(`Force send: ${previous.status} -> ${currentStatus}`);
  } else {
    console.log(`Status changed: ${previous.status} -> ${currentStatus}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
