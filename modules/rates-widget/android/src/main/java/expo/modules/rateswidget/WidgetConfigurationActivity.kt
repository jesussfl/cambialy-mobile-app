package expo.modules.rateswidget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.RadioGroup

/**
 * Currency picker shown when a configurable widget is placed, and again from the
 * launcher's "edit widget" action. Shared by every configurable widget type.
 *
 * Theme is deliberately NOT configurable here: on Android the widget follows the device
 * theme through res/values-night, which the system applies without our involvement.
 */
class WidgetConfigurationActivity : Activity() {
  private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Backing out must not place a half-configured widget.
    setResult(RESULT_CANCELED)

    appWidgetId = intent?.extras?.getInt(
      AppWidgetManager.EXTRA_APPWIDGET_ID,
      AppWidgetManager.INVALID_APPWIDGET_ID
    ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

    if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
      finish()
      return
    }

    setContentView(R.layout.widget_configuration)

    val group = findViewById<RadioGroup>(R.id.widget_config_currency_group)
    group.check(radioIdFor(WidgetPreferences.getCurrency(this, appWidgetId)))

    findViewById<Button>(R.id.widget_config_save).setOnClickListener {
      WidgetPreferences.setCurrency(this, appWidgetId, currencyFor(group.checkedRadioButtonId))

      // Render immediately from cache so the widget never appears blank, then refresh.
      WidgetRenderers.renderAll(this)
      RatesWidgetWorker.enqueueImmediate(this)

      setResult(RESULT_OK, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId))
      finish()
    }
  }

  private fun radioIdFor(currency: WidgetCurrency): Int = when (currency) {
    WidgetCurrency.USD -> R.id.widget_config_usd
    WidgetCurrency.EUR -> R.id.widget_config_eur
    WidgetCurrency.USDT -> R.id.widget_config_usdt
  }

  private fun currencyFor(radioId: Int): WidgetCurrency = when (radioId) {
    R.id.widget_config_eur -> WidgetCurrency.EUR
    R.id.widget_config_usdt -> WidgetCurrency.USDT
    else -> WidgetCurrency.USD
  }
}
