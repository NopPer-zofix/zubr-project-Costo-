"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { EASE_ENTER } from "@/lib/motion";

// Число растёт от нуля до значения. При "уменьшить движение" сразу итог.
export function CountUp({
  value,
  format,
  duration = 0.8,
  delay = 0,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, value, {
      duration,
      delay,
      ease: EASE_ENTER,
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [value, reduce, duration, delay]);

  return <>{format(reduce ? value : shown)}</>;
}
