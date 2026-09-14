import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import 'market_repository.dart';

class BuyMarketplaceScreen extends StatefulWidget {
  const BuyMarketplaceScreen({super.key});

  @override
  State<BuyMarketplaceScreen> createState() => _BuyMarketplaceScreenState();
}

class _BuyMarketplaceScreenState extends State<BuyMarketplaceScreen> {
  final _marketRepo = MarketRepository();
  final _searchController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');

  bool _loading = true;
  bool _ordering = false;
  String? _error;
  List<dynamic> _listings = [];

  @override
  void initState() {
    super.initState();
    _loadListings();
  }

  Future<void> _loadListings() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await _marketRepo.fetchListings();
      if (!mounted) return;
      setState(() {
        _listings = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Could not load marketplace listings.';
      });
    }
  }

  Future<void> _search() async {
    final query = _searchController.text.trim();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await _marketRepo.searchListings(
        commodity: query.isEmpty ? null : query,
      );
      if (!mounted) return;
      setState(() {
        _listings = items;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Search is unavailable right now.';
      });
    }
  }

  Future<void> _placeOrder(Map<String, dynamic> listing) async {
    final listingId = listing['id']?.toString();
    if (listingId == null || listingId.isEmpty) {
      setState(() => _error = 'This listing has no valid marketplace ID.');
      return;
    }

    final quantity = double.tryParse(_quantityController.text.trim());
    if (quantity == null || quantity <= 0) {
      setState(() => _error = 'Enter a valid quantity.');
      return;
    }

    final minimum = double.tryParse('${listing['min_order_quantity'] ?? 1}') ?? 1;
    if (quantity < minimum) {
      setState(() => _error = 'Minimum order quantity is $minimum kg.');
      return;
    }

    setState(() {
      _ordering = true;
      _error = null;
    });

    try {
      final result = await _marketRepo.placeOrder(
        listingId: listingId,
        quantity: quantity,
      );
      if (!mounted) return;
      setState(() => _ordering = false);
      await showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Order placed'),
          content: Text(
            'Order ${result['id'] ?? ''} was created successfully. The farmer can now process the order.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Done'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _ordering = false;
        _error = e.toString();
      });
    }
  }

  String _price(dynamic value) {
    final number = double.tryParse('$value');
    if (number == null) return '—';
    return '₹${number.toStringAsFixed(2)}/kg';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Buy Produce')),
      body: RefreshIndicator(
        onRefresh: _loadListings,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            TextField(
              controller: _searchController,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _search(),
              decoration: InputDecoration(
                hintText: 'Search vegetables, fruits, grains…',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.arrow_forward),
                  onPressed: _search,
                ),
                filled: true,
                fillColor: AppColors.cardBackground,
              ),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.statusError.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(_error!),
              ),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(40),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_listings.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 60),
                child: Column(
                  children: [
                    Icon(Icons.storefront_outlined, size: 52),
                    SizedBox(height: 12),
                    Text('No produce is listed right now.'),
                    SizedBox(height: 6),
                    Text('Try another crop or check again later.'),
                  ],
                ),
              )
            else
              ..._listings.whereType<Map<String, dynamic>>().map(_listingCard),
          ],
        ),
      ),
    );
  }

  Widget _listingCard(Map<String, dynamic> listing) {
    final title = '${listing['title'] ?? 'Produce'}';
    final price = _price(listing['price_per_unit']);
    final minimum = '${listing['min_order_quantity'] ?? 1} kg';
    final currency = '${listing['currency'] ?? 'INR'}';

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Text(price, style: const TextStyle(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 8),
            Text('Minimum order: $minimum • $currency'),
            const SizedBox(height: 14),
            Row(
              children: [
                SizedBox(
                  width: 105,
                  child: TextField(
                    controller: _quantityController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Quantity',
                      suffixText: 'kg',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomButton(
                    text: 'Buy now',
                    isLoading: _ordering,
                    onPressed: () => _placeOrder(listing),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _quantityController.dispose();
    super.dispose();
  }
}
