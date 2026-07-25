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
