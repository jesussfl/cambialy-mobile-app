package expo.modules.rateswidget

import android.content.Context

/**
 * Single source of truth for the freshness line every widget shows.
 *
 * Two Cambialy widgets can sit on the same home screen; if each computed its own status
 * text they could describe identical data differently, which reads as a bug to the user.
 */
internal object WidgetStatus {
  fun text(context: Context, rates: WidgetRates?, isLoading: Boolean, hasError: Boolean): String {
    if (isLoading) {
      return context.getString(R.string.rates_widget_loading)
    }

    if (rates == null) {
      return context.getString(R.string.rates_widget_empty)
    }

    if (hasError) {
      return context.getString(R.string.rates_widget_stale)
    }

    val formattedTime = RatesWidgetRepository.formatTime(rates.updatedAt)

    return if (formattedTime.isNotEmpty()) {
      context.getString(R.string.rates_widget_updated, formattedTime)
    } else {
      context.getString(R.string.rates_widget_stale)
    }
  }
}
