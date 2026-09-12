import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../core/widgets/status_badge.dart';
import 'market_repository.dart';
import 'sell_produce_screen.dart';

class MarketScreen extends StatefulWidget {
  const MarketScreen({super.key});

  @override
  State<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends State<MarketScreen> {
  final _marketRepo = MarketRepository();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _listings = [];

  @override
  void initState() {
    super.initState();
    _loadListings();
  }

  Future<void> _loadListings() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await _marketRepo.searchListings();
      setState(() {
        _listings = res;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingView(message: 'Loading live marketplace...');
    }

    if (_error != null) {
      return ErrorView(message: _error!, onRetry: _loadListings);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmer Marketplace'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadListings,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const SellProduceScreen()),
          );
          _loadListings();
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
        label: const Text('Sell Produce', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: _loadListings,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              CustomCard(
                backgroundColor: AppColors.chipBackground,
                child: Row(
                  children: const [
                    Icon(Icons.storefront, size: 36, color: AppColors.accent),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Direct Mandi & Buyer Network', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('Verified listings connected to actual produce lots.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text('Active Marketplace Listings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              if (_listings.isEmpty)
                EmptyView(
                  title: 'No active listings',
                  subtitle: 'Live marketplace listings will appear here when posted by farmers.',
                  icon: Icons.storefront_outlined,
                  buttonText: 'List My Produce',
                  onButtonPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SellProduceScreen()),
                    );
                    _loadListings();
                  },
                )
              else
                ..._listings.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: CustomCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    item['title'] ?? 'Produce Listing',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                StatusBadge(label: '₹${item['price_per_kg']}/kg', color: AppColors.primary),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Available: ${item['available_quantity_kg']} kg • Status: ${item['status']}',
                              style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    )),
            ],
          ),
        ),
      ),
    );
  }
}
