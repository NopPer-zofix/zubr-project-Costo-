import { OFFERS, PURCHASES } from "@/data/mock";

export type SavingsLine = {
  productId: string;
  qty: number;
  avgPaid: number;
  spend: number;
  paidSupplierId: string;
  bestSupplierId: string;
  bestPrice: number;
  savings: number;
};

export type SavingsResult = {
  lines: SavingsLine[];
  totalSpend: number;
  totalSavings: number;
  percent: number;
};

// Экономия = (средняя цена, которую платили, минус лучшая цена на рынке) * объём
export function computeSavings(): SavingsResult {
  const byProduct = new Map<
    string,
    { qty: number; spend: number; qtyBySupplier: Map<string, number> }
  >();

  for (const line of PURCHASES) {
    const acc = byProduct.get(line.productId) ?? {
      qty: 0,
      spend: 0,
      qtyBySupplier: new Map<string, number>(),
    };
    acc.qty += line.qty;
    acc.spend += line.qty * line.price;
    acc.qtyBySupplier.set(
      line.supplierId,
      (acc.qtyBySupplier.get(line.supplierId) ?? 0) + line.qty,
    );
    byProduct.set(line.productId, acc);
  }

  const lines: SavingsLine[] = [];
  for (const [productId, acc] of byProduct) {
    const offers = Object.entries(OFFERS[productId] ?? {});
    if (offers.length === 0) continue;

    const [bestSupplierId, bestPrice] = offers.reduce((best, cur) =>
      cur[1] < best[1] ? cur : best,
    );
    const paidSupplierId = [...acc.qtyBySupplier.entries()].reduce(
      (best, cur) => (cur[1] > best[1] ? cur : best),
    )[0];
    const avgPaid = acc.spend / acc.qty;

    lines.push({
      productId,
      qty: acc.qty,
      avgPaid,
      spend: acc.spend,
      paidSupplierId,
      bestSupplierId,
      bestPrice,
      savings: Math.max(0, avgPaid - bestPrice) * acc.qty,
    });
  }

  lines.sort((a, b) => b.savings - a.savings);

  const totalSpend = lines.reduce((sum, l) => sum + l.spend, 0);
  const totalSavings = lines.reduce((sum, l) => sum + l.savings, 0);

  return {
    lines,
    totalSpend,
    totalSavings,
    percent: totalSpend > 0 ? (totalSavings / totalSpend) * 100 : 0,
  };
}
