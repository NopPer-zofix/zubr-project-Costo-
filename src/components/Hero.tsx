"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageSwitch } from "./LanguageSwitch";

export function Hero() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-8 sm:px-12">
        <span className="flex items-center gap-2 text-base font-medium tracking-tight">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          {t.brand}
        </span>
        <LanguageSwitch variant="minimal" />
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 pb-32 sm:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-5xl font-light leading-[1.1] tracking-tight sm:text-7xl">
            {t.home.title}
          </h1>
          <p className="mt-8 max-w-md text-lg text-neutral-500">
            {t.home.subtitle}
          </p>
          <Link
            href="/connect"
            className="mt-12 inline-block rounded-full bg-foreground px-8 py-3.5 text-base font-medium text-background transition-opacity hover:opacity-80"
          >
            {t.home.cta}
          </Link>
        </div>
      </main>
    </div>
  );
}
