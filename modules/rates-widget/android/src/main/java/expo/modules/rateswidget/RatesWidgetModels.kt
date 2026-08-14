package expo.modules.rateswidget

data class WidgetRates(
  val usdBcv: Double,
  val eurBcv: Double,
  val usdtBinance: Double,
  val updatedAt: Long,
  val sourceUpdatedAt: String?,
  // Last value that actually DIFFERED from the current one, per currency, with the time
  // it was replaced. Not "the value 30 minutes ago": BCV moves about once a day, so a
  // per-fetch shift would show +0,00 almost always and say nothing.
  val previousUsdBcv: Double? = null,
  val previousEurBcv: Double? = null,
  val previousUsdtBinance: Double? = null,
  val previousUsdChangedAt: Long? = null,
  val previousEurChangedAt: Long? = null,
  val previousUsdtChangedAt: Long? = null
) {
  /**
   * Bridged to JS. Deliberately exposes only current values: iOS derives its own trend
   * from the widget timeline, so previous values never cross this boundary.
   */
  fun toMap(): Map<String, Any?> = mapOf(
    "usdBcv" to usdBcv,
    "eurBcv" to eurBcv,
    "usdtBinance" to usdtBinance,
    "updatedAt" to updatedAt,
    "sourceUpdatedAt" to sourceUpdatedAt
  )
}

/** A currency's movement between its previous and current value. */
data class WidgetTrend(
  val delta: Double,
  val percent: Double,
  val changedAt: Long?
) {
  val isUp: Boolean get() = delta > 0
  val isFlat: Boolean get() = delta == 0.0
}
