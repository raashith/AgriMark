import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/market/buy_marketplace_screen.dart';
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
    try {
      final user = await _authRepo.fetchMe();
      if (!mounted) return;
      setState(() {
        _isAuthenticated = user != null;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isAuthenticated = false;
        _isLoading = false;
      });
    }
  }

  void _onLoginSuccess() {
    if (!mounted) return;
    setState(() => _isAuthenticated = true);
  }

  Future<void> _onLogout() async {
    await _authRepo.logout();
    if (!mounted) return;
    setState(() => _isAuthenticated = false);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgriMark',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: _isLoading
          ? const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            )
          : _isAuthenticated
              ? MainNavigationContainer(onLogout: _onLogout)
              : LoginScreen(onLoginSuccess: _onLoginSuccess),
    );
  }
}

class MainNavigationContainer extends StatefulWidget {
  const MainNavigationContainer({super.key, required this.onLogout});

  final Future<void> Function() onLogout;

  @override
  State<MainNavigationContainer> createState() => _MainNavigationContainerState();
}

class _MainNavigationContainerState extends State<MainNavigationContainer> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const _HomeTab(),
      const BuyMarketplaceScreen(),
      _OrdersTab(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('AgriMark'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Marketplace'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Orders'),
        ],
      ),
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: const [
        SizedBox(height: 8),
        Text('Welcome to AgriMark', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
        SizedBox(height: 8),
        Text('Sell directly. See the market. Keep more value.'),
        SizedBox(height: 28),
        Card(
          child: Padding(
            padding: EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Farmer-first marketplace', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                SizedBox(height: 8),
                Text('Harvest your produce, create a real produce lot, publish a listing, and sell to buyers.'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OrdersTab extends StatelessWidget {
  const _OrdersTab();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text('Orders are connected to the AgriMark marketplace API.'),
      ),
    );
  }
}
