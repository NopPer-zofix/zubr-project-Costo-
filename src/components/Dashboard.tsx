"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import { productById, supplierById } from "@/data/mock";
import { computeSavings } from "@/lib/savings";
import {
  formatMoney,
  formatMoneyRound,
  formatPercent,
} from "@/lib/format";
import { LanguageSwitch } from "./LanguageSwitch";
import { NotificationsSidebar, useFeed } from "./NotificationsSidebar";

export function Dashboard() {
  const { t, locale } = useLanguage();
  const { ready, nip, logout, readIds } = useAppState();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const feed = useFeed();
  const result = useMemo(() => computeSavings(), []);

  // Без подключения экономию не показываем
  useEffect(() => {
    if (ready && !nip) router.replace("/connect");
  }, [ready, nip, router]);

  if (!ready || !nip) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-500">
        {t.common.loading}
      </div>
    );
  }

  const unreadCount = feed.filter((i) => !readIds.includes(i.id)).length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 sm:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-600"
        >
          {t.brand}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-900 sm:inline">
            {t.dashboard.nipChip(nip)}
          </span>
          <LanguageSwitch />
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t.notifications.open}
            className="relative rounded-full border border-neutral-300 px-3 py-1 text-sm font-medium dark:border-neutral-700 lg:hidden"
          >
            {t.notifications.title}
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <Link
            href="/export"
            className="hidden text-sm text-neutral-500 hover:text-foreground sm:inline"
          >
            {t.common.exportNav}
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/connect");
            }}
            className="hidden text-sm text-neutral-500 hover:text-foreground sm:inline"
          >
            {t.common.logout}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <main className="min-w-0 flex-1 space-y-8 px-6 py-8 sm:px-10">
          <div>
            <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
            <p className="mt-1 text-neutral-500">{t.dashboard.periodNote}</p>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-600 p-6 text-white md:col-span-1">
              <p className="text-sm opacity-90">{t.dashboard.savingsPerMonth}</p>
              <p className="mt-2 text-4xl font-bold">
                {formatMoneyRound(result.totalSavings, locale)}
              </p>
              <p className="mt-2 text-sm opacity-90">
                {t.dashboard.savingsPerYear(
                  formatMoneyRound(result.totalSavings * 12, locale),
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <p className="text-sm text-neutral-500">{t.dashboard.spent}</p>
              <p className="mt-2 text-3xl font-bold">
                {formatMoneyRound(result.totalSpend, locale)}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <p className="text-sm text-neutral-500">{t.dashboard.percent}</p>
              <p className="mt-2 text-3xl font-bold">
                {formatPercent(result.percent, locale)}
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">{t.dashboard.tableTitle}</h2>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      {t.dashboard.colProduct}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t.dashboard.colYouPay}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t.dashboard.colBest}
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      {t.dashboard.colSavings}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((line) => {
                    const product = productById(line.productId);
                    const unit = t.common.perUnit[product.unit];
                    const best = line.savings > 0;
                    return (
                      <tr
                        key={line.productId}
                        className="border-t border-neutral-200 dark:border-neutral-800"
                      >
                        <td className="px-4 py-3">
                          <span className="block font-medium">
                            {product.name[locale]}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {t.dashboard.qty(line.qty, unit)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="block">
                            {formatMoney(line.avgPaid, locale)}/{unit}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {supplierById(line.paidSupplierId).name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {best ? (
                            <>
                              <span className="block">
                                {formatMoney(line.bestPrice, locale)}/{unit}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {supplierById(line.bestSupplierId).name}
                              </span>
                            </>
                          ) : (
                            <span className="text-neutral-500">
                              {t.dashboard.alreadyBest}
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            best ? "text-emerald-700 dark:text-emerald-400" : ""
                          }`}
                        >
                          {best ? formatMoney(line.savings, locale) : "0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <NotificationsSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
