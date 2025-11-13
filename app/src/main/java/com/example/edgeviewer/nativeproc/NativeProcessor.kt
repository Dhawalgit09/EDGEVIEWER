package com.example.edgeviewer.nativeproc

import android.util.Log

object NativeProcessor {

    private const val TAG = "NativeProcessor"

    init {
        try {
            // Try to load libc++_shared first (required by OpenCV)
            // This should be in jniLibs if copied from OpenCV SDK
            try {
                System.loadLibrary("c++_shared")
                Log.d(TAG, "Loaded libc++_shared successfully")
            } catch (e: UnsatisfiedLinkError) {
                Log.w(TAG, "libc++_shared not found, trying to continue anyway", e)
                // Continue - might be available system-wide on some devices
            }
            
            // Load our native library (which depends on OpenCV)
            System.loadLibrary("edgeviewer")
            Log.d(TAG, "Loaded edgeviewer native library successfully")
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "Failed to load native library", e)
            throw e
        }
    }

    external fun processRgba(input: ByteArray, width: Int, height: Int): ByteArray

    external fun setEdgeParameters(lowThreshold: Double, highThreshold: Double, blurRadius: Int, equalizeHistogram: Boolean)
}

