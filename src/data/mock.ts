// Моковые данные МВП. Позже заменяются данными из KSeF.

export type Localized = { ru: string; en: string };
export type Unit = "kg" | "l";

export type Supplier = { id: string; name: string };
export type Product = {
  id: string;
  name: Localized;
  namePl: string; // для юридических документов
  unit: Unit;
};

export const SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Mięsny Dwór" },
  { id: "s2", name: "Zielony Rynek" },
  { id: "s3", name: "Nordic Fish Polska" },
  { id: "s4", name: "Mleczarnia Podlaska" },
  { id: "s5", name: "Hurt-Spożywczy Plus" },
];

export const PRODUCTS: Product[] = [
  { id: "chicken", name: { ru: "Куриная грудка", en: "Chicken breast" }, namePl: "Pierś z kurczaka", unit: "kg" },
  { id: "beef", name: { ru: "Говяжья вырезка", en: "Beef sirloin" }, namePl: "Polędwica wołowa", unit: "kg" },
  { id: "tomato", name: { ru: "Помидоры", en: "Tomatoes" }, namePl: "Pomidory", unit: "kg" },
  { id: "potato", name: { ru: "Картофель", en: "Potatoes" }, namePl: "Ziemniaki", unit: "kg" },
  { id: "mozzarella", name: { ru: "Моцарелла", en: "Mozzarella" }, namePl: "Mozzarella", unit: "kg" },
  { id: "butter", name: { ru: "Масло сливочное", en: "Butter" }, namePl: "Masło", unit: "kg" },
  { id: "salmon", name: { ru: "Филе лосося", en: "Salmon fillet" }, namePl: "Filet z łososia", unit: "kg" },
  { id: "oliveoil", name: { ru: "Оливковое масло", en: "Olive oil" }, namePl: "Oliwa z oliwek", unit: "l" },
  { id: "flour", name: { ru: "Мука", en: "Flour" }, namePl: "Mąka", unit: "kg" },
  { id: "mushroom", name: { ru: "Шампиньоны", en: "Mushrooms" }, namePl: "Pieczarki", unit: "kg" },
];

// Все суммы в EUR (моки пересчитаны из PLN по условному курсу 4,25).
// Текущие рыночные цены (EUR за единицу): товар -> поставщик -> цена
export const OFFERS: Record<string, Record<string, number>> = {
  chicken: { s1: 4.66, s5: 4.21 },
  beef: { s1: 14.59, s5: 13.76 },
  tomato: { s2: 2.16, s5: 2.54 },
  potato: { s2: 0.56, s5: 0.49 },
  mozzarella: { s4: 6.94, s5: 7.51 },
  butter: { s4: 8.47, s5: 8.05 },
  salmon: { s3: 17.41, s5: 18.59 },
  oliveoil: { s5: 9.06, s2: 8.45 },
  flour: { s5: 0.8, s2: 0.73 },
  mushroom: { s2: 3.41, s5: 3.81 },
};

// Строки закупочных счетов за последние 30 дней
export type PurchaseLine = {
  productId: string;
  supplierId: string;
  qty: number;
  price: number;
};

export const PURCHASES: PurchaseLine[] = [
  { productId: "chicken", supplierId: "s1", qty: 120, price: 4.66 },
  { productId: "beef", supplierId: "s1", qty: 45, price: 14.59 },
  { productId: "tomato", supplierId: "s5", qty: 80, price: 2.54 },
  { productId: "potato", supplierId: "s5", qty: 200, price: 0.49 },
  { productId: "mozzarella", supplierId: "s5", qty: 60, price: 7.51 },
  { productId: "butter", supplierId: "s4", qty: 40, price: 8.47 },
  { productId: "salmon", supplierId: "s5", qty: 35, price: 18.59 },
  { productId: "oliveoil", supplierId: "s5", qty: 50, price: 9.06 },
  { productId: "flour", supplierId: "s5", qty: 150, price: 0.8 },
  { productId: "mushroom", supplierId: "s5", qty: 30, price: 3.81 },
];

// Счета KSeF за месяц, из которых собираются документы для бухгалтерии.
// Ставки VAT и NIP поставщиков условные, только для демо.
export type InvoiceLine = {
  productId: string;
  qty: number;
  unitPrice: number; // нетто за единицу
  vatRate: number; // 0.05 = 5%
};

export type Invoice = {
  number: string;
  issueDate: string; // дата выставления, YYYY-MM-DD
  saleDate: string; // дата поставки
  dueDate: string; // срок оплаты
  paymentMethod: "przelew" | "gotówka";
  supplierId: string;
  lines: InvoiceLine[];
};

const VAT_RATE_BY_PRODUCT: Record<string, number> = {
  oliveoil: 0.08,
  mushroom: 0.08,
};
const DEFAULT_VAT_RATE = 0.05;

export const SUPPLIER_NIPS: Record<string, string> = {
  s1: "9990000001",
  s2: "9990000002",
  s3: "9990000003",
  s4: "9990000004",
  s5: "9990000005",
};

// Последний день, за который есть данные ("сегодня" в демо)
export const TODAY = "2026-10-24";

// Дни недели поставок у каждого поставщика (0 = воскресенье, рабочие дни пн to сб)
const DELIVERY_WEEKDAYS: Record<string, number[]> = {
  s1: [1, 3, 5], // пн, ср, пт
  s2: [2, 4],
  s3: [2, 5],
  s4: [2, 5], // вт, пт
  s5: [2, 4, 6], // вт, чт, сб
};

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function daysOfMonth(month: string): Date[] {
  const [y, m] = month.split("-").map(Number);
  const days: Date[] = [];
  for (let d = new Date(Date.UTC(y, m - 1, 1)); d.getUTCMonth() === m - 1; ) {
    days.push(new Date(d));
    d = new Date(Date.UTC(y, m - 1, d.getUTCDate() + 1));
  }
  return days;
}

