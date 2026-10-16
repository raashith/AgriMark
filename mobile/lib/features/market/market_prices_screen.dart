import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import 'market_repository.dart';
import 'sell_produce_screen.dart';

class MarketPricesScreen extends StatefulWidget {
  const MarketPricesScreen({super.key});

  @override
  State<MarketPricesScreen> createState() => _MarketPricesScreenState();
}

class _MarketPricesScreenState extends State<MarketPricesScreen> {
  final _marketRepo = MarketRepository();
  bool _isLoading = true;
  bool _isLoadingMorePrices = false;
  bool _hasMorePrices = true;
  String? _error;
  String? _loadMoreError;
  List<dynamic> _listings = [];
  List<dynamic> _prices = [];
  List<Map<String, String>> _commodities = [];
  List<Map<String, String>> _states = [];
  List<Map<String, String>> _districts = [];
  List<Map<String, String>> _mandis = [];
  String _commodity = '';
  String _state = '';
  String _district = '';
  String _mandi = '';

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final values = await Future.wait([
        _marketRepo.searchListings().catchError((_) => <dynamic>[]),
        _marketRepo.fetchNationalMarketPrices(
          commodity: _commodity,
          state: _state,
          district: _district,
          mandi: _mandi,
          limit: 100,
          offset: 0,
        ),
        _marketRepo.fetchNationalMarketFilters(),
      ]);
      if (!mounted) return;
      final filters = values[2] as Map<String, dynamic>;
      setState(() {
        _listings = values[0] as List<dynamic>;
        _prices = values[1] as List<dynamic>;
        _hasMorePrices = _prices.length == 100;
        _loadMoreError = null;
        _commodities = _asOptions(filters['commodities']);
        _states = _asOptions(filters['states']);
        _districts = _asOptions(filters['districts']);
        _mandis = _asOptions(filters['mandis']);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMorePrices() async {
    if (_isLoadingMorePrices || !_hasMorePrices) return;
    setState(() {
      _isLoadingMorePrices = true;
      _loadMoreError = null;
    });
    try {
      final next = await _marketRepo.fetchNationalMarketPrices(
        commodity: _commodity,
        state: _state,
        district: _district,
        mandi: _mandi,
        limit: 100,
        offset: _prices.length,
      );
      if (!mounted) return;
      setState(() {
        _prices = [..._prices, ...next];
        _hasMorePrices = next.length == 100;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadMoreError = e.toString());
    } finally {
      if (mounted) setState(() => _isLoadingMorePrices = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Market & Mandi Prices'),
        actions: [
          IconButton(
            tooltip: 'Refresh data',
            icon: const Icon(Icons.refresh),
            onPressed: _loadAll,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const SellProduceScreen()),
          );
          _loadAll();
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
        label: const Text(
          'Sell Produce',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: _isLoading
          ? const LoadingView(message: 'Loading verified mandi prices...')
          : _error != null
              ? ErrorView(message: _error!, onRetry: _loadAll)
              : RefreshIndicator(
                  onRefresh: _loadAll,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                    children: [
                      CustomCard(
                        backgroundColor: AppColors.chipBackground,
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.insights, color: AppColors.accent, size: 28),
                                SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'Official national mandi prices',
                                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Compare government market observations by commodity and location. '
                              'Prices are shown in ₹ per quintal and are not AI predictions.',
                              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      _buildFilters(),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Expanded(
                            child: Text(
                              'Observed mandi records',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Chip(label: Text('${_prices.length} shown')),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (_prices.isEmpty)
                        const CustomCard(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Text(
                              'No observations match these filters. Change the filters or refresh.',
                              style: TextStyle(color: AppColors.textMuted),
                            ),
                          ),
                        )
                      else
                        ..._prices.map(_priceCard),
                      if (_loadMoreError != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(_loadMoreError!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                        ),
                      if (_prices.isNotEmpty && _hasMorePrices)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: OutlinedButton.icon(
                            onPressed: _isLoadingMorePrices ? null : _loadMorePrices,
                            icon: _isLoadingMorePrices
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Icon(Icons.expand_more),
                            label: Text(_isLoadingMorePrices ? 'Loading more records...' : 'Load more mandi prices'),
                          ),
                        ),
                      const SizedBox(height: 18),
                      const Text(
                        'Your farmer listings',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      if (_listings.isEmpty)
                        const CustomCard(
                          child: Text(
                            'No active produce listings yet. Use Sell Produce to list a harvest lot.',
                            style: TextStyle(color: AppColors.textMuted),
                          ),
                        )
                      else
                        ..._listings.map(_listingCard),
                    ],
                  ),
                ),
    );
  }

  List<Map<String, String>> _asOptions(dynamic value) {
    if (value is! List) return <Map<String, String>>[];
    return value.whereType<Map>().map((row) => <String, String>{
      'code': row['code']?.toString() ?? '',
      'name': row['name']?.toString() ?? row['code']?.toString() ?? '',
    }).where((row) => row['code']!.isNotEmpty).toList();
  }

  Widget _buildFilters() {
    final currentDistricts = _districts;
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Find market prices', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          _dropdown(
            label: 'Commodity',
            value: _commodity,
            options: _commodities,
            onChanged: (value) {
              setState(() => _commodity = value);
              _loadAll();
            },
          ),
          const SizedBox(height: 8),
          _dropdown(
            label: 'State',
            value: _state,
            options: _states,
            onChanged: (value) {
              setState(() {
                _state = value;
                _district = '';
                _mandi = '';
              });
              _loadAll();
            },
          ),
          const SizedBox(height: 8),
          _dropdown(
            label: 'District',
            value: _district,
            options: currentDistricts,
            onChanged: (value) {
              setState(() {
                _district = value;
                _mandi = '';
              });
              _loadAll();
            },
          ),
          const SizedBox(height: 8),
          _dropdown(
            label: 'Mandi',
            value: _mandi,
            options: _mandis,
            onChanged: (value) {
              setState(() => _mandi = value);
              _loadAll();
            },
          ),
        ],
      ),
    );
  }

  Widget _dropdown({
    required String label,
    required String value,
    required List<Map<String, String>> options,
    required ValueChanged<String> onChanged,
  }) {
    final availableCodes = options.map((option) => option['code']).toSet();
    final validValue = value.isEmpty || availableCodes.contains(value) ? value : '';
    final items = <DropdownMenuItem<String>>[
      DropdownMenuItem(value: '', child: Text('All $label')),
      ...options.map((option) => DropdownMenuItem(
            value: option['code']!,
            child: Text(option['name']!, overflow: TextOverflow.ellipsis),
          )),
    ];
    // Keep the selected value valid even when new filter data arrives.
    final uniqueItems = <String, DropdownMenuItem<String>>{};
    for (final item in items) {
      uniqueItems[item.value!] = item;
    }
    return DropdownButtonFormField<String>(
      value: uniqueItems.containsKey(validValue) ? validValue : '',
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      items: uniqueItems.values.toList(),
      onChanged: (next) {
        if (next != null) onChanged(next);
      },
    );
  }

  Widget _priceCard(dynamic raw) {
    final row = Map<String, dynamic>.from(raw as Map);
    String labelFor(List<Map<String, String>> options, dynamic code, {String fallback = ''}) {
      final key = code?.toString() ?? '';
      for (final option in options) {
        if (option['code'] == key) return option['name'] ?? key;
      }
      return key.isNotEmpty ? key : fallback;
    }
    final commodity = labelFor(_commodities, row['commodity_code'], fallback: 'Commodity');
    final mandi = labelFor(_mandis, row['mandi_code'], fallback: 'Unknown mandi');
    final district = labelFor(_districts, row['district_code']);
    final state = labelFor(_states, row['state_code']);
    final date = (row['observation_date'] ?? '').toString();
    final min = _number(row['min_price']);
    final max = _number(row['max_price']);
    final modal = _number(row['modal_price']);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: CustomCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.agriculture, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(commodity, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.successSoft,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('AGMARKNET', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              [mandi, district, state].where((s) => s.isNotEmpty).join(' • '),
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
            const Divider(height: 22),
            Row(
              children: [
                Expanded(child: _priceValue('Modal price', modal)),
                Expanded(child: _priceValue('Min price', min)),
                Expanded(child: _priceValue('Max price', max)),
              ],
            ),
            const SizedBox(height: 8),
            Text('Observation date: ${date.isEmpty ? 'Not supplied' : date}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            const SizedBox(height: 2),
            const Text('Unit: ₹ / quintal • Historical observation, not a forecast', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _priceValue(String label, double value) {
    return Padding(
      padding: const EdgeInsets.only(right: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
          const SizedBox(height: 3),
          Text(
            value > 0 ? '₹${value.toStringAsFixed(0)}' : '—',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
          ),
        ],
      ),
    );
  }

  Widget _listingCard(dynamic raw) {
    final row = Map<String, dynamic>.from(raw as Map);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: CustomCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text((row['title'] ?? 'Produce listing').toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 5),
            Text(
              '₹${row['price_per_kg'] ?? row['price_per_unit'] ?? '—'} / kg  •  '
              '${row['available_quantity_kg'] ?? row['available_quantity'] ?? '—'} kg available',
              style: const TextStyle(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  double _number(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}
