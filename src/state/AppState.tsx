"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  OFFERS,
  PRICE_EVENTS,
  PRODUCTS,
  type PriceEvent,
} from "@/data/mock";

type Follows = { suppliers: string[]; products: string[] };

type AppStateValue = {
  ready: boolean;
  nip: string | null;
  connect: (nip: string) => void;
  logout: () => void;
  follows: Follows;
  toggleSupplier: (id: string) => void;
  toggleProduct: (id: string) => void;
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  simulated: PriceEvent[];
  simulate: () => void;
};

const NIP_KEY = "costo-nip"; // sessionStorage: живёт, пока открыта вкладка
const FOLLOWS_KEY = "costo-follows"; // localStorage
const READ_KEY = "costo-read"; // localStorage

const EMPTY_FOLLOWS: Follows = { suppliers: [], products: [] };

const AppStateContext = createContext<AppStateValue | null>(null);

function loadJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // хранилище недоступно, работаем без сохранения
  }
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [nip, setNip] = useState<string | null>(null);
  const [follows, setFollows] = useState<Follows>(EMPTY_FOLLOWS);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [simulated, setSimulated] = useState<PriceEvent[]>([]);

  // Читаем сохранённое уже в браузере, чтобы HTML сервера совпал с первым рендером
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setNip(loadJson<string | null>(sessionStorage, NIP_KEY, null));
    setFollows(loadJson<Follows>(localStorage, FOLLOWS_KEY, EMPTY_FOLLOWS));
    setReadIds(loadJson<string[]>(localStorage, READ_KEY, []));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const connect = useCallback((value: string) => {
    setNip(value);
    saveJson(sessionStorage, NIP_KEY, value);
  }, []);

  const logout = useCallback(() => {
    setNip(null);
    try {
      sessionStorage.removeItem(NIP_KEY);
    } catch {
      // ничего страшного
    }
  }, []);

  const updateFollows = useCallback((next: Follows) => {
    setFollows(next);
    saveJson(localStorage, FOLLOWS_KEY, next);
  }, []);

  const toggleSupplier = useCallback(
    (id: string) =>
      updateFollows({ ...follows, suppliers: toggle(follows.suppliers, id) }),
    [follows, updateFollows],
  );

  const toggleProduct = useCallback(
    (id: string) =>
      updateFollows({ ...follows, products: toggle(follows.products, id) }),
    [follows, updateFollows],
  );

  const updateRead = useCallback((next: string[]) => {
    setReadIds(next);
    saveJson(localStorage, READ_KEY, next);
  }, []);

  const markRead = useCallback(
    (id: string) => {
      if (!readIds.includes(id)) updateRead([...readIds, id]);
    },
    [readIds, updateRead],
  );

  const markAllRead = useCallback(
    (ids: string[]) => updateRead([...new Set([...readIds, ...ids])]),
    [readIds, updateRead],
  );

  // Демо: создаём новое изменение цены, чтобы показать, как приходит уведомление.
  // Берём подписки пользователя, если они есть, иначе случайный товар.
  const simulate = useCallback(() => {
    const productId =
      follows.products.length > 0
        ? follows.products[Math.floor(Math.random() * follows.products.length)]
        : PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)].id;

    const suppliersOfProduct = Object.keys(OFFERS[productId] ?? {});
    if (suppliersOfProduct.length === 0) return;
    const followed = suppliersOfProduct.filter((s) =>
      follows.suppliers.includes(s),
    );
    const pool = followed.length > 0 ? followed : suppliersOfProduct;
    const supplierId = pool[Math.floor(Math.random() * pool.length)];

    const latest = [...simulated, ...PRICE_EVENTS].find(
      (e) => e.productId === productId && e.supplierId === supplierId,
    );
    const oldPrice = latest?.newPrice ?? OFFERS[productId][supplierId];
    const delta = (Math.random() * 0.08 + 0.02) * (Math.random() < 0.5 ? -1 : 1);
    const newPrice = Math.round(oldPrice * (1 + delta) * 100) / 100;

    setSimulated((prev) => [
      {
        kind: "price",
        id: `sim-${prev.length + 1}`,
        supplierId,
        productId,
        oldPrice,
        newPrice,
        date: "2026-10-24",
      },
      ...prev,
    ]);
  }, [follows, simulated]);

  return (
    <AppStateContext.Provider
      value={{
        ready,
        nip,
        connect,
        logout,
        follows,
        toggleSupplier,
        toggleProduct,
        readIds,
        markRead,
        markAllRead,
        simulated,
        simulate,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
