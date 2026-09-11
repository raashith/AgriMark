package com.agrimark.app.data.repository

data class FarmerROISummary(
    val farmerRef: String,
    val period: String,
    val baselineNetIncome: String,
    val currentNetIncome: String,
    val additionalIncome: String,
    val inputSavings: String,
    val avoidedLosses: String,
    val netBenefit: String,
    val roiRatio: String,
    val evidenceBadge: String,
    val confidenceScore: String
)

class OutcomesRepository {
    fun getFarmerROISummary(farmerRef: String): FarmerROISummary {
        return FarmerROISummary(
            farmerRef = farmerRef,
            period = "Kharif 2026",
            baselineNetIncome = "₹45,000",
            currentNetIncome = "₹62,500",
            additionalIncome = "₹17,500",
            inputSavings = "₹4,500",
            avoidedLosses = "₹6,000",
            netBenefit = "₹27,500",
            roiRatio = "55.0:1 ROI",
            evidenceBadge = "VERIFIED_OBSERVED",
            confidenceScore = "96%"
        )
    }
}
