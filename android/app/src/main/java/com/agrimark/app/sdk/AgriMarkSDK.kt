package com.agrimark.app.sdk

/**
 * Android Kotlin AgriMark SDK Client (No privileged credentials stored).
 */
class AgriMarkSDK(private val sessionToken: String) {
    fun fetchPublicDatasets(): List<String> {
        return listOf("TN Crop Acreage 2025", "Salem Mandi Prices 2026")
    }

    fun submitPilotFeedback(pilotId: String, feedbackText: String): Boolean {
        return true
    }
}
