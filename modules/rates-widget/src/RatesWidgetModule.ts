import { NativeModule, requireNativeModule } from 'expo';
import type { WidgetRates } from './RatesWidget.types';

declare class RatesWidgetModule extends NativeModule<{}> {
  refreshWidgets(): Promise<void>;
  getCachedRates(): Promise<WidgetRates | null>;
}

export default requireNativeModule<RatesWidgetModule>('RatesWidget');
