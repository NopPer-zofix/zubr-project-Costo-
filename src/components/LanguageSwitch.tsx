"use client";

import { useLanguage, type Locale } from "@/i18n/LanguageProvider";

const LOCALES: Locale[] = ["ru", "en"];

export function LanguageSwitch({
  variant = "pill",
}: {
  variant?: "pill" | "minimal";
}) {
  const { locale, setLocale, t } = useLanguage();

  if (variant === "minimal") {
    return (
      <div
        role="group"
        aria-label={t.language.label}
        className="flex items-center gap-2 text-sm"
      >
        {LOCALES.map((code, i) => (
          <span key={code} className="flex items-center gap-2">
            {i > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
            <button
              type="button"
              onClick={() => setLocale(code)}
              aria-pressed={locale === code}
              className={`transition-colors ${
                locale === code
                  ? "text-foreground"
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              {t.language[code]}
            </button>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="inline-flex rounded-full border border-neutral-300 p-0.5 text-sm dark:border-neutral-700"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            locale === code
              ? "bg-emerald-600 text-white"
              : "text-neutral-600 hover:text-foreground dark:text-neutral-400"
          }`}
        >
          {t.language[code]}
        </button>
      ))}
    </div>
  );
}
