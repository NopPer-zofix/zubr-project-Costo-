import { TODAY, workingDays } from "@/data/mock";
import { sha256Text } from "./sha256";
import { invoicesForMonth, type InvoiceRow } from "./export";

const round2 = (n: number) => Math.round(n * 100) / 100;
const sum = (nums: number[]) => round2(nums.reduce((a, b) => a + b, 0));

// Статистика одного рабочего дня
export type DayStats = {
  date: string; // YYYY-MM-DD
  invoices: InvoiceRow[];
  invoiceCount: number;
  itemCount: number;
  supplierIds: string[];
  net: number;
  vat: number;
  gross: number;
  savings: number;
  // Автозакрытие: день закрывается сам в полночь после своей даты
  status: "open" | "closed";
  closedAt: string | null; // ISO, начало следующих суток
  checksum: string | null; // SHA-256 снимка дня, только у закрытых дней
};

// Итоги за период (несколько дней)
export type PeriodSummary = {
  days: number; // рабочих дней в периоде
  activeDays: number; // дней, когда были счета
  invoiceCount: number;
  itemCount: number;
  net: number;
  vat: number;
  gross: number;
  savings: number;
  avgGrossPerActiveDay: number;
  busiestDate: string | null; // день с самой большой суммой
  closedDays: number;
};

const addDay = (iso: string) =>
  new Date(new Date(`${iso}T00:00:00Z`).getTime() + 86400000).toISOString();

// Снимок дня для контрольной суммы: только юридически значимые поля,
// в фиксированном порядке, чтобы хеш был воспроизводимым
export function daySnapshot(date: string, invoices: InvoiceRow[]): string {
  return JSON.stringify({
    date,
    invoices: invoices.map((inv) => ({
      number: inv.number,
      issueDate: inv.issueDate,
      saleDate: inv.saleDate,
      dueDate: inv.dueDate,
      paymentMethod: inv.paymentMethod,
      supplierNip: inv.supplierNip,
      supplierName: inv.supplierName,
      lines: inv.lines.map((l) => ({
        productName: l.productName,
        unit: l.unit,
        qty: l.qty,
        unitPrice: l.unitPrice,
        vatRate: l.vatRate,
      })),
    })),
  });
}

// Все рабочие дни месяца (пн to сб) со статистикой. Дни без счетов тоже есть.
export function dayStatsForMonth(month: string): DayStats[] {
  const invoices = invoicesForMonth(month);

  return workingDays(month).map((date) => {
    const list = invoices.filter((inv) => inv.issueDate === date);
    // Прошедшие дни закрыты автоматически, сегодняшний открыт до полуночи
    const closed = date < TODAY;
    return {
      date,
      invoices: list,
      invoiceCount: list.length,
      itemCount: list.reduce((n, inv) => n + inv.lines.length, 0),
      supplierIds: [...new Set(list.map((inv) => inv.supplierId))],
      net: sum(list.map((inv) => inv.net)),
      vat: sum(list.map((inv) => inv.vat)),
      gross: sum(list.map((inv) => inv.gross)),
      savings: sum(list.map((inv) => inv.savings)),
      status: closed ? "closed" : "open",
      closedAt: closed ? addDay(date) : null,
      checksum: closed ? sha256Text(daySnapshot(date, list)) : null,
    };
  });
}

export function summarize(days: DayStats[]): PeriodSummary {
  const active = days.filter((d) => d.invoiceCount > 0);
  const gross = sum(days.map((d) => d.gross));
  const busiest = active.reduce<DayStats | null>(
    (best, d) => (best === null || d.gross > best.gross ? d : best),
    null,
  );

  return {
    days: days.length,
    activeDays: active.length,
    invoiceCount: days.reduce((n, d) => n + d.invoiceCount, 0),
    itemCount: days.reduce((n, d) => n + d.itemCount, 0),
    net: sum(days.map((d) => d.net)),
    vat: sum(days.map((d) => d.vat)),
    gross,
    savings: sum(days.map((d) => d.savings)),
    avgGrossPerActiveDay:
      active.length > 0 ? round2(gross / active.length) : 0,
    busiestDate: busiest?.date ?? null,
    closedDays: days.filter((d) => d.status === "closed").length,
  };
}
