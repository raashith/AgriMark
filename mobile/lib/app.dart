import 'package:flutter/material.dart';
import 'core/auth/secure_storage.dart';
import 'core/localization/app_localizations.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/onboarding/auth_repository.dart';
import 'features/onboarding/login_screen.dart';

class AgriMarkApp extends StatefulWidget {
  const AgriMarkApp({super.key});

  @override
  State<AgriMarkApp> createState() => _AgriMarkAppState();
}

class _AgriMarkAppState extends State<AgriMarkApp> {
  final _authRepo = AuthRepository();
  bool _isLoading = true;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuthSession();
  }

  Future<void> _checkAuthSession() async {
    final user = await _authRepo.fetchMe();
    setState(() {
      _isAuthenticated = user != null;
      _isLoading = false;
    });
  }

  void _onLoginSuccess() {
    setState(() {
      _isAuthenticated = true;
    });
  }

  void _onLogout() {
    setState(() {
      _isAuthenticated = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgriMark',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      localizationsDelegates: const [
        AppLocalizationsDelegate(),
      ],
      supportedLocales: const [
        Locale('en', ''),
        Locale('ta', ''),
      ],
      home: _isLoading
          ? const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: Color(0xFF10B981)),
              ),
            )
          : _isAuthenticated
              ? MainNavigationContainer(onLogout: _onLogout)
              : LoginScreen(onLoginSuccess: _onLoginSuccess),
    );
  }
}
