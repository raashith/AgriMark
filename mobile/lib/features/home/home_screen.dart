import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/loading_view.dart';
import '../farm/add_crop_screen.dart';
import '../farm/add_farm_screen.dart';
import '../farm/farm_repository.dart';
import '../market/market_repository.dart';
import '../market/sell_produce_screen.dart';
import 'widgets/action_card.dart';
import 'widgets/crop_health_card.dart';
import 'widgets/market_signal_card.dart';
import 'widgets/quick_actions.dart';
import 'widgets/weather_card.dart';

class HomeScreen extends StatefulWidget {
  final Function(int tabIndex)? onNavigateTab;
  final Function(String prompt)? onAskAiWithPrompt;

  const HomeScreen({
    super.key,
    this.onNavigateTab,
    this.onAskAiWithPrompt,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _farmRepo = FarmRepository();
  final _marketRepo = MarketRepository();

  bool _isLoading = true;
  Map<String, dynamic>? _dashboardData;
  List<dynamic> _farms = [];
  List<dynamic> _crops = [];
  List<dynamic> _listings = [];

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    setState(() => _isLoading = true);
    try {
      final dashFut = _farmRepo.fetchDashboard().catchError((_) => <String, dynamic>{});
      final farmsFut = _farmRepo.fetchFarms().catchError((_) => []);
      final cropsFut = _farmRepo.fetchCrops().catchError((_) => []);
      final listFut = _marketRepo.searchListings().catchError((_) => []);

      final res = await Future.wait([dashFut, farmsFut, cropsFut, listFut]);
      setState(() {
        _dashboardData = res[0] as Map<String, dynamic>;
        _farms = res[1] as List<dynamic>;
        _crops = res[2] as List<dynamic>;
        _listings = res[3] as List<dynamic>;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingView(message: 'Syncing farm operating system...');
    }

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadAllData,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Farmer Greeting Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('🙏 Namaste, Farmer', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                        SizedBox(height: 2),
                        Text('📍 Pollachi, Tamil Nadu', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.notifications_none, size: 28),
                      onPressed: () {
                        if (widget.onNavigateTab != null) widget.onNavigateTab!(0);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // 1. Prominent Today's Best Action Card
                ActionCard(
                  dashboardData: _dashboardData,
                  onActionTap: () {
                    if (widget.onNavigateTab != null) widget.onNavigateTab!(4); // AgriAI tab
                  },
                ),
                const SizedBox(height: 24),

                // 2. 1-Tap Quick Actions
                QuickActions(
                  onAddCrop: () async {
                    if (_farms.isNotEmpty) {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => AddCropScreen(farms: _farms)));
                    } else {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddFarmScreen()));
                    }
                    _loadAllData();
                  },
                  onSellProduce: () async {
                    await Navigator.push(context, MaterialPageRoute(builder: (_) => const SellProduceScreen()));
                    _loadAllData();
                  },
                  onViewMarket: () {
                    if (widget.onNavigateTab != null) widget.onNavigateTab!(2);
                  },
                  onBookPickup: () {
                    if (widget.onNavigateTab != null) widget.onNavigateTab!(3);
                  },
                  onAskAi: () {
                    if (widget.onNavigateTab != null) widget.onNavigateTab!(4);
                  },
                ),
                const SizedBox(height: 24),

                // 3. Weather Card
                const WeatherCard(),
                const SizedBox(height: 16),

                // 4. Crop Health Card
                CropHealthCard(
                  crops: _crops,
                  onAddCrop: () async {
                    if (_farms.isNotEmpty) {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => AddCropScreen(farms: _farms)));
                    } else {
                      await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddFarmScreen()));
                    }
                    _loadAllData();
                  },
                ),
                const SizedBox(height: 16),

                // 5. Market Signal Card
                MarketSignalCard(listings: _listings),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
