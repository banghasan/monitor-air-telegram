export const CONFIG = {
  telegram: {
    get token() {
      return getEnv("TELEGRAM_BOT_TOKEN", true);
    },
    get chatId() {
      return getEnv("TELEGRAM_CHAT_ID", true);
    },
  },
  ntfy: {
    get server() {
      return getEnv("NTFY_SERVER") || "ntfy.sh";
    },
    get topic() {
      return getEnv("NTFY_TOPIC") || "monitor-air-hulu";
    },
    get enabled() {
      return getBool("NTFY_ENABLE");
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
