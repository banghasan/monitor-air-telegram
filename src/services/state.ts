import { CONFIG } from "../config.ts";
import { GateRecord, MonitorState } from "../types.ts";

const DATA_DIR = "data";

async function ensureDataDir(): Promise<void> {
  await Deno.mkdir(DATA_DIR, { recursive: true });
}

export async function readState(): Promise<MonitorState | null> {
  try {
    const json = await Deno.readTextFile(CONFIG.files.state);
    const data = JSON.parse(json);
    if (data && typeof data.status === "string") {
      return { status: data.status };
    }
    return null;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return null;
    }
    // If JSON is corrupted or other read errors, we treat it as no state
    // but logging it might be useful in a real app.
    return null;
  }
}

export async function writeState(status: string): Promise<void> {
  await ensureDataDir();
  const state: MonitorState = { status };
  await Deno.writeTextFile(CONFIG.files.state, JSON.stringify(state, null, 2));
}

export async function writeGateList(list: GateRecord[]): Promise<void> {
  await ensureDataDir();
  await Deno.writeTextFile(CONFIG.files.list, JSON.stringify(list, null, 2));
}
