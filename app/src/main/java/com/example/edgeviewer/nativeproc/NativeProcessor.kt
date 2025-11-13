package com.example.edgeviewer.nativeproc

object NativeProcessor {

    init {
        System.loadLibrary("edgeviewer")
    }

    external fun processRgba(input: ByteArray, width: Int, height: Int): ByteArray
}

