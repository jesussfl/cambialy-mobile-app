package expo.modules.rateswidget

data class WidgetRates(
  val usdBcv: Double,
  val eurBcv: Double,
  val usdtBinance: Double,
  val updatedAt: Long,
  val sourceUpdatedAt: String?
) {
  fun toMap(): Map<String, Any?> = mapOf(
    "usdBcv" to usdBcv,
    "eurBcv" to eurBcv,
    "usdtBinance" to usdtBinance,
    "updatedAt" to updatedAt,
    "sourceUpdatedAt" to sourceUpdatedAt
  )
}
