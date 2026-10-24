"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DayStats } from "@/lib/days";
import {
  DOC_KINDS,
  buildDocument,
  buildManifest,
  downloadDocuments,
  invoicesForMonth,
  type DocKind,
} from "@/lib/export";
import { formatDate } from "@/lib/format";
import { DUR, EASE, EASE_ENTER, EASE_EXIT } from "@/lib/motion";

type Mode = "day" | "range" | "month";

type Props = {
  open: boolean;
  onClose: () => void;
  nip: string;
  month: string;
  days: DayStats[];
  selectedDate: string | null;
};

// Окно открывается только по кнопке "Скачать", до этого вариантов на странице нет
export function DownloadPanel(props: Props) {
  return (
    <AnimatePresence>
      {props.open && <PanelBody key="panel" {...props} />}
    </AnimatePresence>
  );
}

function PanelBody({ onClose, nip, month, days, selectedDate }: Props) {
  const { t, locale } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Состояние создаётся при открытии, поэтому стартует с текущего выбора на странице
  const [mode, setMode] = useState<Mode>(selectedDate ? "day" : "month");
  const [from, setFrom] = useState(days[0]?.date ?? "");
  const [to, setTo] = useState(days[days.length - 1]?.date ?? "");
  const [kinds, setKinds] = useState<DocKind[]>(DOC_KINDS);
  const [withManifest, setWithManifest] = useState(true);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const range = useMemo(() => {
    if (mode === "day") return selectedDate ? [selectedDate, selectedDate] : null;
    if (mode === "range") return from <= to ? [from, to] : [to, from];
    return [days[0]?.date ?? "", days[days.length - 1]?.date ?? ""];
  }, [mode, selectedDate, from, to, days]);

  const rows = useMemo(() => {
    if (!range) return [];
    return invoicesForMonth(month).filter(
      (r) => r.issueDate >= range[0] && r.issueDate <= range[1],
    );
  }, [month, range]);

  const periodDays = useMemo(
    () =>
      range ? days.filter((d) => d.date >= range[0] && d.date <= range[1]) : [],
    [days, range],
  );
  const hasOpenDay = periodDays.some((d) => d.status === "open");

  const label =
    mode === "month" || !range
      ? month
      : range[0] === range[1]
        ? range[0]
        : `${range[0]}_${range[1]}`;

  const canDownload = rows.length > 0 && kinds.length > 0 && phase === "idle";

  const hint =
    rows.length === 0
      ? t.exportPage.panelNothing
      : kinds.length === 0
        ? t.exportPage.panelNeedFormat
        : `${t.exportPage.panelSummary(rows.length, kinds.length)}${
            kinds.length > 1 || withManifest ? ` ${t.exportPage.zipNote}` : ""
          }`;

  const docInfo: Record<DocKind, { title: string; text: string }> = {
    jpk: { title: t.exportPage.jpkTitle, text: t.exportPage.jpkText },
    invoicesXml: {
      title: t.exportPage.invoicesXmlTitle,
      text: t.exportPage.invoicesXmlText,
    },
    register: { title: t.exportPage.csvTitle, text: t.exportPage.csvText },
    lines: {
      title: t.exportPage.linesCsvTitle,
      text: t.exportPage.linesCsvText,
    },
  };

  async function onDownload() {
    if (!canDownload) return;
    setPhase("working");
    try {
      const docs = kinds.map((k) => buildDocument(k, nip, month, rows, label));
      const extra =
        withManifest && range
          ? buildManifest({
              nip,
              periodLabel: label,
              range: [range[0], range[1]],
              days: periodDays,
              docs,
              invoiceCount: rows.length,
            })
          : [];
      await downloadDocuments(docs, `costo_${label}`, extra);
      setPhase("done");
      window.setTimeout(onClose, 900);
    } catch {
      setPhase("idle");
    }
  }

  const toggleKind = (k: DocKind) =>
    setKinds((cur) =>
      cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k],
    );

  const modes: { key: Mode; text: string; disabled?: boolean }[] = [
    {
      key: "day",
      text: selectedDate
        ? t.exportPage.periodDay(formatDate(selectedDate, locale))
        : t.exportPage.periodDayNone,
      disabled: !selectedDate,
    },
    { key: "range", text: t.exportPage.periodRange },
    { key: "month", text: t.exportPage.periodMonth },
  ];

  const selectClass =
    "rounded-lg border border-neutral-300 bg-background px-3 py-2 text-sm dark:border-neutral-700";

  // Блоки внутри окна появляются каскадом по 40 мс
  const item = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.standard, delay: 0.1 + i * 0.04, ease: EASE_ENTER },
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: DUR.standard, ease: EASE } }}
        exit={{ opacity: 0, transition: { duration: DUR.quick, ease: EASE_EXIT } }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.exportPage.panelTitle}
        tabIndex={-1}
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: DUR.standard, ease: EASE_ENTER },
        }}
        exit={{
          opacity: 0,
          y: 8,
          transition: { duration: DUR.quick, ease: EASE_EXIT },
        }}
        className="relative max-h-full w-full max-w-lg space-y-6 overflow-y-auto rounded-2xl border border-neutral-200 bg-background p-6 shadow-xl outline-none dark:border-neutral-700"
      >
        <motion.div {...item(0)} className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{t.exportPage.panelTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {t.exportPage.panelClose}
          </button>
        </motion.div>

        <motion.fieldset {...item(1)} className="space-y-2">
          <legend className="mb-2 text-sm font-medium">
            {t.exportPage.panelPeriod}
          </legend>
          {modes.map((m) => (
            <label
              key={m.key}
              className={`flex items-center gap-3 text-sm ${
                m.disabled ? "text-neutral-400" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="period"
                checked={mode === m.key}
                disabled={m.disabled}
                onChange={() => setMode(m.key)}
                className="accent-emerald-600"
              />
              {m.text}
            </label>
          ))}
          <AnimatePresence initial={false}>
            {mode === "range" && (
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
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 pt-2 pl-7 text-sm">
                  <label className="flex items-center gap-2">
                    {t.exportPage.rangeFrom}
                    <select
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className={selectClass}
                    >
                      {days.map((d) => (
                        <option key={d.date} value={d.date}>
                          {formatDate(d.date, locale)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    {t.exportPage.rangeTo}
                    <select
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className={selectClass}
                    >
                      {days.map((d) => (
                        <option key={d.date} value={d.date}>
                          {formatDate(d.date, locale)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.fieldset>

        <motion.fieldset {...item(2)} className="space-y-3">
          <legend className="mb-2 text-sm font-medium">
            {t.exportPage.panelFormats}
          </legend>
          {DOC_KINDS.map((k) => (
            <label key={k} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={kinds.includes(k)}
                onChange={() => toggleKind(k)}
                className="mt-1 accent-emerald-600"
              />
              <span className="text-sm">
                <span className="block font-medium">{docInfo[k].title}</span>
                <span className="block text-xs text-neutral-500">
                  {docInfo[k].text}
                </span>
              </span>
            </label>
          ))}
          <label className="flex cursor-pointer items-start gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            <input
              type="checkbox"
              checked={withManifest}
              onChange={() => setWithManifest((v) => !v)}
              className="mt-1 accent-emerald-600"
            />
            <span className="text-sm">
              <span className="block font-medium">
                {t.exportPage.panelManifest}
              </span>
              <span className="block text-xs text-neutral-500">
                {t.exportPage.panelManifestText}
              </span>
            </span>
          </label>
        </motion.fieldset>

        <motion.div {...item(3)} className="space-y-3">
          {hasOpenDay && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {t.exportPage.panelOpenWarn}
            </p>
          )}
          <p
            className={`text-sm ${
              canDownload || phase !== "idle"
                ? "text-neutral-500"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {hint}
          </p>
          <motion.button
            type="button"
            onClick={onDownload}
            disabled={!canDownload}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: DUR.quick }}
            className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: DUR.quick, ease: EASE_ENTER },
                }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.1 } }}
              >
                {phase === "done"
                  ? `✓ ${t.exportPage.done}`
                  : phase === "working"
                    ? t.exportPage.panelPreparing
                    : t.exportPage.panelDownload}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
