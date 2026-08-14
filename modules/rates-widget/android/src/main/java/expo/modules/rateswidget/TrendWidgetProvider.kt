package expo.modules.rateswidget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews

/**
 * TREND widget — one currency plus how far it moved since its last different value.
 *
 * Currency is chosen per placement in [WidgetConfigurationActivity], same as
 * [RateWidgetProvider]; the trend itself comes from the shared rates cache.
 */
class TrendWidgetProvider : AppWidgetProvider() {
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
    const val ACTION_OPEN_APP = "expo.modules.rateswidget.action.TREND_OPEN_APP"
    const val ACTION_REFRESH = "expo.modules.rateswidget.action.TREND_REFRESH"

    fun renderAll(context: Context, isLoading: Boolean = false, hasError: Boolean = false) {
      ConfigurableWidgets.renderEach(context, TrendWidgetProvider::class.java) { appWidgetId ->
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
      val trend = rates?.let { RatesWidgetRepository.trendFor(it, currency) }

      return RemoteViews(context.packageName, R.layout.trend_widget).apply {
        setOnClickPendingIntent(
          R.id.trend_widget_root,
          ConfigurableWidgets.broadcast(context, TrendWidgetProvider::class.java, ACTION_OPEN_APP, 400)
        )
        setOnClickPendingIntent(
          R.id.trend_widget_refresh,
          ConfigurableWidgets.broadcast(context, TrendWidgetProvider::class.java, ACTION_REFRESH, 401)
        )

        ConfigurableWidgets.applyCurrencyBadge(
          views = this,
          currency = currency,
          usdBadgeId = R.id.trend_widget_badge_usd,
          eurBadgeId = R.id.trend_widget_badge_eur,
          usdtBadgeId = R.id.trend_widget_badge_usdt,
          sourceId = R.id.trend_widget_source,
          context = context
        )

        setTextViewText(
          R.id.trend_widget_value,
          if (rates == null) {
            context.getString(R.string.rates_widget_unavailable)
          } else {
            RatesWidgetRepository.formatRate(currency.currentValue(rates))
          }
        )

        applyTrend(context, trend)

        setTextViewText(R.id.trend_widget_status, statusText(context, rates, trend, isLoading, hasError))

        setViewVisibility(R.id.trend_widget_refresh, if (isLoading) View.GONE else View.VISIBLE)
        setViewVisibility(R.id.trend_widget_progress, if (isLoading) View.VISIBLE else View.GONE)
      }
    }

    /**
     * Exactly one of the three pre-styled delta views is shown. Nothing is shown at all
     * until a real previous value exists — a fabricated 0,00% would read as "the rate
     * held steady", which is a different claim from "we have not seen it move yet".
     */
    private fun RemoteViews.applyTrend(context: Context, trend: WidgetTrend?) {
      val hasTrend = trend != null && !trend.isFlat

      setViewVisibility(R.id.trend_widget_delta_up, View.GONE)
      setViewVisibility(R.id.trend_widget_delta_down, View.GONE)
      setViewVisibility(R.id.trend_widget_delta_flat, View.GONE)

      if (trend == null) {
        return
      }

      if (!hasTrend) {
        setViewVisibility(R.id.trend_widget_delta_flat, View.VISIBLE)
        return
      }

      val targetId = if (trend.isUp) R.id.trend_widget_delta_up else R.id.trend_widget_delta_down
      val arrow = context.getString(if (trend.isUp) R.string.widget_trend_arrow_up else R.string.widget_trend_arrow_down)

      setTextViewText(
        targetId,
        context.getString(
          R.string.widget_trend_delta,
          arrow,
          RatesWidgetRepository.formatDelta(trend),
          RatesWidgetRepository.formatPercent(trend)
        )
      )
      setViewVisibility(targetId, View.VISIBLE)
    }

    private fun statusText(
      context: Context,
      rates: WidgetRates?,
      trend: WidgetTrend?,
      isLoading: Boolean,
      hasError: Boolean
    ): String {
      val changedAt = trend?.changedAt

      // Once a real comparison point exists, naming it is more useful than repeating
      // the fetch time the other widgets already show.
      if (!isLoading && !hasError && rates != null && changedAt != null && changedAt > 0L) {
        val formatted = RatesWidgetRepository.formatDateTime(changedAt)
        if (formatted.isNotEmpty()) {
          return context.getString(R.string.widget_trend_since, formatted)
        }
      }

      return WidgetStatus.text(context, rates, isLoading, hasError)
    }
  }
}
