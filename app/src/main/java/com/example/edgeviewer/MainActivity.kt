package com.example.edgeviewer

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.edgeviewer.databinding.ActivityMainBinding
import com.example.edgeviewer.camera.CameraController
import com.example.edgeviewer.camera.FrameAnalyzer
import com.example.edgeviewer.camera.ProcessedFrame
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var cameraController: CameraController

    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private var frameAnalyzer: FrameAnalyzer? = null

    @Volatile
    private var latestRaw: ByteArray? = null

    @Volatile
    private var latestProcessed: ByteArray? = null

    @Volatile
    private var frameWidth: Int = 0

    @Volatile
    private var frameHeight: Int = 0

    private var lastFrameTimeNs: Long = 0L

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                startCamera()
            } else {
                binding.frameStats.text = getString(R.string.frame_stats_placeholder)
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toggleMode.isEnabled = false
        binding.frameStats.text = getString(R.string.frame_stats_placeholder)

        binding.toggleMode.setOnCheckedChangeListener { _, _ ->
            renderLatestFrame()
        }
    }

    override fun onResume() {
        super.onResume()
        ensureCameraPermissionAndStart()
    }

    override fun onDestroy() {
        cameraExecutor.shutdown()
        super.onDestroy()
    }

    private fun ensureCameraPermissionAndStart() {
        when {
            ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED -> {
                startCamera()
            }

            shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }

            else -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun startCamera() {
        if (!::cameraController.isInitialized) {
            cameraController = CameraController(this, this, cameraExecutor)
        }
        if (frameAnalyzer == null) {
            frameAnalyzer = FrameAnalyzer { frame ->
                handleFrame(frame)
            }
        }
        cameraController.bindCameraAsync(
            previewSurfaceProvider = null,
            analyzer = frameAnalyzer!!
        ) { camera ->
            runOnUiThread {
                binding.toggleMode.isEnabled = camera != null
            }
        }
    }

    private fun handleFrame(frame: ProcessedFrame) {
        latestRaw = frame.rawRgba
        latestProcessed = frame.processedRgba
        frameWidth = frame.width
        frameHeight = frame.height
        updateStats(frame)
        renderLatestFrame()
    }

    private fun renderLatestFrame() {
        val raw = latestRaw
        val processed = latestProcessed
        if (raw == null || processed == null || frameWidth == 0 || frameHeight == 0) return

        val width = frameWidth
        val height = frameHeight
        binding.glView.post {
            val displayData = if (binding.toggleMode.isChecked) raw else processed
            binding.glView.updateFrame(displayData, width, height)
        }
    }

    private fun updateStats(frame: ProcessedFrame) {
        val now = frame.timestampNs
        if (lastFrameTimeNs == 0L) {
            lastFrameTimeNs = now
            return
        }
        val delta = now - lastFrameTimeNs
        lastFrameTimeNs = now
        val fps = if (delta > 0) 1_000_000_000f / delta.toFloat() else 0f
        runOnUiThread {
            binding.frameStats.text = getString(
                R.string.frame_stats_template,
                fps,
                frame.width,
                frame.height,
                if (binding.toggleMode.isChecked) getString(R.string.mode_raw) else getString(R.string.mode_edges)
            )
        }
    }
}