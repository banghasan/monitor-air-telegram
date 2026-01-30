import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  buildMessage,
  cleanStatus,
  extractTag,
  formatJakarta,
  toCm,
} from "./lib.ts";

Deno.test("extractTag picks content", () => {
  const block = "<ID_PINTU_AIR>158</ID_PINTU_AIR><NAMA>Pintu</NAMA>";
  assertEquals(extractTag(block, "ID_PINTU_AIR"), "158");
  assertEquals(extractTag(block, "NAMA"), "Pintu");
});

Deno.test("cleanStatus removes prefix", () => {
  assertEquals(cleanStatus("Status : Siaga 3"), "Siaga 3");
  assertEquals(cleanStatus("Siaga 1"), "Siaga 1");
});

Deno.test("toCm converts millimeters to cm", () => {
  assertEquals(toCm("2201"), 220);
  assertEquals(toCm("1500"), 150);
});

Deno.test("formatJakarta formats WIB", () => {
  const input = "2026-01-29T10:55:00+07:00";
  assertEquals(formatJakarta(input), "29 Januari 2026 10:55:00 WIB");
});

Deno.test("buildMessage includes key parts and icon", () => {
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

  assertStringIncludes(message, "<b>PEMANTAUAN TINGGI MUKA AIR (TMA)</b>");
  assertStringIncludes(message, "Posko Banjir DKI Jakarta");
  assertStringIncludes(
    message,
    "https://www.google.com/maps?q=-6.218026,106.694077",
  );
  assertStringIncludes(message, "🔺 Ketinggian <code>220</code> cm");
  assertStringIncludes(message, "Status : <b>Siaga 3</b>");
  assertStringIncludes(message, "Normal &lt; <code>150</code> cm");
});
