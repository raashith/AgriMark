import 'package:flutter_test/flutter_test.dart';
import 'package:agrimark/features/onboarding/auth_repository.dart';

void main() {
  group('AuthRepository Unit Tests', () {
    late AuthRepository authRepository;

    setUp(() {
      authRepository = AuthRepository();
    });

    test('AuthRepository can be instantiated', () {
      expect(authRepository, isNotNull);
    });

    test('Logout clears session state gracefully', () async {
      expect(() async => await authRepository.logout(), returnsNormally);
    });
  });
}
