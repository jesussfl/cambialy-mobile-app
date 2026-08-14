package expo.modules.rateswidget

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import kotlin.math.abs

object RatesWidgetRepository {
  private const val PREFS_NAME = "cambialy_rates_widget"
  private const val KEY_USD_BCV = "usd_bcv"
  private const val KEY_EUR_BCV = "eur_bcv"
  private const val KEY_USDT_BINANCE = "usdt_binance"
  private const val KEY_UPDATED_AT = "updated_at"
  private const val KEY_SOURCE_UPDATED_AT = "source_updated_at"

  private const val KEY_PREV_USD_BCV = "prev_usd_bcv"
  private const val KEY_PREV_EUR_BCV = "prev_eur_bcv"
  private const val KEY_PREV_USDT_BINANCE = "prev_usdt_binance"
  private const val KEY_PREV_USD_AT = "prev_usd_at"
  private const val KEY_PREV_EUR_AT = "prev_eur_at"
  private const val KEY_PREV_USDT_AT = "prev_usdt_at"

  /**
   * Injected at build time from EXPO_PUBLIC_API_URL (see plugins/withRatesWidgetApiUrl.js).
   * Never branch on package name here: the app, the iOS widget and this widget must
   * always resolve the same backend, and a hardcoded host cannot follow .env.
   */
  private val baseUrl: String
    get() = BuildConfig.RATES_API_BASE_URL.trimEnd('/')

  fun getCachedRates(context: Context): WidgetRates? {
    val prefs = prefs(context)
    if (!prefs.contains(KEY_USD_BCV) || !prefs.contains(KEY_EUR_BCV) || !prefs.contains(KEY_USDT_BINANCE)) {
      return null
    }

    return WidgetRates(
      usdBcv = Double.fromBits(prefs.getLong(KEY_USD_BCV, 0L)),
      eurBcv = Double.fromBits(prefs.getLong(KEY_EUR_BCV, 0L)),
      usdtBinance = Double.fromBits(prefs.getLong(KEY_USDT_BINANCE, 0L)),
      updatedAt = prefs.getLong(KEY_UPDATED_AT, 0L),
      sourceUpdatedAt = prefs.getString(KEY_SOURCE_UPDATED_AT, null),
      previousUsdBcv = prefs.optDouble(KEY_PREV_USD_BCV),
      previousEurBcv = prefs.optDouble(KEY_PREV_EUR_BCV),
      previousUsdtBinance = prefs.optDouble(KEY_PREV_USDT_BINANCE),
      previousUsdChangedAt = prefs.optLong(KEY_PREV_USD_AT),
      previousEurChangedAt = prefs.optLong(KEY_PREV_EUR_AT),
      previousUsdtChangedAt = prefs.optLong(KEY_PREV_USDT_AT)
    )
  }

  fun fetchAndCacheRates(context: Context): WidgetRates {
    val usdPayload = fetchJson("$baseUrl/rates/usd")
    val eurPayload = fetchJson("$baseUrl/rates/eur")
    val usdtPayload = fetchJson("$baseUrl/rates/usdt")

    val usdBcv = extractRate(usdPayload, "USD")
    val eurBcv = extractRate(eurPayload, "EUR")
    val usdtBinance = extractRate(usdtPayload, "USDT")
    val now = System.currentTimeMillis()

    val cached = getCachedRates(context)

    // A rate only becomes "previous" when it is actually superseded by a different
    // value, so the trend keeps describing the last real move instead of resetting to
    // zero on every 30-minute poll.
    val usdPrevious = carryPrevious(cached?.usdBcv, usdBcv, cached?.previousUsdBcv, cached?.previousUsdChangedAt, now)
    val eurPrevious = carryPrevious(cached?.eurBcv, eurBcv, cached?.previousEurBcv, cached?.previousEurChangedAt, now)
    val usdtPrevious = carryPrevious(cached?.usdtBinance, usdtBinance, cached?.previousUsdtBinance, cached?.previousUsdtChangedAt, now)

    val rates = WidgetRates(
      usdBcv = usdBcv,
      eurBcv = eurBcv,
      usdtBinance = usdtBinance,
      updatedAt = now,
      sourceUpdatedAt = usdPayload.optString("last_updated").ifBlank {
        usdtPayload.optString("last_updated").ifBlank { null }
      },
      previousUsdBcv = usdPrevious?.first,
      previousEurBcv = eurPrevious?.first,
      previousUsdtBinance = usdtPrevious?.first,
      previousUsdChangedAt = usdPrevious?.second,
      previousEurChangedAt = eurPrevious?.second,
      previousUsdtChangedAt = usdtPrevious?.second
    )

    prefs(context).edit().apply {
      putLong(KEY_USD_BCV, rates.usdBcv.toBits())
      putLong(KEY_EUR_BCV, rates.eurBcv.toBits())
      putLong(KEY_USDT_BINANCE, rates.usdtBinance.toBits())
      putLong(KEY_UPDATED_AT, rates.updatedAt)
      putString(KEY_SOURCE_UPDATED_AT, rates.sourceUpdatedAt)
      putOptDouble(KEY_PREV_USD_BCV, rates.previousUsdBcv)
      putOptDouble(KEY_PREV_EUR_BCV, rates.previousEurBcv)
      putOptDouble(KEY_PREV_USDT_BINANCE, rates.previousUsdtBinance)
      putOptLong(KEY_PREV_USD_AT, rates.previousUsdChangedAt)
      putOptLong(KEY_PREV_EUR_AT, rates.previousEurChangedAt)
      putOptLong(KEY_PREV_USDT_AT, rates.previousUsdtChangedAt)
      apply()
    }

    return rates
  }

