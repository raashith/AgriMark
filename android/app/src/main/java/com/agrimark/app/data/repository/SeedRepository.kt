package com.agrimark.app.data.repository

data class SeedVarietySummary(
    val varietyCode: String,
    val varietyName: String,
    val cropName: String,
    val producerName: String,
    val expectedYieldRange: String,
    val suitabilityScore: Double,
    val evidenceLevel: String
)

data class SeedAuthenticityResult(
    val batchNumber: String,
    val varietyCode: String,
    val producerName: String,
    val isAuthentic: Boolean,
    val certificationStatus: String,
    val riskStatus: String
)

class SeedRepository {
    fun getRecommendedVarieties(cropName: String): List<SeedVarietySummary> {
        return listOf(
            SeedVarietySummary(
                varietyCode = "VAR-PADDY-CR1009",
                varietyName = "CR 1009 Sub1 (Savitri Sub1)",
                cropName = cropName,
                producerName = "Tamil Nadu State Seed Development Agency",
                expectedYieldRange = "1800 - 2400 kg/acre (Expected Range)",
                suitabilityScore = 0.94,
                evidenceLevel = "VERIFIED"
            ),
            SeedVarietySummary(
                varietyCode = "VAR-COTTON-DCH32",
                varietyName = "DCH-32 Hybrid",
                cropName = "Cotton",
                producerName = "National Seeds Corporation",
                expectedYieldRange = "800 - 1200 kg/acre (Expected Range)",
                suitabilityScore = 0.88,
                evidenceLevel = "VERIFIED"
            )
        )
    }

    fun verifySeedBatch(batchNumber: String): SeedAuthenticityResult {
        val is authentic = !batchNumber.contains("FAKE")
        return SeedAuthenticityResult(
            batchNumber = batchNumber,
            varietyCode = "VAR-PADDY-CR1009",
            producerName = "Tamil Nadu State Seed Development Agency",
            isAuthentic = isAuthentic,
            certificationStatus = if (isAuthentic) "CERTIFIED" else "UNCERTIFIED",
            riskStatus = if (isAuthentic) "VERIFIED_VALID" else "RISK_FLAG"
        )
    }
}
