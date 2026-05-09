package com.implementsprint.mobile

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private val readinessEvaluator = ReleaseReadinessEvaluator()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val apiBaseUrlInput = findViewById<EditText>(R.id.apiBaseUrlInput)
        val environmentInput = findViewById<EditText>(R.id.environmentInput)
        val readinessStatusText = findViewById<TextView>(R.id.readinessStatusText)
        val validateButton = findViewById<Button>(R.id.validateButton)

        apiBaseUrlInput.setText(getString(R.string.default_api_base_url))
        environmentInput.setText(getString(R.string.default_environment))
        readinessStatusText.text = getString(R.string.readiness_idle_state)

        validateButton.setOnClickListener {
            val result =
                readinessEvaluator.evaluate(
                    apiBaseUrl = apiBaseUrlInput.text.toString(),
                    environment = environmentInput.text.toString(),
                )

            readinessStatusText.text =
                if (result.isReady) {
                    getString(R.string.readiness_ready_state)
                } else {
                    result.summary
                }
        }
    }
}
