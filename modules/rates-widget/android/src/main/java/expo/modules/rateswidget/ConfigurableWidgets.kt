package expo.modules.rateswidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * Shared plumbing for widgets whose content depends on their own per-instance
 * configuration, so each placement must be rendered individually rather than sharing
 * one RemoteViews.
 */
internal object ConfigurableWidgets {
  fun renderEach(
    context: Context,
    providerClass: Class<out AppWidgetProvider>,
    build: (appWidgetId: Int) -> RemoteViews
  ) {
    val manager = AppWidgetManager.getInstance(context)
    manager.getAppWidgetIds(ComponentName(context, providerClass)).forEach { appWidgetId ->
      manager.updateAppWidget(appWidgetId, build(appWidgetId))
    }
  }

  fun broadcast(context: Context, providerClass: Class<*>, action: String, requestCode: Int): PendingIntent {
    val intent = Intent(context, providerClass).setAction(action)
    return PendingIntent.getBroadcast(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  fun launchApp(context: Context) {
    context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launchIntent ->
      launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(launchIntent)
    }
  }

  /**
   * Shows the badge matching [currency] and hides the others. Every badge is pre-styled
   * in XML so its colours resolve through res/values-night in the launcher's context.
   */
  fun applyCurrencyBadge(
    views: RemoteViews,
    currency: WidgetCurrency,
    usdBadgeId: Int,
    eurBadgeId: Int,
    usdtBadgeId: Int,
    sourceId: Int,
    context: Context
  ) {
    views.setViewVisibility(usdBadgeId, visibilityFor(currency == WidgetCurrency.USD))
    views.setViewVisibility(eurBadgeId, visibilityFor(currency == WidgetCurrency.EUR))
    views.setViewVisibility(usdtBadgeId, visibilityFor(currency == WidgetCurrency.USDT))
    views.setTextViewText(sourceId, context.getString(currency.sourceRes))
  }

  private fun visibilityFor(isVisible: Boolean) = if (isVisible) android.view.View.VISIBLE else android.view.View.GONE
}
