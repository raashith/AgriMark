package com.agrimark.app.ui.outcomes

import com.agrimark.app.data.repository.OutcomesRepository

/**
 * Android Farmer Outcome & ROI Screen (Tamil + English Support).
 * Large readable numbers, offline-first caching, displaying verifiable economic metrics.
 */
class FarmerOutcomesActivity {
    private val repository = OutcomesRepository()

    fun renderOutcomesScreen(farmerRef: String): String {
        val roi = repository.getFarmerROISummary(farmerRef)

        val sb = StringBuilder()
        sb.append("=========================================\n")
        sb.append("AGRIMARK - MY FARM ECONOMICS & ROI\n")
        sb.append("என் பண்ணை பொருளாதாரம் மற்றும் லாபம்\n")
        sb.append("=========================================\n\n")

        sb.append("SEASON: ${roi.period}\n\n")

        sb.append("1. INCOME COMPARISON (வருமான ஒப்பீடு):\n")
        sb.append("   • Baseline Net Income (முந்தைய நிகர வருமானம்): ${roi.baselineNetIncome}\n")
        sb.append("   • Current Net Income (தற்போதைய நிகர வருமானம்): ${roi.currentNetIncome}\n")
        sb.append("   ★ ADDITIONAL INCOME (கூடுதல் வருமானம்): ${roi.additionalIncome}\n\n")

        sb.append("2. BENEFIT BREAKDOWN (லாப விவரங்கள்):\n")
        sb.append("   • Input Savings (செலவு சேமிப்பு): ${roi.inputSavings}\n")
        sb.append("   • Avoided Loss (தவிர்க்கப்பட்ட இழப்பு): ${roi.avoidedLosses}\n")
        sb.append("   ★ NET BENEFIT (மொத்த நிகர லாபம்): ${roi.netBenefit}\n")
        sb.append("   ★ RETURN ON INVESTMENT (முதலீட்டு லாப விகிதம்): ${roi.roiRatio}\n\n")

        sb.append("3. EVIDENCE & CONFIDENCE (நம்பகத்தன்மை சான்று):\n")
        sb.append("   • Evidence Level: ${roi.evidenceBadge}\n")
        sb.append("   • Confidence Score: ${roi.confidenceScore}\n")

        return sb.toString()
    }
}
