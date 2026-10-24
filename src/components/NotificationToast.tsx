"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "@/state/AppState";
import type { PriceEvent } from "@/data/mock";
import { DUR, EASE_ENTER, EASE_EXIT } from "@/lib/motion";
import { PriceItem } from "./NotificationsSidebar";

const VISIBLE_MS = 4500;

// Всплывающее окно при новом изменении цены. Исчезает само или по клику.
export function NotificationToast() {
  const { simulated } = useAppState();
  const [current, setCurrent] = useState<PriceEvent | null>(null);
  const seen = useRef(simulated.length);

  useEffect(() => {
    if (simulated.length > seen.current) {
      setCurrent(simulated[0]);
    }
    seen.current = simulated.length;
  }, [simulated]);

  useEffect(() => {
    if (!current) return;
    const id = window.setTimeout(() => setCurrent(null), VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [current]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-6 right-6 z-50 flex sm:right-auto sm:max-w-sm"
    >
      <AnimatePresence>
        {current && (
          <motion.button
            key={current.id}
            type="button"
            onClick={() => setCurrent(null)}
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
            className="pointer-events-auto w-full rounded-xl border border-neutral-200 bg-background p-4 text-left text-sm shadow-lg dark:border-neutral-700"
          >
            <PriceItem item={current} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
