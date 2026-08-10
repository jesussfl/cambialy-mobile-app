import { currencyInfo } from "@/features/exchange/constants";
import type { CurrencyOption } from "@/features/exchange/types";

import type { PriceCurrencyId } from "./types";

export const priceCurrencyMeta: Record<PriceCurrencyId, CurrencyOption> = {
  ...currencyInfo,
  usdt: {
    id: "usdt",
    symbol: "$",
    name: "Divisa",
    code: "Divisa",
    icon: "copper-coin-line",
  },
  ves: {
    id: "ves",
    code: "VES",
    name: "Bolivares",
    symbol: "Bs.",
    icon: "bank-line",
  },
  bcv: {
    ...currencyInfo.bcv,
    name: "Dolares BCV",
  },
  eur: {
    ...currencyInfo.eur,
    name: "Euros",
  },
  custom: {
    id: "custom",
    code: "PERS",
    name: "Personalizado",
    symbol: "$",
    icon: "edit-2-line",
  },
};

export const priceCurrencyOrder: PriceCurrencyId[] = ["ves", "usdt", "bcv", "eur", "custom"];

/**
 * The prices being compared, as data.
 *
 * The screen maps over this instead of branching on a hand-written `"first" | "second"` union, so the
 * state, the handlers, and the rendering all extend by appending an entry here rather than by editing
 * three ternaries. (The summary still reads two prices — see the change's Non-Goals.)
 */
export const PRICE_SIDES = [
  { id: "a", label: "Precio A", defaultCurrencyId: "usdt" },
  { id: "b", label: "Precio B", defaultCurrencyId: "ves" },
] as const satisfies readonly { id: string; label: string; defaultCurrencyId: PriceCurrencyId }[];

export type PriceSideId = (typeof PRICE_SIDES)[number]["id"];
