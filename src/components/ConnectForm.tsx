"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import { normalizeNip, validateNip, type NipError } from "@/lib/nip";
import { LanguageSwitch } from "./LanguageSwitch";

// Тестовый NIP с корректной контрольной суммой, только для демо
const DEMO_NIP = "5260250274";
const DEMO_TOKEN = "demo-token-0000000000000000";
const MIN_TOKEN_LENGTH = 8;

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 dark:border-neutral-700";

export function ConnectForm() {
  const { t } = useLanguage();
  const { connect } = useAppState();
  const router = useRouter();

  const [nip, setNip] = useState("");
  const [token, setToken] = useState("");
  const [nipError, setNipError] = useState<NipError | null>(null);
  const [tokenError, setTokenError] = useState(false);

  const nipMessages: Record<NipError, string> = {
    empty: t.connect.errors.nipEmpty,
    format: t.connect.errors.nipFormat,
    checksum: t.connect.errors.nipChecksum,
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nipProblem = validateNip(nip);
    const tokenProblem = token.trim().length < MIN_TOKEN_LENGTH;
    setNipError(nipProblem);
    setTokenError(tokenProblem);
    if (nipProblem || tokenProblem) return;

    // Токен проверен и сразу забыт: в демо он никуда не уходит и не хранится
    connect(normalizeNip(nip));
    router.push("/dashboard");
  }

  function fillDemo() {
    setNip(DEMO_NIP);
    setToken(DEMO_TOKEN);
    setNipError(null);
    setTokenError(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-600"
        >
          {t.brand}
        </Link>
        <LanguageSwitch />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 p-8 shadow-sm dark:border-neutral-800"
        >
          <div>
            <h1 className="text-2xl font-bold">{t.connect.title}</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {t.connect.subtitle}
            </p>
          </div>

          <div>
            <label htmlFor="nip" className="mb-1.5 block text-sm font-medium">
              {t.connect.nipLabel}
            </label>
            <input
              id="nip"
              inputMode="numeric"
              autoComplete="off"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder={t.connect.nipPlaceholder}
              aria-invalid={nipError !== null}
              className={inputClass}
            />
            {nipError && (
              <p className="mt-1.5 text-sm text-red-600">
                {nipMessages[nipError]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="token"
              className="mb-1.5 block text-sm font-medium"
            >
              {t.connect.tokenLabel}
            </label>
            <input
              id="token"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t.connect.tokenPlaceholder}
              aria-invalid={tokenError}
              className={inputClass}
            />
            {tokenError ? (
              <p className="mt-1.5 text-sm text-red-600">
                {t.connect.errors.tokenShort}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-neutral-500">
                {t.connect.tokenHint}
              </p>
            )}
          </div>

          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            {t.connect.demoNote}
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {t.connect.submit}
            </button>
            <button
              type="button"
              onClick={fillDemo}
              className="rounded-full border border-neutral-300 px-6 py-3 text-base font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              {t.connect.demoFill}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
