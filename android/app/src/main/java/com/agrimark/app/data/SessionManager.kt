package com.agrimark.app.data

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "agrimark_session_prefs"
        private const val KEY_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_AUTH_USER_ID = "auth_user_id"
        private const val KEY_ROLE = "user_role"
        private const val KEY_FULL_NAME = "full_name"
    }

    fun saveSession(
        accessToken: String,
        refreshToken: String?,
        userId: String,
        authUserId: String?,
        role: String,
        fullName: String
    ) {
        prefs.edit().apply {
            putString(KEY_TOKEN, accessToken)
            putString(KEY_REFRESH_TOKEN, refreshToken)
            putString(KEY_USER_ID, userId)
            putString(KEY_AUTH_USER_ID, authUserId)
            putString(KEY_ROLE, role)
            putString(KEY_FULL_NAME, fullName)
            apply()
        }
    }

    fun fetchAuthToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun fetchRefreshToken(): String? {
        return prefs.getString(KEY_REFRESH_TOKEN, null)
    }

    fun fetchUserRole(): String? {
        return prefs.getString(KEY_ROLE, null)
    }

    fun fetchUserId(): String? {
        return prefs.getString(KEY_USER_ID, null)
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
