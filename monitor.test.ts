import { describe, expect, test } from "bun:test";
import {
  buildMessage,
  cleanStatus,
  extractTag,
  formatJakarta,
  toCm,
} from "./lib.ts";

describe("lib", () => {
  test("extractTag picks content", () => {
    const block = "<ID_PINTU_AIR>158</ID_PINTU_AIR><NAMA>Pintu</NAMA>";
    expect(extractTag(block, "ID_PINTU_AIR")).toBe("158");
    expect(extractTag(block, "NAMA")).toBe("Pintu");
  });

  test("cleanStatus removes prefix", () => {
    expect(cleanStatus("Status : Siaga 3")).toBe("Siaga 3");
    expect(cleanStatus("Siaga 1")).toBe("Siaga 1");
  });

  test("toCm converts millimeters to cm", () => {
    expect(toCm("2201")).toBe(220);
    expect(toCm("1500")).toBe(150);
  });

  test("formatJakarta formats WIB", () => {
    const input = "2026-01-29T10:55:00+07:00";
    expect(formatJakarta(input)).toBe("29 Januari 2026 pukul 10.55.00 WIB");
  });

  test("buildMessage includes key parts and icon", () => {
    const message = buildMessage({
      name: "P.S. Angke Hulu (Baru)",
      latitude: "-6.218026",
      longitude: "106.694077",
      tanggal: "2026-01-29T10:55:00+07:00",
      tinggi: "2200",
      tinggiSebelumnya: "2000",
      status: "Status : Siaga 3",
      siaga1: "3000",
      siaga2: "2500",
      siaga3: "1500",
    });

    expect(message).toContain("<b>PEMANTAUAN TINGGI MUKA AIR (TMA)</b>");
    expect(message).toContain("Posko Banjir DKI Jakarta");
    expect(message).toContain("https://www.google.com/maps?q=-6.218026,106.694077");
    expect(message).toContain("🔺 Ketinggian 220 cm");
    expect(message).toContain("Status : Siaga 3");
    expect(message).toContain("Normal &lt; 150 cm");
  });
});
