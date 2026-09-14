import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get darkTheme {
    const seed = Color(0xFF16A34A);
    final scheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.dark,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFF0B1220),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      cardTheme: const CardThemeData(
        margin: EdgeInsets.zero,
      ),
    );
  }
}
