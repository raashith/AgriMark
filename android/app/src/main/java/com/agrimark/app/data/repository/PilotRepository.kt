package com.agrimark.app.data.repository

data class PilotCohortInfo(
    val pilotId: String,
    val labName: String,
    val innovationTitle: String,
    val sponsorName: String,
    val consentGranted: Boolean
)

class PilotRepository {
    fun getActivePilotsForFarmer(farmerRef: String): List<PilotCohortInfo> {
        return listOf(
            PilotCohortInfo(
                pilotId = "PILOT-SLM-001",
                labName = "Salem Precision Horticulture Living Lab (சேலம் கள ஆய்வு)",
                innovationTitle = "AI Pest Early Detection Mobile App (பூச்சி நோய் கண்டறிதல் செயலி)",
                sponsorName = "TNAU Research & Agri-Tech Mission",
                consentGranted = true
            )
        )
    }
}
