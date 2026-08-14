package expo.modules.rateswidget

import android.content.Context

/**
 * Per-instance widget configuration, keyed by appWidgetId.
 *
 * Separate from the rates cache on purpose: rates are shared by every widget, while this
 * is what each individual placement was configured to show. Two Rate widgets on the same
 * home screen can therefore track different currencies.
 */
object WidgetPreferences {
  private const val PREFS_NAME = "cambialy_widget_config"

  private fun currencyKey(appWidgetId: Int) = "currency_$appWidgetId"

  fun setCurrency(context: Context, appWidgetId: Int, currency: WidgetCurrency) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(currencyKey(appWidgetId), currency.id)
      .apply()
  }

  fun getCurrency(context: Context, appWidgetId: Int): WidgetCurrency {
    val stored = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(currencyKey(appWidgetId), null)

    return WidgetCurrency.fromId(stored)
  }

  /** Called from onDeleted so removed widgets do not leak their preference forever. */
  fun clear(context: Context, appWidgetIds: IntArray) {
    val editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
    appWidgetIds.forEach { editor.remove(currencyKey(it)) }
    editor.apply()
  }
}
