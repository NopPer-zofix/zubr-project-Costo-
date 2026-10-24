"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import {
  NEWS,
  PRICE_EVENTS,
  PRODUCTS,
  SUPPLIERS,
  productById,
  supplierById,
  type FeedItem,
} from "@/data/mock";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";

type Tab = "all" | "following";

export function useFeed(): FeedItem[] {
  const { simulated } = useAppState();
  return useMemo(
    () =>
      [...simulated, ...PRICE_EVENTS, ...NEWS].sort((a, b) =>
        a.date === b.date ? 0 : a.date < b.date ? 1 : -1,
      ),
    [simulated],
  );
}

export function NotificationsSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useLanguage();
  const {
    follows,
    toggleSupplier,
    toggleProduct,
    readIds,
    markRead,
    markAllRead,
    simulate,
  } = useAppState();
  const feed = useFeed();
  const [tab, setTab] = useState<Tab>("all");

  const items = feed.filter((item) =>
    tab === "all"
      ? true
      : item.kind === "price" &&
        (follows.suppliers.includes(item.supplierId) ||
          follows.products.includes(item.productId)),
  );
  const unreadCount = feed.filter((i) => !readIds.includes(i.id)).length;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${
      active
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
    }`;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label={t.notifications.title}
        className={`fixed inset-y-0 right-0 z-40 flex w-80 max-w-full flex-col overflow-y-auto border-l border-neutral-200 bg-background transition-transform dark:border-neutral-800 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:self-start ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {t.notifications.title}
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 lg:hidden"
          >
            {t.notifications.close}
          </button>
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <div className="inline-flex rounded-full border border-neutral-300 p-0.5 text-sm dark:border-neutral-700">
            {(["all", "following"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={tab === key}
                className={`rounded-full px-3 py-1 font-medium ${
                  tab === key
                    ? "bg-emerald-600 text-white"
                    : "text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {key === "all"
                  ? t.notifications.tabAll
                  : t.notifications.tabFollowing}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => markAllRead(feed.map((i) => i.id))}
            className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t.notifications.markAllRead}
          </button>
        </div>

        <ul className="mt-4 flex-1 space-y-1 px-3">
          {items.length === 0 && (
            <li className="px-2 py-6 text-sm text-neutral-500">
              {tab === "all"
                ? t.notifications.emptyAll
                : t.notifications.emptyFollowing}
            </li>
          )}
          {items.map((item) => {
            const unread = !readIds.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  className="flex w-full gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      unread ? "bg-emerald-600" : "bg-transparent"
                    }`}
                  />
                  <span className="min-w-0 flex-1 text-sm">
                    {item.kind === "price" ? (
                      <PriceItem item={item} />
                    ) : (
                      <>
                        <span className="block font-semibold">
                          {item.title[locale]}
                        </span>
                        <span className="mt-0.5 block text-neutral-600 dark:text-neutral-400">
                          {item.body[locale]}
                        </span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          {t.notifications.news} · {formatDate(item.date, locale)}
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="space-y-4 border-t border-neutral-200 px-5 py-5 dark:border-neutral-800">
          <h3 className="text-sm font-semibold">{t.notifications.trackTitle}</h3>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
              {t.notifications.trackSuppliers}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUPPLIERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={follows.suppliers.includes(s.id)}
                  onClick={() => toggleSupplier(s.id)}
                  className={chip(follows.suppliers.includes(s.id))}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
              {t.notifications.trackProducts}
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={follows.products.includes(p.id)}
                  onClick={() => toggleProduct(p.id)}
                  className={chip(follows.products.includes(p.id))}
                >
                  {p.name[locale]}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={simulate}
            className="w-full rounded-lg border border-dashed border-neutral-400 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            {t.notifications.simulate}
          </button>
        </div>
      </aside>
    </>
  );
}

function PriceItem({
  item,
}: {
  item: Extract<FeedItem, { kind: "price" }>;
}) {
  const { t, locale } = useLanguage();
  const supplier = supplierById(item.supplierId);
  const product = productById(item.productId);
  const up = item.newPrice > item.oldPrice;
  const change = ((item.newPrice - item.oldPrice) / item.oldPrice) * 100;
  const unit = t.common.perUnit[product.unit];

  return (
    <>
      <span className="block font-semibold">
        {(up ? t.notifications.priceUp : t.notifications.priceDown)(
          supplier.name,
          product.name[locale],
        )}
      </span>
      <span
        className={`mt-0.5 block ${
          up ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"
        }`}
      >
        {formatMoney(item.oldPrice, locale)} → {formatMoney(item.newPrice, locale)}
        /{unit} ({up ? "+" : ""}
        {formatPercent(change, locale)})
      </span>
      <span className="mt-1 block text-xs text-neutral-500">
        {formatDate(item.date, locale)}
      </span>
    </>
  );
}
