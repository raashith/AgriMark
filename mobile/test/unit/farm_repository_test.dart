import 'package:flutter_test/flutter_test.dart';
import 'package:agrimark/features/farm/farm_repository.dart';

void main() {
  group('FarmRepository Unit Tests', () {
    late FarmRepository farmRepository;

    setUp(() {
      farmRepository = FarmRepository();
    });

    test('FarmRepository can be instantiated', () {
      expect(farmRepository, isNotNull);
    });
  });
}
