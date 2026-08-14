package expo.modules.rateswidget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews

/**
 * RATE widget — one currency, chosen per placement in [WidgetConfigurationActivity].
 *
 * Shares the rates cache and refresh schedule with every other Cambialy widget; only the
 * currency it points at is per-instance.
 */
class RateWidgetProvider : AppWidgetProvider() {
  override fun onEnabled(context: Context) {
    RatesWidgetWorker.enqueuePeriodic(context)
    RatesWidgetWorker.enqueueImmediate(context)
  }

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    val rates = RatesWidgetRepository.getCachedRates(context)
    renderAll(context, isLoading = rates == null)
    RatesWidgetWorker.enqueueImmediate(context)
    RatesWidgetWorker.enqueuePeriodic(context)
  }

  override fun onDeleted(context: Context, appWidgetIds: IntArray) {
    WidgetPreferences.clear(context, appWidgetIds)
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)

    when (intent.action) {
      ACTION_REFRESH -> {
        WidgetRenderers.renderAll(context, isLoading = true)
        RatesWidgetWorker.enqueueImmediate(context)
      }
      ACTION_OPEN_APP -> ConfigurableWidgets.launchApp(context)
    }
  }

  companion object {
    const val ACTION_OPEN_APP = "expo.modules.rateswidget.action.RATE_OPEN_APP"
    const val ACTION_REFRESH = "expo.modules.rateswidget.action.RATE_REFRESH"

    fun renderAll(context: Context, isLoading: Boolean = false, hasError: Boolean = false) {
      ConfigurableWidgets.renderEach(context, RateWidgetProvider::class.java) { appWidgetId ->
        buildRemoteViews(context, appWidgetId, isLoading, hasError)
      }
    }

    private fun buildRemoteViews(
      context: Context,
      appWidgetId: Int,
      isLoading: Boolean,
      hasError: Boolean
    ): RemoteViews {
      val rates = RatesWidgetRepository.getCachedRates(context)
      val currency = WidgetPreferences.getCurrency(context, appWidgetId)

      return RemoteViews(context.packageName, R.layout.rate_widget).apply {
        setOnClickPendingIntent(
          R.id.rate_widget_root,
          ConfigurableWidgets.broadcast(context, RateWidgetProvider::class.java, ACTION_OPEN_APP, 300)
        )
        setOnClickPendingIntent(
          R.id.rate_widget_refresh,
          ConfigurableWidgets.broadcast(context, RateWidgetProvider::class.java, ACTION_REFRESH, 301)
        )

        ConfigurableWidgets.applyCurrencyBadge(
          views = this,
          currency = currency,
          usdBadgeId = R.id.rate_widget_badge_usd,
          eurBadgeId = R.id.rate_widget_badge_eur,
          usdtBadgeId = R.id.rate_widget_badge_usdt,
          sourceId = R.id.rate_widget_source,
          context = context
        )

        setTextViewText(
          R.id.rate_widget_value,
          if (rates == null) {
            context.getString(R.string.rates_widget_unavailable)
          } else {
            RatesWidgetRepository.formatAmount(currency.currentValue(rates))
          }
        )

        setTextViewText(R.id.rate_widget_status, WidgetStatus.text(context, rates, isLoading, hasError))

        setViewVisibility(R.id.rate_widget_refresh, if (isLoading) View.GONE else View.VISIBLE)
        setViewVisibility(R.id.rate_widget_progress, if (isLoading) View.VISIBLE else View.GONE)
      }
    }
  }
}
