"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import {
  buildInvoicesXml,
  buildJpkXml,
  buildLinesCsv,
  buildRegisterCsv,
  downloadFile,
  invoicesForMonth,
} from "@/lib/export";
import { formatDate, formatMoney } from "@/lib/format";
import { LanguageSwitch } from "./LanguageSwitch";

// Счета-моки есть только за октябрь 2026, остальные месяцы пустые
const MONTHS = ["2026-10", "2026-09", "2026-08"];

export function ExportView() {
  const { t, locale } = useLanguage();
  const { ready, nip } = useAppState();
  const router = useRouter();
  const [month, setMonth] = useState(MONTHS[0]);

  const rows = useMemo(() => invoicesForMonth(month), [month]);
  const totals = useMemo(
    () => ({
      net: rows.reduce((s, r) => s + r.net, 0),
      vat: rows.reduce((s, r) => s + r.vat, 0),
      gross: rows.reduce((s, r) => s + r.gross, 0),
    }),
    [rows],
  );

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

  const monthLabel = (m: string) =>
    new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${m}-01T00:00:00Z`));

  const empty = rows.length === 0;

  const cards = [
    {
      key: "jpk",
      title: t.exportPage.jpkTitle,
      text: t.exportPage.jpkText,
      onClick: () =>
        downloadFile(
          `JPK_V7M_${month}.xml`,
          buildJpkXml(nip, month, rows),
          "application/xml",
        ),
    },
    {
      key: "invoicesXml",
      title: t.exportPage.invoicesXmlTitle,
      text: t.exportPage.invoicesXmlText,
      onClick: () =>
        downloadFile(
          `faktury_${month}.xml`,
          buildInvoicesXml(nip, month, rows),
          "application/xml",
        ),
    },
    {
      key: "csv",
      title: t.exportPage.csvTitle,
      text: t.exportPage.csvText,
      onClick: () =>
        downloadFile(
          `rejestr_zakupow_${month}.csv`,
          buildRegisterCsv(rows),
          "text/csv;charset=utf-8",
        ),
    },
    {
      key: "linesCsv",
      title: t.exportPage.linesCsvTitle,
      text: t.exportPage.linesCsvText,
      onClick: () =>
        downloadFile(
          `pozycje_faktur_${month}.csv`,
          buildLinesCsv(rows),
          "text/csv;charset=utf-8",
        ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 sm:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-600"
        >
          {t.brand}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-foreground"
          >
            {t.common.back}
          </Link>
          <LanguageSwitch />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-8 sm:px-10">
        <div>
          <h1 className="text-3xl font-bold">{t.exportPage.title}</h1>
          <p className="mt-1 text-neutral-500">{t.exportPage.subtitle}</p>
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {t.exportPage.draftNote}
        </p>

        <div>
          <label htmlFor="month" className="mb-1.5 block text-sm font-medium">
            {t.exportPage.month}
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-background px-4 py-2.5 dark:border-neutral-700"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.key}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800"
            >
              <div>
                <h2 className="text-lg font-bold">{card.title}</h2>
                <p className="mt-1 text-sm text-neutral-500">{card.text}</p>
              </div>
              <button
                type="button"
                onClick={card.onClick}
                disabled={empty}
                className="self-start rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.exportPage.download}
              </button>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">{t.exportPage.invoices}</h2>
          {empty ? (
            <p className="text-neutral-500">{t.exportPage.noInvoices}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t.exportPage.colNumber}</th>
                    <th className="px-4 py-3 font-medium">{t.exportPage.colDate}</th>
                    <th className="px-4 py-3 font-medium">{t.exportPage.colSupplier}</th>
                    <th className="px-4 py-3 text-right font-medium">{t.exportPage.colNet}</th>
                    <th className="px-4 py-3 text-right font-medium">{t.exportPage.colVat}</th>
                    <th className="px-4 py-3 text-right font-medium">{t.exportPage.colGross}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <Fragment key={r.number}>
                      <tr className="border-t border-neutral-200 dark:border-neutral-800">
                        <td className="px-4 py-3 font-medium">{r.number}</td>
                        <td className="px-4 py-3">{formatDate(r.issueDate, locale)}</td>
                        <td className="px-4 py-3">
                          {r.supplierName}
                          <span className="block text-xs text-neutral-500">
                            NIP {r.supplierNip} · {r.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{formatMoney(r.net, locale)}</td>
                        <td className="px-4 py-3 text-right">{formatMoney(r.vat, locale)}</td>
                        <td className="px-4 py-3 text-right">{formatMoney(r.gross, locale)}</td>
                      </tr>
                      {r.lines.map((l) => (
                        <tr
                          key={`${r.number}-${l.lp}`}
                          className="text-xs text-neutral-500"
                        >
                          <td className="py-1.5 pl-8 pr-4">{l.lp}.</td>
                          <td className="px-4 py-1.5">
                            {l.qty} {t.common.perUnit[l.unit as "kg" | "l"]} × {formatMoney(l.unitPrice, locale)}
                          </td>
                          <td className="px-4 py-1.5">
                            {l.productName} · {Math.round(l.vatRate * 100)}%
                          </td>
                          <td className="px-4 py-1.5 text-right">{formatMoney(l.net, locale)}</td>
                          <td className="px-4 py-1.5 text-right">{formatMoney(l.vat, locale)}</td>
                          <td className="px-4 py-1.5 text-right">{formatMoney(l.gross, locale)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-200 font-semibold dark:border-neutral-800">
                    <td className="px-4 py-3" colSpan={3}>
                      {t.exportPage.total}
                    </td>
                    <td className="px-4 py-3 text-right">{formatMoney(totals.net, locale)}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(totals.vat, locale)}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(totals.gross, locale)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
