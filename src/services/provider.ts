import { CONFIG } from "../config.ts";
import { extractTag } from "../lib.ts";
import { GateData, GateRecord } from "../types.ts";

export async function fetchGateData(): Promise<
  { target: GateData | null; list: GateRecord[] }
> {
  const response = await fetch(CONFIG.pintuAir.url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch XML: ${response.status} ${response.statusText}`,
    );
  }

  const xml = await response.text();
  const blocks = xml.matchAll(
    /<SP_GET_LAST_STATUS_PINTU_AIR>([\s\S]*?)<\/SP_GET_LAST_STATUS_PINTU_AIR>/gi,
  );

  const targetId = CONFIG.pintuAir.id;
  let targetBlock = "";
  const list: GateRecord[] = [];

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

    if (id === targetId) {
      targetBlock = block;
    }
  }

  let target: GateData | null = null;
  if (targetBlock) {
    target = {
      name: extractTag(targetBlock, "NAMA_PINTU_AIR"),
      latitude: extractTag(targetBlock, "LATITUDE"),
      longitude: extractTag(targetBlock, "LONGITUDE"),
      tanggal: extractTag(targetBlock, "TANGGAL"),
      tinggi: extractTag(targetBlock, "TINGGI_AIR"),
      tinggiSebelumnya: extractTag(targetBlock, "TINGGI_AIR_SEBELUMNYA"),
      status: extractTag(targetBlock, "STATUS_SIAGA"),
      siaga1: extractTag(targetBlock, "SIAGA1"),
      siaga2: extractTag(targetBlock, "SIAGA2"),
      siaga3: extractTag(targetBlock, "SIAGA3"),
    };
  }

  return { target, list };
}
