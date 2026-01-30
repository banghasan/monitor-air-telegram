import { CONFIG } from "./config.ts";
import { buildMessage, cleanStatus, toCm } from "./lib.ts";
import { fetchGateData } from "./services/provider.ts";
import { readState, writeGateList, writeState } from "./services/state.ts";
import { TelegramService } from "./services/telegram.ts";

async function main() {
  // 1. Fetch Data
  const { target: data, list } = await fetchGateData();

  // 2. Save complete list (for reference/debugging)
  await writeGateList(list);

  if (!data) {
    throw new Error(`Record with ID_PINTU_AIR=${CONFIG.pintuAir.id} not found`);
  }

  // 3. Prepare Logic
  const message = buildMessage(data);
  const currentStatus = cleanStatus(data.status);
  const tinggiCm = toCm(data.tinggi);
  const previous = await readState();

  const forceSend = CONFIG.flags.forceSend;
  // If we have previous state, check for change.
  // If no previous state, we generally don't alert unless forced.
  const statusChanged = !!previous && previous.status !== currentStatus;
  const shouldSend = forceSend || statusChanged;

  // 4. Handle First Run (No Previous State)
  if (!previous) {
    if (!shouldSend) {
      await writeState(currentStatus);
      console.log(
        `State initialized with status: ${currentStatus} (TMA ${tinggiCm} cm)`,
      );
      return;
    }
  }

  // 5. Check if we need to act
  if (!shouldSend) {
    console.log(`No status change: ${currentStatus} (TMA ${tinggiCm} cm)`);
    return;
  }

  // 6. Send Notification (or Dry Run)
  if (CONFIG.flags.dryRun) {
    console.log("DRY_RUN enabled, Telegram message skipped:");
    console.log(message);
  } else {
    const telegram = new TelegramService(
      CONFIG.telegram.token,
      CONFIG.telegram.chatId,
    );
    await telegram.sendMessage(message);
  }

  // 7. Update State
  await writeState(currentStatus);

  // 8. Log Outcome
  if (!previous) {
    console.log(
      `Force send without previous state: ${currentStatus} (TMA ${tinggiCm} cm)`,
    );
  } else if (forceSend) {
    console.log(
      `Force send: ${previous.status} -> ${currentStatus} (TMA ${tinggiCm} cm)`,
    );
  } else {
    console.log(
      `Status changed: ${previous.status} -> ${currentStatus} (TMA ${tinggiCm} cm)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
