package expo.modules.rateswidget

import android.content.Context
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

object RatesWidgetRepository {
  private const val PREFS_NAME = "cambialy_rates_widget"
  private const val KEY_USD_BCV = "usd_bcv"
  private const val KEY_EUR_BCV = "eur_bcv"
  private const val KEY_USDT_BINANCE = "usdt_binance"
  private const val KEY_UPDATED_AT = "updated_at"
  private const val KEY_SOURCE_UPDATED_AT = "source_updated_at"

  private const val BCV_ENDPOINT = "https://ahorrave-api.onrender.com/api/v1/rates/bcv"
  private const val BINANCE_ENDPOINT = "https://ahorrave-api.onrender.com/api/v1/rates/binance"

  fun getCachedRates(context: Context): WidgetRates? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (!prefs.contains(KEY_USD_BCV) || !prefs.contains(KEY_EUR_BCV) || !prefs.contains(KEY_USDT_BINANCE)) {
      return null
    }

    return WidgetRates(
      usdBcv = Double.fromBits(prefs.getLong(KEY_USD_BCV, 0L)),
      eurBcv = Double.fromBits(prefs.getLong(KEY_EUR_BCV, 0L)),
      usdtBinance = Double.fromBits(prefs.getLong(KEY_USDT_BINANCE, 0L)),
      updatedAt = prefs.getLong(KEY_UPDATED_AT, 0L),
      sourceUpdatedAt = prefs.getString(KEY_SOURCE_UPDATED_AT, null)
    )
  }

  fun fetchAndCacheRates(context: Context): WidgetRates {
    val bcvPayload = fetchJson(BCV_ENDPOINT)
    val binancePayload = fetchJson(BINANCE_ENDPOINT)
    val bcvRates = bcvPayload.getJSONObject("rates")
    val binanceRates = binancePayload.getJSONObject("rates")

    val rates = WidgetRates(
      usdBcv = bcvRates.getFiniteDouble("USD"),
      eurBcv = bcvRates.getFiniteDouble("EUR"),
      usdtBinance = binanceRates.getFiniteDouble("USD"),
      updatedAt = System.currentTimeMillis(),
      sourceUpdatedAt = bcvPayload.optString("last_updated").ifBlank {
        binancePayload.optString("last_updated").ifBlank { null }
      }
    )

    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putLong(KEY_USD_BCV, rates.usdBcv.toBits())
      .putLong(KEY_EUR_BCV, rates.eurBcv.toBits())
      .putLong(KEY_USDT_BINANCE, rates.usdtBinance.toBits())
      .putLong(KEY_UPDATED_AT, rates.updatedAt)
      .putString(KEY_SOURCE_UPDATED_AT, rates.sourceUpdatedAt)
      .apply()

    return rates
  }

  fun formatRate(value: Double): String = String.format(Locale.US, "Bs. %,.2f", value)

  private fun fetchJson(url: String): JSONObject {
    val connection = (URL(url).openConnection() as HttpURLConnection).apply {
      requestMethod = "GET"
      connectTimeout = 10_000
      readTimeout = 10_000
      setRequestProperty("Accept", "application/json")
    }

    try {
      val responseCode = connection.responseCode
      val stream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
      val body = BufferedReader(InputStreamReader(stream)).use { reader ->
        reader.readText()
      }

      if (responseCode !in 200..299) {
        throw IllegalStateException("Request failed with HTTP $responseCode")
      }

      return JSONObject(body)
    } finally {
      connection.disconnect()
    }
  }

  private fun JSONObject.getFiniteDouble(name: String): Double {
    val value = getDouble(name)
    if (!value.isFinite()) {
      throw IllegalStateException("Invalid rate for $name")
    }
    return value
  }
}
