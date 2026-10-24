"use client";

import { Fragment, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supplierById } from "@/data/mock";
import { summarize, type DayStats } from "@/lib/days";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatMoneyRound,
} from "@/lib/format";
import { DUR, EASE, EASE_ENTER, EASE_EXIT, rise } from "@/lib/motion";

const BAR_STEP = 0.02; // волна по столбикам, 20 мс (21 столбик укладывается в 0,45 с)
const ROW_STEP = 0.03;

// Значение, которое плавно меняется при смене периода
function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <p className="text-sm text-neutral-500">{label}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: DUR.standard, ease: EASE_ENTER },
          }}
          exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE_EXIT } }}
          className="mt-1.5 text-2xl font-bold"
        >
          {value}
        </motion.p>
      </AnimatePresence>
      {note && <p className="mt-1 text-xs text-neutral-500">{note}</p>}
    </div>
  );
}

export function WorkingDays({
  days,
  selected,
  onSelect,
}: {
  days: DayStats[];
  selected: string | null;
  onSelect: (date: string | null) => void;
}) {
  const { t, locale } = useLanguage();
  const intl = locale === "ru" ? "ru-RU" : "en-GB";

  const scope = useMemo(
    () => (selected ? days.filter((d) => d.date === selected) : days),
    [days, selected],
  );
  const summary = useMemo(() => summarize(scope), [scope]);
  const allSummary = useMemo(() => summarize(days), [days]);
  const hasOpenDay = days.some((d) => d.status === "open");
  const maxGross = Math.max(...days.map((d) => d.gross), 1);

  const weekday = (iso: string) =>
    new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" }).format(
      new Date(`${iso}T00:00:00Z`),
    );

  if (days.every((d) => d.invoiceCount === 0)) {
    return (
      <motion.section {...rise(0.3)}>
        <h2 className="mb-3 text-xl font-bold">{t.exportPage.daysTitle}</h2>
        <p className="text-neutral-500">{t.exportPage.noData}</p>
      </motion.section>
    );
  }

  const supplierNames = (ids: string[]) => {
    const names = ids.map((id) => supplierById(id).name);
    return names.length <= 1
      ? (names[0] ?? "")
      : t.exportPage.suppliersMore(names[0], names.length - 1);
  };

  return (
    <motion.section {...rise(0.3)} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t.exportPage.daysTitle}</h2>
          <p className="mt-1 max-w-xl text-sm text-neutral-500">
            {t.exportPage.daysSubtitle}
          </p>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            {t.exportPage.autoCloseNote}{" "}
            <span className="font-medium text-foreground">
              {t.exportPage.closedDaysOf(
                allSummary.closedDays,
                allSummary.days,
              )}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={selected === null}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
            selected === null
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          }`}
        >
          {t.exportPage.wholeMonth}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t.exportPage.statInvoices}
          value={String(summary.invoiceCount)}
          note={t.exportPage.statItems(summary.itemCount)}
        />
        <Stat
          label={t.exportPage.statGross}
          value={formatMoneyRound(summary.gross, locale)}
          note={t.exportPage.statNetVat(
            formatMoneyRound(summary.net, locale),
            formatMoneyRound(summary.vat, locale),
          )}
        />
        <Stat
          label={t.exportPage.statSavings}
          value={formatMoneyRound(summary.savings, locale)}
        />
        <Stat
          label={t.exportPage.statAvg}
          value={formatMoneyRound(summary.avgGrossPerActiveDay, locale)}
          note={
            selected
              ? undefined
              : summary.busiestDate
                ? `${t.exportPage.statActiveDays(summary.activeDays, summary.days)}. ${t.exportPage.statBusiest(formatDate(summary.busiestDate, locale))}`
                : undefined
          }
        />
      </div>

      <figure className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <figcaption className="mb-4 text-sm font-medium">
          {t.exportPage.chartTitle}
        </figcaption>
        <div
          className="flex h-36 items-end gap-1"
          role="group"
          aria-label={t.exportPage.chartTitle}
        >
          {days.map((day, i) => {
            const active = selected === day.date;
            const height = Math.max((day.gross / maxGross) * 100, 3);
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelect(active ? null : day.date)}
                aria-pressed={active}
                aria-label={`${formatDate(day.date, locale)}: ${formatMoney(day.gross, locale)}`}
                title={`${formatDate(day.date, locale)}: ${formatMoney(day.gross, locale)}`}
                className="group flex h-full flex-1 flex-col justify-end"
              >
                <motion.span
                  className={`block w-full origin-bottom rounded-t-sm transition-colors duration-150 ${
                    active
                      ? "bg-emerald-600"
                      : day.status === "open"
                        ? "bg-amber-400 group-hover:bg-amber-500"
                        : selected
                        ? "bg-neutral-200 group-hover:bg-emerald-500/60 dark:bg-neutral-800"
                        : "bg-neutral-300 group-hover:bg-emerald-500/60 dark:bg-neutral-700"
                  }`}
                  style={{ height: `${height}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: DUR.slow,
                    delay: 0.45 + i * BAR_STEP,
                    ease: EASE,
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-1 text-[10px] text-neutral-500">
          {days.map((day) => (
            <span key={day.date} className="flex-1 text-center">
              {Number(day.date.slice(8))}
            </span>
          ))}
        </div>
        {hasOpenDay && (
          <p className="mt-3 text-xs text-neutral-500">
            {t.exportPage.legendOpen}
          </p>
        )}
      </figure>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 font-medium">{t.exportPage.colDay}</th>
              <th className="px-4 py-3 font-medium">{t.exportPage.colStatus}</th>
              <th className="px-4 py-3 font-medium">{t.exportPage.colInvoicesCount}</th>
              <th className="px-4 py-3 font-medium">{t.exportPage.colItemsCount}</th>
              <th className="px-4 py-3 font-medium">{t.exportPage.colSuppliers}</th>
              <th className="px-4 py-3 text-right font-medium">{t.exportPage.colNet}</th>
              <th className="px-4 py-3 text-right font-medium">{t.exportPage.colVat}</th>
              <th className="px-4 py-3 text-right font-medium">{t.exportPage.colGross}</th>
              <th className="px-4 py-3 text-right font-medium">{t.exportPage.colSavings}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, i) => {
              const open = selected === day.date;
              const hasData = day.invoiceCount > 0;
              return (
                <Fragment key={day.date}>
                  <motion.tr
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: DUR.standard,
                      delay: 0.7 + Math.min(i, 10) * ROW_STEP,
                      ease: EASE_ENTER,
                    }}
                    onClick={() => hasData && onSelect(open ? null : day.date)}
                    className={`border-t border-neutral-200 transition-colors duration-150 dark:border-neutral-800 ${
                      hasData ? "cursor-pointer" : "text-neutral-400"
                    } ${
                      open
                        ? "bg-emerald-50 dark:bg-emerald-950/40"
                        : hasData
                          ? "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      <button
                        type="button"
                        aria-expanded={open}
                        disabled={!hasData}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(open ? null : day.date);
                        }}
                        className="text-left"
                      >
                        <span className="mr-2 inline-block w-8 text-xs uppercase text-neutral-500">
                          {weekday(day.date)}
                        </span>
                        {formatDate(day.date, locale)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          day.status === "closed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            day.status === "closed" ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                        />
                        {day.status === "closed"
                          ? t.exportPage.statusClosed
                          : t.exportPage.statusOpen}
                      </span>
                    </td>
                    <td className="px-4 py-3">{day.invoiceCount}</td>
                    <td className="px-4 py-3">{day.itemCount}</td>
                    <td className="px-4 py-3">{supplierNames(day.supplierIds)}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(day.net, locale)}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(day.vat, locale)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatMoney(day.gross, locale)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400">
                      {day.savings > 0 ? formatMoney(day.savings, locale) : "0"}
                    </td>
                  </motion.tr>

                  <AnimatePresence initial={false}>
                    {open && (
                      <tr key={`${day.date}-detail`}>
                        <td colSpan={9} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                              transition: { duration: DUR.standard, ease: EASE },
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                              transition: { duration: DUR.quick, ease: EASE_EXIT },
                            }}
                            className="overflow-hidden bg-neutral-50 dark:bg-neutral-900/50"
                          >
                            <div className="space-y-4 px-4 py-4">
                              <p className="text-xs text-neutral-500">
                                {day.status === "closed" && day.closedAt ? (
                                  <>
                                    {t.exportPage.closedAtLine(
                                      formatDateTime(day.closedAt, locale),
                                    )}
                                    <span className="mt-1 block break-all font-mono">
                                      {t.exportPage.checksumLabel}: {day.checksum}
                                    </span>
                                  </>
                                ) : (
                                  t.exportPage.openLine
                                )}
                              </p>
                              {day.invoices.map((inv) => (
                                <div key={inv.number}>
                                  <p className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-medium">
                                    <span>
                                      {inv.number} · {inv.supplierName}
                                      <span className="ml-2 text-xs font-normal text-neutral-500">
                                        NIP {inv.supplierNip} · {inv.paymentMethod}
                                      </span>
                                    </span>
                                    <span>{formatMoney(inv.gross, locale)}</span>
                                  </p>
                                  <ul className="mt-1.5 space-y-0.5 text-xs text-neutral-500">
                                    {inv.lines.map((l) => (
                                      <li
                                        key={l.lp}
                                        className="flex justify-between gap-3"
                                      >
                                        <span>
                                          {l.lp}. {l.productName} · {l.qty}{" "}
                                          {t.common.perUnit[l.unit as "kg" | "l"]} ×{" "}
                                          {formatMoney(l.unitPrice, locale)} ·{" "}
                                          {Math.round(l.vatRate * 100)}%
                                        </span>
                                        <span>{formatMoney(l.gross, locale)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
