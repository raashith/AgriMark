import 'dart:convert';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/auth/secure_storage.dart';
import '../../core/errors/failure.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureStorageService _storage;

  AuthRepository({ApiClient? apiClient, SecureStorageService? storage})
      : _apiClient = apiClient ?? ApiClient(),
        _storage = storage ?? SecureStorageService();

  Future<Map<String, dynamic>> login(String phoneOrEmail, String password) async {
    final body = {
      'phone_or_email': phoneOrEmail,
      'password': password,
    };

    final response = await _apiClient.post(
      ApiEndpoints.login,
      body: body,
      requireAuth: false,
    );

    if (response is Map<String, dynamic>) {
      final token = response['access_token'] as String?;
      final refreshToken = response['refresh_token'] as String?;
      final user = response['user'];

      if (token != null) {
        await _storage.saveTokens(accessToken: token, refreshToken: refreshToken);
        if (user != null) {
          await _storage.saveUserJson(jsonEncode(user));
        }
      }
      return response;
    }
    throw const ServerFailure('Invalid server response format.');
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String phone,
    String? email,
    required String password,
    required String roleName,
    String preferredLanguage = 'en',
  }) async {
    final body = {
      'full_name': fullName,
      'phone': phone,
      if (email != null && email.isNotEmpty) 'email': email,
      'password': password,
      'role_name': roleName,
      'preferred_language': preferredLanguage,
    };

    final response = await _apiClient.post(
      ApiEndpoints.register,
      body: body,
      requireAuth: false,
    );

    if (response is Map<String, dynamic>) {
      final token = response['access_token'] as String?;
      final refreshToken = response['refresh_token'] as String?;
      final user = response['user'];

      if (token != null) {
        await _storage.saveTokens(accessToken: token, refreshToken: refreshToken);
        if (user != null) {
          await _storage.saveUserJson(jsonEncode(user));
        }
      }
      return response;
    }
    throw const ServerFailure('Invalid registration response format.');
  }

  Future<Map<String, dynamic>?> fetchMe() async {
    final token = await _storage.getAccessToken();
    if (token == null) return null;

    try {
      final response = await _apiClient.get(ApiEndpoints.me, requireAuth: true);
      if (response is Map<String, dynamic>) {
        await _storage.saveUserJson(jsonEncode(response));
        return response;
      }
    } catch (_) {
      // Return cached user if network fails
      final cached = await _storage.getUserJson();
      if (cached != null) {
        return jsonDecode(cached) as Map<String, dynamic>;
      }
    }
    return null;
  }

  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout, requireAuth: true);
    } catch (_) {}
    await _storage.clearSession();
  }
}
