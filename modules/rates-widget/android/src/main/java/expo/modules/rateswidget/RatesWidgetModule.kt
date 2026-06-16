package expo.modules.rateswidget

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RatesWidgetModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("RatesWidget")

    AsyncFunction("refreshWidgets") {
      RatesWidgetWorker.enqueueImmediate(context)
    }

    AsyncFunction("getCachedRates") {
      RatesWidgetRepository.getCachedRates(context)?.toMap()
    }
  }
}
