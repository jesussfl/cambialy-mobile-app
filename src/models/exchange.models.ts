import { IconName } from "react-native-remix-icon";

export type ExchangeRateId = "bcv" | "usdt" | "eur";

export type ExchangeRate = {
  id: ExchangeRateId;
  label: string;
  value: number;
  updatedAt?: string;
  icon: IconName;
};

export type ExchangeRateHistoryOption = ExchangeRate & {
  bcvValue?: number;
  eurValue?: number;
};

export type ExchangeRateAPIResponse = {
  source?: string;
  last_updated?: string;
  rates?: Partial<Record<"USD" | "EUR", number>>;
};

export type RatesHistoryAPIResponse = {
  category?: "bcv" | "binance";
  history?: ExchangeRateAPIResponse[];
};
