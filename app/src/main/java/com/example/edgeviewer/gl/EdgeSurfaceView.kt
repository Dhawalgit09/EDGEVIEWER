package com.example.edgeviewer.gl

import android.content.Context
import android.opengl.GLSurfaceView
import android.util.AttributeSet

class EdgeSurfaceView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : GLSurfaceView(context, attrs) {

    private val renderer = EdgeRenderer()

    init {
        setEGLContextClientVersion(2)
        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY
    }

    fun updateFrame(data: ByteArray, width: Int, height: Int) {
        queueEvent {
            renderer.updateFrameData(data, width, height)
            requestRender()
        }
    }
}

