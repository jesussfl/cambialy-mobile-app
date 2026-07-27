package expo.modules.rateswidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews

class RatesWidgetProvider : AppWidgetProvider() {
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

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)

    when (intent.action) {
      ACTION_REFRESH -> {
        renderAll(context, isLoading = true)
        RatesWidgetWorker.enqueueImmediate(context)
      }
      ACTION_OPEN_APP -> {
        context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launchIntent ->
          launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          context.startActivity(launchIntent)
        }
      }
    }
  }

  companion object {
    const val ACTION_OPEN_APP = "expo.modules.rateswidget.action.OPEN_APP"
    const val ACTION_REFRESH = "expo.modules.rateswidget.action.REFRESH"

    fun renderAll(context: Context, isLoading: Boolean = false, hasError: Boolean = false) {
      val manager = AppWidgetManager.getInstance(context)
      val widgetIds = manager.getAppWidgetIds(ComponentName(context, RatesWidgetProvider::class.java))
      widgetIds.forEach { widgetId ->
        manager.updateAppWidget(widgetId, buildRemoteViews(context, isLoading, hasError))
      }
    }

    private fun buildRemoteViews(context: Context, isLoading: Boolean, hasError: Boolean): RemoteViews {
      val rates = RatesWidgetRepository.getCachedRates(context)
      return RemoteViews(context.packageName, R.layout.rates_widget).apply {
        setOnClickPendingIntent(R.id.rates_widget_root, openAppPendingIntent(context))
        setOnClickPendingIntent(R.id.rates_widget_refresh, refreshPendingIntent(context))

        if (rates == null) {
          setTextViewText(R.id.rates_widget_usd_value, context.getString(R.string.rates_widget_unavailable))
          setTextViewText(R.id.rates_widget_eur_value, context.getString(R.string.rates_widget_unavailable))
          setTextViewText(R.id.rates_widget_usdt_value, context.getString(R.string.rates_widget_unavailable))
          setTextViewText(
            R.id.rates_widget_status,
            if (isLoading) context.getString(R.string.rates_widget_loading) else context.getString(R.string.rates_widget_empty)
          )
        } else {
          setTextViewText(R.id.rates_widget_usd_value, RatesWidgetRepository.formatRate(rates.usdBcv))
          setTextViewText(R.id.rates_widget_eur_value, RatesWidgetRepository.formatRate(rates.eurBcv))
          setTextViewText(R.id.rates_widget_usdt_value, RatesWidgetRepository.formatRate(rates.usdtBinance))

          val statusText = when {
            isLoading -> context.getString(R.string.rates_widget_loading)
            hasError -> context.getString(R.string.rates_widget_stale)
            else -> {
              val formattedTime = RatesWidgetRepository.formatTime(rates.updatedAt)
              if (formattedTime.isNotEmpty()) {
                context.getString(R.string.rates_widget_updated, formattedTime)
              } else {
                context.getString(R.string.rates_widget_stale)
              }
            }
          }
          setTextViewText(R.id.rates_widget_status, statusText)
        }

        setViewVisibility(R.id.rates_widget_refresh, if (isLoading) View.GONE else View.VISIBLE)
        setViewVisibility(R.id.rates_widget_progress, if (isLoading) View.VISIBLE else View.GONE)
      }
    }

    private fun openAppPendingIntent(context: Context): PendingIntent {
      val intent = Intent(context, RatesWidgetProvider::class.java).setAction(ACTION_OPEN_APP)
      return PendingIntent.getBroadcast(context, 100, intent, pendingIntentFlags())
    }

    private fun refreshPendingIntent(context: Context): PendingIntent {
      val intent = Intent(context, RatesWidgetProvider::class.java).setAction(ACTION_REFRESH)
      return PendingIntent.getBroadcast(context, 101, intent, pendingIntentFlags())
    }

    private fun pendingIntentFlags(): Int = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  }
}
