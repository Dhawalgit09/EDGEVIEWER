package com.example.edgeviewer.camera

import android.content.Context
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
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

    fun bindCameraAsync(callback: CameraReadyCallback) {
        val providerFuture = ProcessCameraProvider.getInstance(context)
        providerFuture.addListener({
            try {
                val provider = providerFuture.get()
                provider.unbindAll()
                val camera = provider.bindToLifecycle(
                    lifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA
                )
                callback(camera)
            } catch (exception: Exception) {
                callback(null)
            }
        }, ContextCompat.getMainExecutor(context))
    }
}

