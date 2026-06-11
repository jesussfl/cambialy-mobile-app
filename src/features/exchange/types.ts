import type { ExchangeRateId } from "@/features/calculator/api/rates-api";
import type { IconName } from "react-native-remix-icon";

export type CurrencyOption = {
  code: string;
  icon: IconName;
  id: string;
  name: string;
  symbol: string;
};

export type TargetCurrencyId = "ves" | "bcv";

export type ConversionDetail = {
  amountText: string;
  icon: IconName;
  id: string;
  label: string;
  rateText: string;
};
