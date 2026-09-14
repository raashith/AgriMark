import 'package:flutter_test/flutter_test.dart';

import 'package:agrimark/core/config/app_config.dart';

void main() {
  test('uses the canonical AgriMark API configuration', () {
    expect(AppConfig.appName, 'AgriMark');
    expect(AppConfig.apiBaseUrl, 'https://agrimark-api.onrender.com');
    expect(AppConfig.apiPrefix, '/api/v1');
    expect(AppConfig.supportedLanguages, contains('en'));
    expect(AppConfig.supportedLanguages, contains('ta'));
  });
}
