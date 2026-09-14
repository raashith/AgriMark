import 'package:flutter/material.dart';
import '../../features/agri_ai/agri_ai_screen.dart';
import '../../features/farm/farm_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/market/market_screen.dart';
import '../../features/onboarding/auth_repository.dart';
import '../../features/onboarding/login_screen.dart';
import '../../features/orders/orders_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../widgets/offline_banner.dart';

class MainNavigationContainer extends StatefulWidget {
  final VoidCallback onLogout;

  const MainNavigationContainer({super.key, required this.onLogout});

  @override
  State<MainNavigationContainer> createState() => _MainNavigationContainerState();
}

class _MainNavigationContainerState extends State<MainNavigationContainer> {
  int _currentIndex = 0;
  String? _pendingAiPrompt;

  void _onTabTapped(int index) {
    setState(() => _currentIndex = index);
  }

  void _askAiWithPrompt(String prompt) {
    setState(() {
      _pendingAiPrompt = prompt;
      _currentIndex = 4; // AgriAI tab
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      HomeScreen(
        onNavigateTab: _onTabTapped,
        onAskAiWithPrompt: _askAiWithPrompt,
      ),
      const FarmScreen(),
      const MarketScreen(),
      const OrdersScreen(),
      AgriAiScreen(key: ValueKey(_pendingAiPrompt), initialPrompt: _pendingAiPrompt),
    ];

    return Scaffold(
      body: Column(
        children: [
          const OfflineBanner(isOffline: false),
          Expanded(child: IndexedStack(index: _currentIndex, children: screens)),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.agriculture_outlined), activeIcon: Icon(Icons.agriculture), label: 'Farm'),
          BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), activeIcon: Icon(Icons.storefront), label: 'Market'),
          BottomNavigationBarItem(icon: Icon(Icons.local_shipping_outlined), activeIcon: Icon(Icons.local_shipping), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.psychology_outlined), activeIcon: Icon(Icons.psychology), label: 'AgriAI'),
        ],
      ),
    );
  }
}
