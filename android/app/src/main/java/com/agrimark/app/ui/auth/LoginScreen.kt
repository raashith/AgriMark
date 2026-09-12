package com.agrimark.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.agrimark.app.data.repository.AuthRepository

@Composable
fun LoginScreen(
    authRepository: AuthRepository,
    onLoginSuccess: (role: String) -> Unit
) {
    var isRegisterMode by remember { mutableStateOf(false) }
    var phoneOrEmail by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var roleName by remember { mutableStateOf("farmer") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "AgriMark Production OS",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = if (isRegisterMode) "Create your farmer/buyer account" else "Welcome back! Sign in to continue",
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (errorMessage != null) {
            Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        if (isRegisterMode) {
            OutlinedTextField(
                value = fullName,
                onValueChange = { fullName = it },
                label = { Text("Full Name") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        OutlinedTextField(
            value = phoneOrEmail,
            onValueChange = { phoneOrEmail = it },
            label = { Text(if (isRegisterMode) "Phone Number" else "Phone or Email") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        if (isRegisterMode) {
            Spacer(modifier = Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                FilterChip(
                    selected = roleName == "farmer",
                    onClick = { roleName = "farmer" },
                    label = { Text("🌾 Farmer") }
                )
                FilterChip(
                    selected = roleName == "buyer",
                    onClick = { roleName = "buyer" },
                    label = { Text("🛒 Buyer") }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                isLoading = true
                errorMessage = null
                Thread {
                    val result = if (isRegisterMode) {
                        authRepository.register(fullName, phoneOrEmail, null, password, roleName)
                    } else {
                        authRepository.login(phoneOrEmail, password)
                    }
                    isLoading = false
                    result.fold(
                        onSuccess = { json ->
                            val userObj = json.getJSONObject("user")
                            val role = userObj.getString("role")
                            onLoginSuccess(role)
                        },
                        onFailure = { err ->
                            errorMessage = err.message ?: "Authentication failed"
                        }
                    )
                }.start()
            },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (isLoading) "Processing..." else if (isRegisterMode) "Register Account" else "Sign In")
        }

        Spacer(modifier = Modifier.height(12.dp))

        TextButton(onClick = {
            isRegisterMode = !isRegisterMode
            errorMessage = null
        }) {
            Text(if (isRegisterMode) "Already have an account? Sign In" else "Don't have an account? Register")
        }
    }
}
