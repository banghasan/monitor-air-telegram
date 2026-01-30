export const CONFIG = {
  telegram: {
    get token() {
      return getEnv("TELEGRAM_BOT_TOKEN", true);
    },
    get chatId() {
      return getEnv("TELEGRAM_CHAT_ID", true);
    },
  },
  pintuAir: {
    url: "https://poskobanjir.dsdadki.web.id/xmldata.xml",
    get id() {
      return getEnv("PINTU_AIR_ID") || "158";
    },
  },
  files: {
    state: "./data/state.json",
    list: "./data/pintu_air.json",
  },
  flags: {
    get dryRun() {
      return getBool("DRY_RUN");
    },
    get forceSend() {
      return getBool("FORCE_SEND");
    },
  },
};

function getEnv(key: string, required = false): string {
  const value = Deno.env.get(key);
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

function getBool(key: string): boolean {
  const value = (Deno.env.get(key) ?? "").toLowerCase().trim();
  return value === "1" || value === "true" || value === "yes";
}
