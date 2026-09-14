import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  SecureStorageService([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;
  static const _tokenKey = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _userKey = 'user_json';

  Future<void> saveTokens({required String accessToken, String? refreshToken}) async {
    await _storage.write(key: _tokenKey, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _refreshKey, value: refreshToken);
    }
  }

  Future<String?> getAccessToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (_) {
      return (await SharedPreferences.getInstance()).getString(_tokenKey);
    }
  }

  Future<void> saveUserJson(String value) async {
    await (await SharedPreferences.getInstance()).setString(_userKey, value);
  }

  Future<String?> getUserJson() async {
    return (await SharedPreferences.getInstance()).getString(_userKey);
  }

  Future<void> clearSession() async {
    try {
      await _storage.deleteAll();
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshKey);
    await prefs.remove(_userKey);
  }
}
