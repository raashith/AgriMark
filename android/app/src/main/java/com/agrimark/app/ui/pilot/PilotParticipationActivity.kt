package com.agrimark.app.ui.pilot

import com.agrimark.app.data.repository.PilotRepository

/**
 * Android Farmer Living Lab & Field Pilot Participation UI (Tamil + English Support).
 * Allows farmers to view field pilot participation, consent to innovations, submit feedback,
 * and access trust information.
 */
class PilotParticipationActivity {
    private val repository = PilotRepository()

    fun renderPilotScreen(farmerRef: String): String {
        val pilots = repository.getActivePilotsForFarmer(farmerRef)

        val sb = StringBuilder()
        sb.append("=========================================\n")
        sb.append("AGRIMARK - FIELD PILOT PARTICIPATION\n")
        sb.append("கள ஆய்வு மற்றும் கண்டுபிடிப்பு பங்கேற்பு\n")
        sb.append("=========================================\n\n")

        for (pilot in pilots) {
            sb.append("1. LIVING LAB PILOT (கள ஆய்வு விவரம்):\n")
            sb.append("   • Lab: ${pilot.labName}\n")
            sb.append("   • Innovation: ${pilot.innovationTitle}\n")
            sb.append("   • Sponsor: ${pilot.sponsorName}\n")
            sb.append("   • Consent Granted: ${if (pilot.consentGranted) "YES (சம்மதம் அளிக்கப்பட்டுள்ளது)" else "NO"}\n\n")
        }

        sb.append("2. PILOT CONTROLS & FEEDBACK (கருத்து மற்றும் கட்டுப்பாடு):\n")
        sb.append("   [Submit Photo Feedback / புகைப்பட கருத்து அனுப்பு]\n")
        sb.append("   [View Trust Score / நம்பகத்தன்மை மதிப்பெண்]\n")
        sb.append("   [Withdraw from Pilot / ஆய்விலிருந்து விலகு]\n")

        return sb.toString()
    }
}
