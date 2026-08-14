package expo.modules.rateswidget

import android.content.Context

/**
 * Fan-out point for every Cambialy home-screen widget.
 *
 * The refresh pipeline (worker, module, providers, configuration activity) talks to this
 * object rather than to individual providers, so adding a widget is one line here and no
 * change anywhere else.
 */
internal object WidgetRenderers {
  fun renderAll(context: Context, isLoading: Boolean = false, hasError: Boolean = false) {
    RatesWidgetProvider.renderAll(context, isLoading, hasError)
    RateWidgetProvider.renderAll(context, isLoading, hasError)
    TrendWidgetProvider.renderAll(context, isLoading, hasError)
  }
}
