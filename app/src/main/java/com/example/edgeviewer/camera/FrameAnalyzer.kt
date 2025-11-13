package com.example.edgeviewer.camera

import android.graphics.ImageFormat
import android.os.SystemClock
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.example.edgeviewer.nativeproc.NativeProcessor

data class ProcessedFrame(
    val rawRgba: ByteArray,
    val processedRgba: ByteArray,
    val width: Int,
    val height: Int,
    val timestampNs: Long
)

class FrameAnalyzer(
    private val onFrameAvailable: (ProcessedFrame) -> Unit
) : ImageAnalysis.Analyzer {

    override fun analyze(image: ImageProxy) {
        try {
            if (image.format != ImageFormat.YUV_420_888) {
                image.close()
                return
            }

            val rgba = YuvToRgbaConverter.convert(image)
            val processed = NativeProcessor.processRgba(rgba, image.width, image.height)
            val frame = ProcessedFrame(
                rawRgba = rgba,
                processedRgba = processed,
                width = image.width,
                height = image.height,
                timestampNs = SystemClock.elapsedRealtimeNanos()
            )
            onFrameAvailable(frame)
        } catch (exception: Exception) {
            // Swallow exceptions per frame to avoid stopping the analyzer
        } finally {
            image.close()
        }
    }
}

