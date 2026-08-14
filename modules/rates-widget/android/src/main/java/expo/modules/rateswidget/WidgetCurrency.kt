package expo.modules.rateswidget

/**
 * The currencies a configurable widget can be pointed at.
 *
 * Owns both its identity and how to read itself out of [WidgetRates], so adding a
 * currency is one enum case plus its string resources — no provider changes.
 *
 * [id] is persisted in SharedPreferences and must match the enum `value` declared for
 * the iOS widget configuration in app.config.ts, so both platforms speak one vocabulary.
 */
enum class WidgetCurrency(
  val id: String,
  val tickerRes: Int,
  val sourceRes: Int,
  val badgeBackgroundRes: Int,
  val badgeTextColorRes: Int
) {
  USD(
    id = "usd",
    tickerRes = R.string.widget_ticker_usd,
    sourceRes = R.string.widget_source_bcv,
    badgeBackgroundRes = R.drawable.rates_widget_badge_usd,
    badgeTextColorRes = R.color.rates_widget_badge_usd_text
  ),
  EUR(
    id = "eur",
    tickerRes = R.string.widget_ticker_eur,
    sourceRes = R.string.widget_source_bcv,
    badgeBackgroundRes = R.drawable.rates_widget_badge_eur,
    badgeTextColorRes = R.color.rates_widget_badge_eur_text
  ),
  USDT(
    id = "usdt",
    tickerRes = R.string.widget_ticker_usdt,
    sourceRes = R.string.widget_source_binance,
    badgeBackgroundRes = R.drawable.rates_widget_badge_usdt,
    badgeTextColorRes = R.color.rates_widget_badge_usdt_text
  );

  fun currentValue(rates: WidgetRates): Double = when (this) {
    USD -> rates.usdBcv
    EUR -> rates.eurBcv
    USDT -> rates.usdtBinance
  }

  fun previousValue(rates: WidgetRates): Double? = when (this) {
    USD -> rates.previousUsdBcv
    EUR -> rates.previousEurBcv
    USDT -> rates.previousUsdtBinance
  }

  fun previousChangedAt(rates: WidgetRates): Long? = when (this) {
    USD -> rates.previousUsdChangedAt
    EUR -> rates.previousEurChangedAt
    USDT -> rates.previousUsdtChangedAt
  }

  companion object {
    /** Falls back to USD rather than throwing: a widget must always render something. */
    fun fromId(id: String?): WidgetCurrency = entries.firstOrNull { it.id == id } ?: USD
  }
}
