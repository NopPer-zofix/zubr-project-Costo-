"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAppState } from "@/state/AppState";
import { normalizeNip, validateNip, type NipError } from "@/lib/nip";
import { DUR, EASE, EASE_EXIT, rise } from "@/lib/motion";
import { LanguageSwitch } from "./LanguageSwitch";

// Тестовый NIP с корректной контрольной суммой, только для демо
const DEMO_NIP = "5260250274";
const DEMO_TOKEN = "demo-token-0000000000000000";
const MIN_TOKEN_LENGTH = 8;
const STEP = 0.06; // каскад блоков формы, 60 мс

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 text-base outline-none transition-[border-color,box-shadow] duration-150 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 dark:border-neutral-700";

// Ошибка: проявление со сдвигом на 8 px, уход быстрее входа
function FieldError({ children }: { children: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: DUR.quick, ease: EASE_EXIT } }}
      className="mt-1.5 text-sm text-red-600"
    >
      {children}
    </motion.p>
  );
}

export function ConnectForm() {
  const { t } = useLanguage();
  const { connect } = useAppState();
  const router = useRouter();
  const shake = useAnimationControls();

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
    if (nipProblem || tokenProblem) {
      // Встряска ошибки: 2 to 3 колебания по 8 px за 350 мс
      shake.start({
        x: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.35, ease: EASE },
      });
      return;
    }

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
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.standard, ease: EASE }}
        className="flex items-center justify-between px-6 py-5 sm:px-10"
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-600"
        >
          {t.brand}
        </Link>
        <LanguageSwitch />
      </motion.header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <motion.div animate={shake} className="w-full max-w-md">
          <motion.form
            onSubmit={onSubmit}
            noValidate
            {...rise(0.05, DUR.slow)}
            className="space-y-6 rounded-2xl border border-neutral-200 p-8 shadow-sm dark:border-neutral-800"
          >
            <motion.div {...rise(0.15 + STEP * 0)}>
              <h1 className="text-2xl font-bold">{t.connect.title}</h1>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                {t.connect.subtitle}
              </p>
            </motion.div>

            <motion.div {...rise(0.15 + STEP * 1)}>
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
              <AnimatePresence initial={false}>
                {nipError && (
                  <FieldError key={nipError}>{nipMessages[nipError]}</FieldError>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div {...rise(0.15 + STEP * 2)}>
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
              <AnimatePresence initial={false} mode="wait">
                {tokenError ? (
                  <FieldError key="error">{t.connect.errors.tokenShort}</FieldError>
                ) : (
                  <motion.p
                    key="hint"
                    initial={false}
                    exit={{ opacity: 0, transition: { duration: DUR.quick } }}
                    className="mt-1.5 text-sm text-neutral-500"
                  >
                    {t.connect.tokenHint}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.p
              {...rise(0.15 + STEP * 3)}
              className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            >
              {t.connect.demoNote}
            </motion.p>

            <motion.div
              {...rise(0.15 + STEP * 4)}
              className="flex flex-col gap-3"
            >
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DUR.quick }}
                className="rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-emerald-700"
              >
                {t.connect.submit}
              </motion.button>
              <motion.button
                type="button"
                onClick={fillDemo}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DUR.quick }}
                className="rounded-full border border-neutral-300 px-6 py-3 text-base font-medium transition-colors duration-150 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                {t.connect.demoFill}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </main>
    </div>
  );
}
