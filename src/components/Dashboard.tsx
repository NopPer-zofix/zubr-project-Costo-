"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import { productById, supplierById } from "@/data/mock";
import { computeSavings } from "@/lib/savings";
import {
  formatMoney,
  formatMoneyRound,
  formatPercent,
} from "@/lib/format";
import { DUR, EASE, EASE_ENTER, rise } from "@/lib/motion";
import { CountUp } from "./CountUp";
import { LanguageSwitch } from "./LanguageSwitch";
import {
  CountBadge,
  NotificationsSidebar,
  useFeed,
} from "./NotificationsSidebar";
import { NotificationToast } from "./NotificationToast";

const CARD_STEP = 0.06; // каскад карточек, 60 мс
const ROW_STEP = 0.03; // микро-каскад строк, 30 мс

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
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.standard, ease: EASE }}
        className="flex items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 sm:px-10"
      >
        <span className="text-xl font-bold tracking-tight text-emerald-600">
          {t.brand}
        </span>
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
            <CountBadge
              count={unreadCount}
              className="ml-2 px-1.5 py-0.5 text-xs"
            />
          </button>
          <Link
            href="/export"
            className="hidden text-sm text-neutral-500 transition-colors duration-150 hover:text-foreground sm:inline"
          >
            {t.common.exportNav}
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/connect");
            }}
            className="hidden text-sm text-neutral-500 transition-colors duration-150 hover:text-foreground sm:inline"
          >
            {t.common.logout}
          </button>
        </div>
      </motion.header>

      <div className="flex flex-1">
        <main className="min-w-0 flex-1 space-y-8 px-6 py-8 sm:px-10">
          <motion.div {...rise(0.05)}>
            <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
            <p className="mt-1 text-neutral-500">{t.dashboard.periodNote}</p>
          </motion.div>

          <section className="grid gap-4 md:grid-cols-3">
            {/* Главная карточка идёт первой, числа в ней растут от нуля */}
            <motion.div
              {...rise(0.15)}
              className="rounded-2xl bg-emerald-600 p-6 text-white md:col-span-1"
            >
              <p className="text-sm opacity-90">{t.dashboard.savingsPerMonth}</p>
              <p
                className="mt-2 text-4xl font-bold"
                aria-label={formatMoneyRound(result.totalSavings, locale)}
              >
                <CountUp
                  value={result.totalSavings}
                  format={(n) => formatMoneyRound(n, locale)}
                  duration={0.9}
                  delay={0.2}
                />
              </p>
              <p className="mt-2 text-sm opacity-90">
                {t.dashboard.savingsPerYear(
                  formatMoneyRound(result.totalSavings * 12, locale),
                )}
              </p>
            </motion.div>
            <motion.div
              {...rise(0.15 + CARD_STEP)}
              className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800"
            >
              <p className="text-sm text-neutral-500">{t.dashboard.spent}</p>
              <p
                className="mt-2 text-3xl font-bold"
                aria-label={formatMoneyRound(result.totalSpend, locale)}
              >
                <CountUp
                  value={result.totalSpend}
                  format={(n) => formatMoneyRound(n, locale)}
                  duration={0.8}
                  delay={0.26}
                />
              </p>
            </motion.div>
            <motion.div
              {...rise(0.15 + CARD_STEP * 2)}
              className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800"
            >
              <p className="text-sm text-neutral-500">{t.dashboard.percent}</p>
              <p
                className="mt-2 text-3xl font-bold"
                aria-label={formatPercent(result.percent, locale)}
              >
                <CountUp
                  value={result.percent}
                  format={(n) => formatPercent(n, locale)}
                  duration={0.7}
                  delay={0.32}
                />
              </p>
            </motion.div>
          </section>

          <motion.section {...rise(0.4)}>
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
                  {result.lines.map((line, i) => {
                    const product = productById(line.productId);
                    const unit = t.common.perUnit[product.unit];
                    const best = line.savings > 0;
                    return (
                      <motion.tr
                        key={line.productId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: DUR.standard,
                          delay: 0.5 + i * ROW_STEP,
                          ease: EASE_ENTER,
                        }}
                        className="border-t border-neutral-200 transition-colors duration-150 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
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
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        </main>

        <NotificationsSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      <NotificationToast />
    </div>
  );
}
