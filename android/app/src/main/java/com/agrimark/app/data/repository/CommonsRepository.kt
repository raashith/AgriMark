package com.agrimark.app.data.repository

data class FarmerDataProfile(
    val farmerRef: String,
    val name: String,
    val village: String,
    val district: String,
    val primaryCrops: List<String>
)

data class AccessAuditLog(
    val consumerName: String,
    val purpose: String,
    val accessedAt: String,
    val fieldsAccessed: List<String>
)

class CommonsRepository {
    fun getFarmerProfile(farmerRef: String): FarmerDataProfile {
        return FarmerDataProfile(
            farmerRef = farmerRef,
            name = "Murugan K. (முருகன்)",
            village = "Attur (ஆத்தூர்)",
            district = "Salem",
            primaryCrops = listOf("Tomato (தக்காளி)", "Paddy (நெல்)")
        )
    }

    fun getAccessHistory(farmerRef: String): List<AccessAuditLog> {
        return listOf(
            AccessAuditLog(
                consumerName = "AgriMark Advisory Engine (ஆலோசனை)",
                purpose = "ADVISORY",
                accessedAt = "2026-09-10 14:30",
                fieldsAccessed = listOf("crop_name", "soil_type", "district")
            ),
            AccessAuditLog(
                consumerName = "AgriBank Finance (கடன் சேவை)",
                purpose = "CREDIT",
                accessedAt = "2026-09-08 10:15",
                fieldsAccessed = listOf("farm_size_acres", "historical_yield")
            )
        )
    }
}
