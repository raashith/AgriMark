import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/farm/farmer_sell_screen.dart';
import 'features/market/buy_marketplace_screen.dart';
import 'features/market/market_repository.dart';
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
    if (!mounted) return;
    setState(() {
      _isAuthenticated = user != null;
      _isLoading = false;
    });
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
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
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
      const _SellTab(),
      const _OrdersTab(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('AgriMark'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: () => widget.onLogout(),
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
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Buy'),
          NavigationDestination(icon: Icon(Icons.sell_outlined), label: 'Sell'),
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
      children: [
        const SizedBox(height: 8),
        const Text('Welcome to AgriMark', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Sell directly. See the market. Keep more value.'),
        const SizedBox(height: 28),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Farmer-first marketplace', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                SizedBox(height: 8),
                Text('Register your farm, record harvests, publish produce, and reach buyers without creating fake inventory.'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SellTab extends StatelessWidget {
  const _SellTab();

  @override
  Widget build(BuildContext context) {
    return const FarmerSellScreen();
  }
}

class _OrdersTab extends StatefulWidget {
  const _OrdersTab();

  @override
  State<_OrdersTab> createState() => _OrdersTabState();
}

class _OrdersTabState extends State<_OrdersTab> {
  final _repo = MarketRepository();
  late Future<List<dynamic>> _orders;

  @override
  void initState() {
    super.initState();
    _orders = _repo.fetchOrders();
  }

  Future<void> _refresh() async {
    setState(() => _orders = _repo.fetchOrders());
    await _orders;
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: FutureBuilder<List<dynamic>>(
        future: _orders,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: const [
                SizedBox(height: 80),
                Icon(Icons.cloud_off_outlined, size: 52),
                SizedBox(height: 12),
                Center(child: Text('Orders could not be loaded. Pull down to retry.')),
              ],
            );
          }

          final orders = snapshot.data ?? const [];
          if (orders.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: const [
                SizedBox(height: 80),
                Icon(Icons.receipt_long_outlined, size: 52),
                SizedBox(height: 12),
                Center(child: Text('No marketplace orders yet.')),
              ],
            );
          }

          return ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              final quantity = order is Map ? order['quantity'] : null;
              final unitPrice = order is Map ? order['unit_price'] : null;
              final total = order is Map ? order['total_amount'] : null;
              final status = order is Map ? order['status'] : null;
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.receipt_long_outlined)),
                  title: Text('Order ${order is Map ? order['id'] ?? '' : ''}'),
                  subtitle: Text('Qty: $quantity kg • ₹$unitPrice/kg • Total: ₹$total'),
                  trailing: Chip(label: Text('${status ?? 'pending'}')),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
