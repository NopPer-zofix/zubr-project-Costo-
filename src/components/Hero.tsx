"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DUR, EASE_ENTER, rise } from "@/lib/motion";
import { LanguageSwitch } from "./LanguageSwitch";
import { HeroChart } from "./HeroChart";

const MotionLink = motion.create(Link);

// Заголовок выезжает из маски по словам (Masked type)
function MaskedHeadline({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <h1
      aria-label={text}
      className="text-5xl font-light leading-[1.1] tracking-tight sm:text-6xl"
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.08 * i,
                ease: EASE_ENTER,
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}

export function Hero() {
  const { t, locale } = useLanguage();

  return (
    // "user": при включённом "уменьшить движение" остаётся только проявление
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-8 sm:px-12">
          <span className="flex items-center gap-2 text-base font-medium tracking-tight">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            {t.brand}
          </span>
          <LanguageSwitch variant="minimal" />
        </header>

        <main className="flex flex-1 items-center px-6 pb-24 sm:px-12">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <MaskedHeadline key={locale} text={t.home.title} />
              <motion.p
                key={`${locale}-sub`}
                {...rise(0.35)}
                className="mt-8 max-w-md text-lg text-neutral-500"
              >
                {t.home.subtitle}
              </motion.p>
              <motion.div key={`${locale}-cta`} {...rise(0.5)} className="mt-12">
                <MotionLink
                  href="/connect"
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: DUR.quick }}
                  className="inline-block rounded-full bg-foreground px-8 py-3.5 text-base font-medium text-background transition-opacity duration-150 hover:opacity-80"
                >
                  {t.home.cta}
                </MotionLink>
              </motion.div>
            </div>

            <HeroChart />
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
