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
  target_currency?: string;
  rate_value?: number;
  rate?: number;
  last_updated?: string;
  timestamp?: string;
  currency?: string;
  rates?: Partial<Record<"USD" | "EUR", number>>;
};

export type RatesHistoryAPIResponse = {
  category?: string;
  page?: number;
  size?: number;
  total_records?: number;
  next_cursor?: string | null;
  has_more?: boolean;
  history?: ExchangeRateAPIResponse[];
};
