"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import { dayStatsForMonth } from "@/lib/days";
import { DUR, EASE, rise } from "@/lib/motion";
import { DownloadPanel } from "./DownloadPanel";
import { LanguageSwitch } from "./LanguageSwitch";
import { WorkingDays } from "./WorkingDays";

// Счета-моки есть только за октябрь 2026, остальные месяцы пустые
const MONTHS = ["2026-10", "2026-09", "2026-08"];

export function ExportView() {
  const { t, locale } = useLanguage();
  const { ready, nip } = useAppState();
  const router = useRouter();
  const [month, setMonth] = useState(MONTHS[0]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const days = useMemo(() => dayStatsForMonth(month), [month]);

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

  return (
    <div className="flex min-h-screen flex-col">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.standard, ease: EASE }}
        className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 sm:px-10"
      >
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-emerald-600"
        >
          {t.brand}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 transition-colors duration-150 hover:text-foreground"
          >
            {t.common.back}
          </Link>
          <LanguageSwitch />
        </div>
      </motion.header>

      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-8 sm:px-10">
        <motion.div {...rise(0.05)}>
          <h1 className="text-3xl font-bold">{t.exportPage.title}</h1>
          <p className="mt-1 text-neutral-500">{t.exportPage.subtitle}</p>
        </motion.div>

        <motion.p
          {...rise(0.11)}
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          {t.exportPage.draftNote}
        </motion.p>

        <motion.div
          {...rise(0.17)}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <label htmlFor="month" className="mb-1.5 block text-sm font-medium">
              {t.exportPage.month}
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setSelectedDate(null);
              }}
              className="rounded-lg border border-neutral-300 bg-background px-4 py-2.5 dark:border-neutral-700"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-haspopup="dialog"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: DUR.quick }}
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-emerald-700"
          >
            {t.exportPage.download}
          </motion.button>
        </motion.div>

        <WorkingDays
          days={days}
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
      </main>

      <DownloadPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        nip={nip}
        month={month}
        days={days}
        selectedDate={selectedDate}
      />
    </div>
  );
}
