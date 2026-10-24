"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

// "user": если в системе включено "уменьшить движение", остаётся только проявление
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
