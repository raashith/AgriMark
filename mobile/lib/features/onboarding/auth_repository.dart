import 'dart:convert';

import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/auth/secure_storage.dart';

class AuthRepository {
  AuthRepository({ApiClient? apiClient, SecureStorageService? storage})
      : _apiClient = apiClient ?? ApiClient(),
        _storage = storage ?? SecureStorageService();

  final ApiClient _apiClient;
  final SecureStorageService _storage;

  Future<Map<String, dynamic>> login(String phoneOrEmail, String password) async {
    final response = await _apiClient.post(
      ApiEndpoints.login,
      body: {'phone_or_email': phoneOrEmail, 'password': password},
      requireAuth: false,
    );
    if (response is! Map<String, dynamic>) {
      throw StateError('Invalid login response.');
    }
    final token = response['access_token']?.toString();
    if (token != null && token.isNotEmpty) {
      await _storage.saveTokens(
        accessToken: token,
        refreshToken: response['refresh_token']?.toString(),
      );
      final user = response['user'];
      if (user != null) await _storage.saveUserJson(jsonEncode(user));
    }
    return response;
  }

  Future<Map<String, dynamic>?> fetchMe() async {
    final token = await _storage.getAccessToken();
    if (token == null || token.isEmpty) return null;
    try {
      final response = await _apiClient.get(ApiEndpoints.me);
      if (response is Map<String, dynamic>) {
        await _storage.saveUserJson(jsonEncode(response));
        return response;
      }
    } catch (_) {}
    return null;
  }

  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout);
    } catch (_) {}
    await _storage.clearSession();
  }
}
