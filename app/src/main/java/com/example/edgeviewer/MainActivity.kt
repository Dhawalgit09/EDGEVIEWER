package com.example.edgeviewer

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.edgeviewer.R
import com.example.edgeviewer.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toggleMode.isEnabled = false
        binding.frameStats.text = getString(R.string.frame_stats_placeholder)
    }
}