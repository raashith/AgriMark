import 'package:flutter_test/flutter_test.dart';
import 'package:agrimark/features/agri_ai/agri_ai_repository.dart';

void main() {
  group('AgriAiRepository Unit Tests', () {
    late AgriAiRepository aiRepository;

    setUp(() {
      aiRepository = AgriAiRepository();
    });

    test('AgriAiRepository can be instantiated', () {
      expect(aiRepository, isNotNull);
    });
  });
}
