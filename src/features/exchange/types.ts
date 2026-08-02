import type { IconName } from "react-native-remix-icon";

export type CurrencyOption = {
  code: string;
  icon: IconName;
  id: string;
  name: string;
  symbol: string;
};

export type TargetCurrencyId = "ves" | "bcv";

export type TargetCurrencyOption = CurrencyOption & {
  id: TargetCurrencyId;
};

export type ConversionDetail = {
  amountText: string;
  icon: IconName;
  id: string;
  label: string;
  rateText: string;
  isHighlight?: boolean;
};

export type ExchangeHistoryPickerOption = {
  description: string;
  headerDescription: string;
  label: string;
  value: string;
};
