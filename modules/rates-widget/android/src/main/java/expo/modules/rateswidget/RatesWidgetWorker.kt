package expo.modules.rateswidget

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

class RatesWidgetWorker(
  context: Context,
  workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {
  override suspend fun doWork(): Result {
    return try {
      withContext(Dispatchers.IO) {
        RatesWidgetRepository.fetchAndCacheRates(applicationContext)
      }
      WidgetRenderers.renderAll(applicationContext)
      Result.success()
    } catch (_: Exception) {
      WidgetRenderers.renderAll(applicationContext, hasError = true)
      Result.retry()
    }
  }

  companion object {
    private const val IMMEDIATE_WORK_NAME = "cambialy_rates_widget_refresh"
    private const val PERIODIC_WORK_NAME = "cambialy_rates_widget_periodic_refresh"

    private val networkConstraints = Constraints.Builder()
      .setRequiredNetworkType(NetworkType.CONNECTED)
      .build()

    fun enqueueImmediate(context: Context) {
      val request = OneTimeWorkRequestBuilder<RatesWidgetWorker>()
        .setConstraints(networkConstraints)
        .build()

      WorkManager.getInstance(context.applicationContext)
        .enqueueUniqueWork(IMMEDIATE_WORK_NAME, ExistingWorkPolicy.REPLACE, request)
    }

    fun enqueuePeriodic(context: Context) {
      val request = PeriodicWorkRequestBuilder<RatesWidgetWorker>(30, TimeUnit.MINUTES)
        .setConstraints(networkConstraints)
        .build()

      WorkManager.getInstance(context.applicationContext)
        .enqueueUniquePeriodicWork(PERIODIC_WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request)
    }
  }
}
