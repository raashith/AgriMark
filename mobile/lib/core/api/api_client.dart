import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../auth/secure_storage.dart';
import '../config/app_config.dart';
import '../errors/failure.dart';

class ApiClient {
  final http.Client _client;
  final SecureStorageService _storage;

  ApiClient({http.Client? client, SecureStorageService? storage})
      : _client = client ?? http.Client(),
        _storage = storage ?? SecureStorageService();

  Future<Map<String, String>> _getHeaders({bool requireAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (requireAuth) {
      final token = await _storage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  Future<dynamic> get(String url, {bool requireAuth = true}) async {
    try {
      final response = await _client
          .get(Uri.parse(url), headers: await _getHeaders(requireAuth: requireAuth))
          .timeout(const Duration(seconds: AppConfig.requestTimeoutSeconds));
      return _processResponse(response);
    } on SocketException {
      throw const NetworkFailure();
    } on TimeoutException {
      throw const ServerFailure('Request timed out. Please check server status.');
    } catch (e) {
      if (e is Failure) rethrow;
      throw ServerFailure('Unexpected error: $e');
    }
  }

  Future<dynamic> post(String url, {dynamic body, bool requireAuth = true}) async {
    try {
      final response = await _client
          .post(
            Uri.parse(url),
            headers: await _getHeaders(requireAuth: requireAuth),
            body: body == null ? null : jsonEncode(body),
          )
          .timeout(const Duration(seconds: AppConfig.requestTimeoutSeconds));
      return _processResponse(response);
    } on SocketException {
      throw const NetworkFailure();
    } on TimeoutException {
      throw const ServerFailure('Request timed out. Please check server status.');
    } catch (e) {
      if (e is Failure) rethrow;
      throw ServerFailure('Unexpected error: $e');
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic data;
    if (response.body.isNotEmpty) {
      try {
        data = jsonDecode(response.body);
      } catch (_) {
        data = null;
      }
    }
    if (response.statusCode >= 200 && response.statusCode < 300) return data;

    final detail = data is Map && data['detail'] != null
        ? data['detail'].toString()
        : 'HTTP Error ${response.statusCode}';
    if (response.statusCode == 401) throw AuthFailure(detail);
    if (response.statusCode == 403) throw ServerFailure('Permission denied: $detail', statusCode: 403);
    if (response.statusCode == 404) throw ServerFailure('Resource not found: $detail', statusCode: 404);
    throw ServerFailure(detail, statusCode: response.statusCode);
  }
}
