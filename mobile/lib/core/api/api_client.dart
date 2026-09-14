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
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await _client
          .get(Uri.parse(url), headers: headers)
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
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await _client
          .post(
            Uri.parse(url),
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
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

  Future<dynamic> put(String url, {dynamic body, bool requireAuth = true}) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await _client
          .put(
            Uri.parse(url),
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: AppConfig.requestTimeoutSeconds));

      return _processResponse(response);
    } on SocketException {
      throw const NetworkFailure();
    } catch (e) {
      if (e is Failure) rethrow;
      throw ServerFailure('Unexpected error: $e');
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic jsonBody;
    try {
      if (response.body.isNotEmpty) {
        jsonBody = jsonDecode(response.body);
      }
    } catch (_) {}

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonBody;
    }

    final String errorDetail = jsonBody is Map && jsonBody.containsKey('detail')
        ? jsonBody['detail'].toString()
        : 'HTTP Error ${response.statusCode}';

    if (response.statusCode == 401) {
      throw AuthFailure(errorDetail);
    } else if (response.statusCode == 403) {
      throw ServerFailure('Permission denied: $errorDetail', statusCode: 403);
    } else if (response.statusCode == 404) {
      throw ServerFailure('Resource not found: $errorDetail', statusCode: 404);
    } else {
      throw ServerFailure(errorDetail, statusCode: response.statusCode);
    }
  }
}

class TimeoutException implements Exception {
  final String message;
  TimeoutException(this.message);
}