// Рабочие дни месяца: пн to сб, не позже TODAY
export function workingDays(month: string): string[] {
  return daysOfMonth(month)
    .filter((d) => d.getUTCDay() !== 0 && isoDate(d) <= TODAY)
    .map(isoDate);
}

// Закупки разносятся по дням поставок поставщика. Общий объём каждой позиции
// сохраняется: целая часть поровну, остаток раздаётся первым поставкам.
function buildInvoices(month: string): Invoice[] {
  const deliveries = new Map<string, string[]>();
  for (const [supplierId, weekdays] of Object.entries(DELIVERY_WEEKDAYS)) {
    deliveries.set(
      supplierId,
      daysOfMonth(month)
        .filter((d) => weekdays.includes(d.getUTCDay()) && isoDate(d) <= TODAY)
        .map(isoDate),
    );
  }

  const drafts: { date: string; supplierId: string; lines: InvoiceLine[] }[] = [];
  for (const [supplierId, dates] of deliveries) {
    const purchases = PURCHASES.filter((p) => p.supplierId === supplierId);
    if (purchases.length === 0 || dates.length === 0) continue;

    dates.forEach((date, i) => {
      const lines: InvoiceLine[] = purchases.map((p) => {
        const base = Math.floor(p.qty / dates.length);
        const extra = i < p.qty % dates.length ? 1 : 0;
        return {
          productId: p.productId,
          qty: base + extra,
          unitPrice: p.price,
          vatRate: VAT_RATE_BY_PRODUCT[p.productId] ?? DEFAULT_VAT_RATE,
        };
      });
      drafts.push({ date, supplierId, lines });
    });
  }

  drafts.sort((a, b) =>
    a.date === b.date
      ? a.supplierId.localeCompare(b.supplierId)
      : a.date.localeCompare(b.date),
  );

  const [y, m] = month.split("-");
  return drafts.map((d, n) => ({
    number: `FV/${y}/${m}/${String(n + 1).padStart(3, "0")}`,
    issueDate: d.date,
    saleDate: d.date,
    dueDate: isoDate(
      new Date(new Date(`${d.date}T00:00:00Z`).getTime() + 14 * 86400000),
    ),
    paymentMethod: n % 3 === 2 ? "gotówka" : "przelew",
    supplierId: d.supplierId,
    lines: d.lines,
  }));
}

// Данные есть только за октябрь 2026, остальные месяцы пустые
export const INVOICES: Invoice[] = buildInvoices("2026-10");

// Лента уведомлений
export type PriceEvent = {
  kind: "price";
  id: string;
  supplierId: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  date: string; // YYYY-MM-DD
};

export type NewsEvent = {
  kind: "news";
  id: string;
  title: Localized;
  body: Localized;
  date: string;
};

export type FeedItem = PriceEvent | NewsEvent;

export const PRICE_EVENTS: PriceEvent[] = [
  { kind: "price", id: "e1", supplierId: "s1", productId: "chicken", oldPrice: 4.45, newPrice: 4.66, date: "2026-10-23" },
  { kind: "price", id: "e2", supplierId: "s5", productId: "salmon", oldPrice: 18.0, newPrice: 18.59, date: "2026-10-22" },
  { kind: "price", id: "e3", supplierId: "s2", productId: "tomato", oldPrice: 2.38, newPrice: 2.16, date: "2026-10-21" },
  { kind: "price", id: "e4", supplierId: "s4", productId: "butter", oldPrice: 8.19, newPrice: 8.47, date: "2026-10-20" },
  { kind: "price", id: "e5", supplierId: "s5", productId: "oliveoil", oldPrice: 8.68, newPrice: 9.06, date: "2026-10-19" },
  { kind: "price", id: "e6", supplierId: "s3", productId: "salmon", oldPrice: 16.94, newPrice: 17.41, date: "2026-10-18" },
];

export const NEWS: NewsEvent[] = [
  {
    kind: "news",
    id: "n1",
    title: { ru: "Новое: уведомления о ценах", en: "New: price alerts" },
    body: {
      ru: "Следите за поставщиками и товарами, и мы покажем каждое изменение цены.",
      en: "Follow suppliers and products and we will show every price change.",
    },
    date: "2026-10-22",
  },
  {
    kind: "news",
    id: "n2",
    title: { ru: "Совет по закупкам", en: "Purchasing tip" },
    body: {
      ru: "Вы берёте курицу больше 100 кг в месяц. С таким объёмом можно просить скидку у поставщика.",
      en: "You buy over 100 kg of chicken a month. At that volume you can ask your supplier for a discount.",
    },
    date: "2026-10-20",
  },
  {
    kind: "news",
    id: "n3",
    title: { ru: "Скоро в Costo", en: "Coming soon to Costo" },
    body: {
      ru: "Готовим заказ у лучшего поставщика в один клик.",
      en: "We are preparing one-click ordering from the best supplier.",
    },
    date: "2026-10-17",
  },
];

export const supplierById = (id: string): Supplier =>
  SUPPLIERS.find((s) => s.id === id) ?? { id, name: id };

export const productById = (id: string): Product =>
  PRODUCTS.find((p) => p.id === id) ?? {
    id,
    name: { ru: id, en: id },
    namePl: id,
    unit: "kg",
  };
