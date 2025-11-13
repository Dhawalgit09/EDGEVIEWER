package com.example.edgeviewer.camera

import android.content.Context
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.core.UseCase
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import java.util.concurrent.ExecutorService

typealias CameraReadyCallback = (Camera?) -> Unit

class CameraController(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    private val cameraExecutor: ExecutorService
) {

    fun bindCameraAsync(
        previewSurfaceProvider: Preview.SurfaceProvider?,
        analyzer: ImageAnalysis.Analyzer,
        callback: CameraReadyCallback
    ) {
        val providerFuture = ProcessCameraProvider.getInstance(context)
        providerFuture.addListener({
            try {
                val provider = providerFuture.get()
                provider.unbindAll()
                val useCases = mutableListOf<UseCase>()
                previewSurfaceProvider?.let { provider ->
                    val preview = Preview.Builder().build().apply {
                        setSurfaceProvider(provider)
                    }
                    useCases.add(preview)
                }
                val analysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                    .apply { setAnalyzer(cameraExecutor, analyzer) }
                useCases.add(analysis)
                val camera = provider.bindToLifecycle(
                    lifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    *useCases.toTypedArray()
                )
                callback(camera)
            } catch (exception: Exception) {
                callback(null)
            }
        }, ContextCompat.getMainExecutor(context))
    }
}

