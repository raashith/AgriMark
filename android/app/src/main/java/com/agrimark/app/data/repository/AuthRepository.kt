package com.agrimark.app.data.repository

import com.agrimark.app.data.SessionManager
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class AuthRepository(private val baseUrl: String, private val sessionManager: SessionManager) {

    fun login(phoneOrEmail: String, pass: String): Result<JSONObject> {
        return try {
            val url = URL("$baseUrl/api/v1/auth/login")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val jsonBody = JSONObject().apply {
                put("phone_or_email", phoneOrEmail)
                put("password", pass)
            }

            OutputStreamWriter(conn.outputStream).use { it.write(jsonBody.toString()) }

            val responseCode = conn.responseCode
            val isSuccess = responseCode in 200..299
            val stream = if (isSuccess) conn.inputStream else conn.errorStream
            val responseStr = BufferedReader(InputStreamReader(stream)).readText()

            val jsonResp = JSONObject(responseStr)
            if (isSuccess) {
                val token = jsonResp.getString("access_token")
                val refreshToken = jsonResp.optString("refresh_token", "")
                val userObj = jsonResp.getJSONObject("user")

                sessionManager.saveSession(
                    accessToken = token,
                    refreshToken = refreshToken,
                    userId = userObj.getString("application_user_id"),
                    authUserId = userObj.optString("auth_user_id"),
                    role = userObj.getString("role"),
                    fullName = userObj.getString("full_name")
                )
                Result.success(jsonResp)
            } else {
                val detail = jsonResp.optString("detail", "Authentication failed")
                Result.failure(Exception(detail))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun register(
        fullName: String,
        phone: String,
        email: String?,
        pass: String,
        roleName: String
    ): Result<JSONObject> {
        return try {
            val url = URL("$baseUrl/api/v1/auth/register")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val jsonBody = JSONObject().apply {
                put("full_name", fullName)
                put("phone", phone)
                if (!email.isNull_or_empty()) put("email", email)
                put("password", pass)
                put("role_name", roleName)
            }

            OutputStreamWriter(conn.outputStream).use { it.write(jsonBody.toString()) }

            val responseCode = conn.responseCode
            val isSuccess = responseCode in 200..299
            val stream = if (isSuccess) conn.inputStream else conn.errorStream
            val responseStr = BufferedReader(InputStreamReader(stream)).readText()

            val jsonResp = JSONObject(responseStr)
            if (isSuccess) {
                val token = jsonResp.getString("access_token")
                val refreshToken = jsonResp.optString("refresh_token", "")
                val userObj = jsonResp.getJSONObject("user")

                sessionManager.saveSession(
                    accessToken = token,
                    refreshToken = refreshToken,
                    userId = userObj.getString("application_user_id"),
                    authUserId = userObj.optString("auth_user_id"),
                    role = userObj.getString("role"),
                    fullName = userObj.getString("full_name")
                )
                Result.success(jsonResp)
            } else {
                val detail = jsonResp.optString("detail", "Registration failed")
                Result.failure(Exception(detail))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun fetchMe(): Result<JSONObject> {
        return try {
            val token = sessionManager.fetchAuthToken() ?: return Result.failure(Exception("No active token"))
            val url = URL("$baseUrl/api/v1/auth/me")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.setRequestProperty("Authorization", "Bearer $token")

            val responseCode = conn.responseCode
            val isSuccess = responseCode in 200..299
            val stream = if (isSuccess) conn.inputStream else conn.errorStream
            val responseStr = BufferedReader(InputStreamReader(stream)).readText()

            if (isSuccess) {
                Result.success(JSONObject(responseStr))
            } else {
                sessionManager.clearSession()
                Result.failure(Exception("Unauthorized"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        try {
            val token = sessionManager.fetchAuthToken()
            if (token != null) {
                val url = URL("$baseUrl/api/v1/auth/logout")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Authorization", "Bearer $token")
                conn.responseCode
            }
        } catch (ignored: Exception) {
        } finally {
            sessionManager.clearSession()
        }
    }

    private fun String?.isNull_or_empty(): Boolean = this == null || this.isEmpty()
}
