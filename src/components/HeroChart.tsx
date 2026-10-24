"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { productById } from "@/data/mock";
import { computeSavings } from "@/lib/savings";
import { formatMoney, formatMoneyRound, formatPercent } from "@/lib/format";
import { DUR, EASE, EASE_ENTER, rise } from "@/lib/motion";

const ROWS = 3;
const ROW_STEP = 0.08; // каскад 80 мс
const START = 0.5; // после появления карточки

// Схема "вы платите / лучшая цена": для каждого товара одна полоса.
// Зелёная часть это лучшая цена, тёплая часть это переплата.
export function HeroChart() {
  const { t, locale } = useLanguage();
  const result = useMemo(() => computeSavings(), []);
  const rows = result.lines.slice(0, ROWS);

  const totalDelay = START + ROWS * ROW_STEP + DUR.slow + 0.2;

  return (
    <motion.figure
      {...rise(0.25, DUR.slow)}
      className="w-full rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800 sm:p-8"
      aria-label={t.home.chartTitle}
    >
      <figcaption className="mb-6 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium">{t.home.chartTitle}</span>
        <span className="text-xs text-neutral-500">{t.home.chartSample}</span>
      </figcaption>

      <ul className="space-y-6">
        {rows.map((line, i) => {
          const product = productById(line.productId);
          const unit = t.common.perUnit[product.unit];
          const fair = (line.bestPrice / line.avgPaid) * 100;
          const over = 100 - fair;
          const delay = START + i * ROW_STEP;

          return (
            <li key={line.productId}>
              <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{product.name[locale]}</span>
                <span className="text-neutral-500">
                  {formatMoney(line.avgPaid, locale)}
                  {" → "}
                  {formatMoney(line.bestPrice, locale)}/{unit}
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
                <motion.div
                  className="absolute inset-y-0 left-0 origin-left bg-emerald-600"
                  style={{ width: `${fair}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: DUR.slow, delay, ease: EASE }}
                />
                <motion.div
                  className="absolute inset-y-0 origin-left bg-amber-500"
                  style={{ left: `${fair}%`, width: `${over}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: DUR.standard,
                    delay: delay + DUR.slow * 0.6,
                    ease: EASE_ENTER,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
                {t.home.legendOver}: {formatPercent(over, locale)}
              </p>
            </li>
          );
        })}
      </ul>

      <motion.div
        {...rise(totalDelay, DUR.standard)}
        className="mt-8 flex items-end justify-between gap-4 border-t border-neutral-200 pt-5 dark:border-neutral-800"
      >
        <span className="text-sm text-neutral-500">{t.home.chartTotal}</span>
        <span className="text-3xl font-light tracking-tight text-emerald-600">
          {formatMoneyRound(result.totalSavings, locale)}
        </span>
      </motion.div>
    </motion.figure>
  );
}
