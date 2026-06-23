import RatesWidgetModule from "../../modules/rates-widget/src/RatesWidgetModule";
import type { WidgetRates } from "../../modules/rates-widget/src/RatesWidget.types";

export type { WidgetRates };

export async function refreshRatesWidget() {
  await RatesWidgetModule.refreshWidgets();
}

export async function getCachedRatesWidget(): Promise<WidgetRates | null> {
  return RatesWidgetModule.getCachedRates();
}
