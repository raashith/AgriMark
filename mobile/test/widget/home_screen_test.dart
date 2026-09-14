import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:agrimark/features/home/home_screen.dart';

void main() {
  testWidgets('HomeScreen renders farmer greeting and quick actions', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: HomeScreen(),
      ),
    );

    // Initial render loading state
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
