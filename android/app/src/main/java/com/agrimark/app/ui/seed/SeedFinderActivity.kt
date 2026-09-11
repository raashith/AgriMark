package com.agrimark.app.ui.seed

import com.agrimark.app.data.repository.SeedRepository

/**
 * Android Farmer Seed Finder & Authenticity Verification Screen (Tamil + English Support).
 */
class SeedFinderActivity {
    private val repository = SeedRepository()

    fun renderSeedFinderScreen(cropName: String): String {
        val recommendations = repository.getRecommendedVarieties(cropName)

        val sb = StringBuilder()
        sb.append("=========================================\n")
        sb.append("AGRIMARK - SEED FINDER & VARIETY SELECTOR\n")
        sb.append("விதை தேடல் மற்றும் ரகத் தேர்வு\n")
        sb.append("=========================================\n\n")

        sb.append("RECOMMENDED VARIETIES FOR $cropName (பரிந்துரைக்கப்பட்ட ரகங்கள்):\n\n")
        for ((idx, item) in recommendations.withIndex()) {
            sb.append("${idx + 1}. ${item.varietyName} (${item.varietyCode})\n")
            sb.append("   • Producer (உற்பத்தியாளர்): ${item.producerName}\n")
            sb.append("   • Expected Yield (எதிர்பார்க்கப்படும் மகசூல்): ${item.expectedYieldRange}\n")
            sb.append("   ★ Suitability Score (பொருத்தம்): ${(item.suitabilityScore * 100).toInt()}%\n")
            sb.append("   • Evidence Level: ${item.evidenceLevel}\n\n")
        }

        sb.append("SEED AUTHENTICITY QR SCANNER (விதை உண்மைத்தன்மை சரிபார்ப்பு):\n")
        sb.append("Scan QR code on seed bag to verify certificate and origin batch.\n")
        return sb.toString()
    }
}
