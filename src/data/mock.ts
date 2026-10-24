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

// Текущие рыночные цены (PLN за единицу): товар -> поставщик -> цена
export const OFFERS: Record<string, Record<string, number>> = {
  chicken: { s1: 19.8, s5: 17.9 },
  beef: { s1: 62.0, s5: 58.5 },
  tomato: { s2: 9.2, s5: 10.8 },
  potato: { s2: 2.4, s5: 2.1 },
  mozzarella: { s4: 29.5, s5: 31.9 },
  butter: { s4: 36.0, s5: 34.2 },
  salmon: { s3: 74.0, s5: 79.0 },
  oliveoil: { s5: 38.5, s2: 35.9 },
  flour: { s5: 3.4, s2: 3.1 },
  mushroom: { s2: 14.5, s5: 16.2 },
};

// Строки закупочных счетов за последние 30 дней
export type PurchaseLine = {
  productId: string;
  supplierId: string;
  qty: number;
  price: number;
};

export const PURCHASES: PurchaseLine[] = [
  { productId: "chicken", supplierId: "s1", qty: 120, price: 19.8 },
  { productId: "beef", supplierId: "s1", qty: 45, price: 62.0 },
  { productId: "tomato", supplierId: "s5", qty: 80, price: 10.8 },
  { productId: "potato", supplierId: "s5", qty: 200, price: 2.1 },
  { productId: "mozzarella", supplierId: "s5", qty: 60, price: 31.9 },
  { productId: "butter", supplierId: "s4", qty: 40, price: 36.0 },
  { productId: "salmon", supplierId: "s5", qty: 35, price: 79.0 },
  { productId: "oliveoil", supplierId: "s5", qty: 50, price: 38.5 },
  { productId: "flour", supplierId: "s5", qty: 150, price: 3.4 },
  { productId: "mushroom", supplierId: "s5", qty: 30, price: 16.2 },
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
const LINES_PER_INVOICE = 3;

export const SUPPLIER_NIPS: Record<string, string> = {
  s1: "9990000001",
  s2: "9990000002",
  s3: "9990000003",
  s4: "9990000004",
  s5: "9990000005",
};

const pad = (n: number) => String(n).padStart(2, "0");

// Строки закупок группируются по поставщику, до 3 позиций на один счёт
function buildInvoices(): Invoice[] {
  const bySupplier = new Map<string, InvoiceLine[]>();
  for (const p of PURCHASES) {
    const list = bySupplier.get(p.supplierId) ?? [];
    list.push({
      productId: p.productId,
      qty: p.qty,
      unitPrice: p.price,
      vatRate: VAT_RATE_BY_PRODUCT[p.productId] ?? DEFAULT_VAT_RATE,
    });
    bySupplier.set(p.supplierId, list);
  }

  const invoices: Invoice[] = [];
  for (const [supplierId, lines] of bySupplier) {
    for (let i = 0; i < lines.length; i += LINES_PER_INVOICE) {
      const n = invoices.length;
      const day = 3 + n * 4;
      invoices.push({
        number: `FV/2026/10/${String(n + 1).padStart(3, "0")}`,
        issueDate: `2026-10-${pad(day)}`,
        saleDate: `2026-10-${pad(day)}`,
        dueDate: new Date(Date.UTC(2026, 9, day + 14))
          .toISOString()
          .slice(0, 10),
        paymentMethod: n % 3 === 2 ? "gotówka" : "przelew",
        supplierId,
        lines: lines.slice(i, i + LINES_PER_INVOICE),
      });
    }
  }
  return invoices;
}

export const INVOICES: Invoice[] = buildInvoices();

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
  { kind: "price", id: "e1", supplierId: "s1", productId: "chicken", oldPrice: 18.9, newPrice: 19.8, date: "2026-10-23" },
  { kind: "price", id: "e2", supplierId: "s5", productId: "salmon", oldPrice: 76.5, newPrice: 79.0, date: "2026-10-22" },
  { kind: "price", id: "e3", supplierId: "s2", productId: "tomato", oldPrice: 10.1, newPrice: 9.2, date: "2026-10-21" },
  { kind: "price", id: "e4", supplierId: "s4", productId: "butter", oldPrice: 34.8, newPrice: 36.0, date: "2026-10-20" },
  { kind: "price", id: "e5", supplierId: "s5", productId: "oliveoil", oldPrice: 36.9, newPrice: 38.5, date: "2026-10-19" },
  { kind: "price", id: "e6", supplierId: "s3", productId: "salmon", oldPrice: 72.0, newPrice: 74.0, date: "2026-10-18" },
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
