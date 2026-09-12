import 'package:flutter_test/flutter_test.dart';
import 'package:agrimark/features/market/market_repository.dart';

void main() {
  group('MarketRepository Unit Tests', () {
    late MarketRepository marketRepository;

    setUp(() {
      marketRepository = MarketRepository();
    });

    test('MarketRepository handles fallback guidance when offline', () async {
      final guidance = await marketRepository.getPriceGuidance(
        commodity: 'Tomato',
        location: 'Pollachi',
      );
      expect(guidance, isNotNull);
      expect(guidance.containsKey('reply'), isTrue);
    });
  });
}
