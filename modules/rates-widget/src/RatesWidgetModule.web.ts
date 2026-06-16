import { registerWebModule, NativeModule } from 'expo';
import type { WidgetRates } from './RatesWidget.types';

// RatesWidgetModule is not available on the web platform.
class RatesWidgetModule extends NativeModule<{}> {
  async refreshWidgets(): Promise<void> {}

  async getCachedRates(): Promise<WidgetRates | null> {
    return null;
  }
}

export default registerWebModule(RatesWidgetModule, 'RatesWidget');
