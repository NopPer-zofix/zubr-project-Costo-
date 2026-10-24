export type NipError = "empty" | "format" | "checksum";

const WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

// Убираем пробелы, дефисы и префикс PL: "PL 526-025-02-74" -> "5260250274"
export function normalizeNip(raw: string): string {
  return raw.replace(/[\s-]/g, "").replace(/^PL/i, "");
}

// Польский NIP: 10 цифр, последняя это контрольная сумма (mod 11)
export function validateNip(raw: string): NipError | null {
  const nip = normalizeNip(raw);
  if (nip === "") return "empty";
  if (!/^\d{10}$/.test(nip)) return "format";

  const sum = WEIGHTS.reduce((acc, w, i) => acc + w * Number(nip[i]), 0);
  return sum % 11 === Number(nip[9]) ? null : "checksum";
}
