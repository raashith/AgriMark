package com.agrimark.app.ui.commons

import com.agrimark.app.data.repository.CommonsRepository
import com.agrimark.app.data.repository.FarmerDataProfile
import com.agrimark.app.data.repository.AccessAuditLog

/**
 * Android Farmer My Data & Privacy Workspace (Tamil + English Support).
 * Allows farmers to:
 * - View their personal & farm data elements
 * - Inspect who accessed their data and for what purpose
 * - Withdraw or grant consent
 * - Request data export or eligible deletion
 */
class MyDataPrivacyActivity {
    private val repository = CommonsRepository()

    fun renderMyDataScreen(farmerRef: String): String {
        val profile = repository.getFarmerProfile(farmerRef)
        val history = repository.getAccessHistory(farmerRef)

        val sb = StringBuilder()
        sb.append("=========================================\n")
        sb.append("AGRIMARK - MY DATA & PRIVACY CENTER\n")
        sb.append("என் தரவு மற்றும் தனியுரிமை மையம்\n")
        sb.append("=========================================\n\n")

        sb.append("1. FARMER PROFILE (விவசாயி சுயவிவரம்):\n")
        sb.append("   - Name: ${profile.name}\n")
        sb.append("   - Location: ${profile.village}, ${profile.district}\n")
        sb.append("   - Crops: ${profile.primaryCrops.joinToString(", ")}\n\n")

        sb.append("2. WHO ACCESSED MY DATA? (யார் என் தரவை அணுகினர்?):\n")
        for (log in history) {
            sb.append("   • ${log.consumerName}\n")
            sb.append("     Purpose: ${log.purpose} | Date: ${log.accessedAt}\n")
            sb.append("     Fields: ${log.fieldsAccessed.joinToString(", ")}\n")
        }

        sb.append("\n3. FARMER PRIVACY CONTROLS (தரவு உரிமைகள்):\n")
        sb.append("   [Withdraw Consent / சம்மதத்தை திரும்ப்பெறு]\n")
        sb.append("   [Export My Data / தரவை பதிவிறக்கு (JSON/CSV)]\n")
        sb.append("   [Request Correction / திருத்தம் கோரு]\n")
        sb.append("   [Delete Data / தரவை நீக்கு கோரிக்கை]\n")

        return sb.toString()
    }
}
