package com.example.edgeviewer.nativeproc

object NativeProcessor {

    init {
        System.loadLibrary("edgeviewer")
    }

    external fun processRgba(input: ByteArray, width: Int, height: Int): ByteArray

    external fun setEdgeParameters(lowThreshold: Double, highThreshold: Double, blurRadius: Int, equalizeHistogram: Boolean)
}