  /** Returns the movement for [currency], or null when there is nothing to compare against. */
  fun trendFor(rates: WidgetRates, currency: WidgetCurrency): WidgetTrend? {
    val previous = currency.previousValue(rates) ?: return null
    val current = currency.currentValue(rates)

    if (!previous.isFinite() || previous == 0.0 || !current.isFinite()) {
      return null
    }

    val delta = current - previous

    return WidgetTrend(
      delta = delta,
      percent = delta / previous * 100.0,
      changedAt = currency.previousChangedAt(rates)
    )
  }

  fun formatRate(value: Double): String = String.format(Locale.US, "Bs. %,.2f", value)

  /** Digits only, for layouts that render the "Bs." unit as a separate view. */
  fun formatAmount(value: Double): String = String.format(Locale.US, "%,.2f", value)

  fun formatDelta(trend: WidgetTrend): String {
    val sign = if (trend.delta > 0) "+" else if (trend.delta < 0) "-" else ""
    return String.format(Locale.US, "%s%,.2f", sign, abs(trend.delta))
  }

  fun formatPercent(trend: WidgetTrend): String {
    val sign = if (trend.percent > 0) "+" else if (trend.percent < 0) "-" else ""
    return String.format(Locale.US, "%s%.2f%%", sign, abs(trend.percent))
  }

  fun formatTime(timestamp: Long): String {
    if (timestamp <= 0L) return ""
    val sdf = java.text.SimpleDateFormat("hh:mm a", Locale.getDefault())
    return sdf.format(java.util.Date(timestamp))
  }

  fun formatDateTime(timestamp: Long): String {
    if (timestamp <= 0L) return ""
    val sdf = java.text.SimpleDateFormat("d MMM, hh:mm a", Locale.getDefault())
    return sdf.format(java.util.Date(timestamp))
  }

  private fun prefs(context: Context): SharedPreferences =
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  /**
   * Decides what to carry forward as the previous value.
   * Returns value-to-store paired with the moment it was superseded.
   */
  private fun carryPrevious(
    cachedValue: Double?,
    nextValue: Double,
    existingPrevious: Double?,
    existingPreviousAt: Long?,
    now: Long
  ): Pair<Double, Long>? {
    if (cachedValue != null && cachedValue.isFinite() && cachedValue != nextValue) {
      return cachedValue to now
    }

    if (existingPrevious != null) {
      return existingPrevious to (existingPreviousAt ?: now)
    }

    return null
  }

  private fun SharedPreferences.optDouble(key: String): Double? =
    if (contains(key)) Double.fromBits(getLong(key, 0L)) else null

  private fun SharedPreferences.optLong(key: String): Long? =
    if (contains(key)) getLong(key, 0L) else null

  private fun SharedPreferences.Editor.putOptDouble(key: String, value: Double?) {
    if (value == null) remove(key) else putLong(key, value.toBits())
  }

  private fun SharedPreferences.Editor.putOptLong(key: String, value: Long?) {
    if (value == null) remove(key) else putLong(key, value)
  }

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

  private fun extractRate(json: JSONObject, currencyName: String): Double {
    if (json.has("rate_value")) {
      val value = json.getDouble("rate_value")
      if (value.isFinite()) return value
    }
    if (json.has("rates")) {
      val ratesObj = json.getJSONObject("rates")
      val value = ratesObj.getDouble(currencyName)
      if (value.isFinite()) return value
    }
    throw IllegalStateException("Invalid rate for $currencyName")
  }
}
