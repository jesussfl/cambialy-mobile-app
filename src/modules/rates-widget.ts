import { Platform } from "react-native";

import RatesWidgetModule from "../../modules/rates-widget/src/RatesWidgetModule";
import type { WidgetRates } from "../../modules/rates-widget/src/RatesWidget.types";

export type { WidgetRates };

export async function refreshRatesWidget() {
  if (Platform.OS !== "android") {
    return;
  }

  await RatesWidgetModule.refreshWidgets();
}

export async function getCachedRatesWidget(): Promise<WidgetRates | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  return RatesWidgetModule.getCachedRates();
}
