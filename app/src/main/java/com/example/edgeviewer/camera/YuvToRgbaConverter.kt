package com.example.edgeviewer.camera

import androidx.camera.core.ImageProxy

object YuvToRgbaConverter {

    fun convert(image: ImageProxy): ByteArray {
        val width = image.width
        val height = image.height
        val yPlane = image.planes[0]
        val uPlane = image.planes[1]
        val vPlane = image.planes[2]

        val yBuffer = yPlane.buffer
        val uBuffer = uPlane.buffer
        val vBuffer = vPlane.buffer

        val yRowStride = yPlane.rowStride
        val uvRowStride = uPlane.rowStride
        val uvPixelStride = uPlane.pixelStride

        val output = ByteArray(width * height * 4)

        val yArray = ByteArray(yBuffer.remaining())
        yBuffer.get(yArray)
        yBuffer.rewind()

        val uArray = ByteArray(uBuffer.remaining())
        uBuffer.get(uArray)
        uBuffer.rewind()

        val vArray = ByteArray(vBuffer.remaining())
        vBuffer.get(vArray)
        vBuffer.rewind()

        var outputOffset = 0
        for (row in 0 until height) {
            val yRowOffset = yRowStride * row
            val uvRowOffset = uvRowStride * (row / 2)
            for (col in 0 until width) {
                val yValue = (yArray[yRowOffset + col].toInt() and 0xFF)
                val uvOffset = uvRowOffset + (col / 2) * uvPixelStride
                val uValue = (uArray[uvOffset].toInt() and 0xFF) - 128
                val vValue = (vArray[uvOffset].toInt() and 0xFF) - 128

                val r = clamp(yValue + (1.370705f * vValue).toInt())
                val g = clamp(yValue - (0.337633f * uValue + 0.698001f * vValue).toInt())
                val b = clamp(yValue + (1.732446f * uValue).toInt())

                output[outputOffset++] = r.toByte()
                output[outputOffset++] = g.toByte()
                output[outputOffset++] = b.toByte()
                output[outputOffset++] = 0xFF.toByte()
            }
        }

        return output
    }

    private fun clamp(value: Int): Int = value.coerceIn(0, 255)
}

