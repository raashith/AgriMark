import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import '../farm/farm_repository.dart';
import 'market_repository.dart';
import 'price_recommendation_card.dart';

class SellProduceScreen extends StatefulWidget {
  const SellProduceScreen({super.key});

  @override
  State<SellProduceScreen> createState() => _SellProduceScreenState();
}

class _SellProduceScreenState extends State<SellProduceScreen> {
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _quantityController = TextEditingController();
  final _descController = TextEditingController();

  final _marketRepo = MarketRepository();
  final _farmRepo = FarmRepository();

  bool _isLoadingData = true;
  bool _isSubmitting = false;
  bool _isLoadingGuidance = false;
  String? _error;
  String? _aiGuidanceReply;

  List<dynamic> _harvests = [];
  String? _selectedLotId;

  @override
  void initState() {
    super.initState();
    _loadHarvests();
  }

  Future<void> _loadHarvests() async {
    try {
      final harvests = await _farmRepo.fetchHarvests();
      setState(() {
        _harvests = harvests;
        if (harvests.isNotEmpty) {
          final first = harvests.first as Map<String, dynamic>;
          _selectedLotId = first['id']?.toString();
          final cropName = first['crop_name'] ?? first['name'] ?? 'Produce';
          _titleController.text = '$cropName Fresh Harvest';
          final quantity = first['available_quantity_kg'] ?? first['quantity_kg'];
          if (quantity != null) _quantityController.text = quantity.toString();
        }
        _isLoadingData = false;
      });
    } catch (_) {
      setState(() => _isLoadingData = false);
    }
  }

  Future<void> _fetchAiGuidance() async {
    final commodity = _titleController.text.trim();
    if (commodity.isEmpty) return;

    setState(() => _isLoadingGuidance = true);
    try {
      final res = await _marketRepo.getPriceGuidance(
        commodity: commodity,
        location: 'Pollachi Mandi',
      );
      setState(() {
        _aiGuidanceReply = res['reply'] ?? res['recommendation'];
        _isLoadingGuidance = false;
      });
    } catch (_) {
      setState(() {
        _aiGuidanceReply = 'Market price guidance unavailable.';
        _isLoadingGuidance = false;
      });
    }
  }

  Future<void> _handleSubmit() async {
    final title = _titleController.text.trim();
    final priceStr = _priceController.text.trim();
    final qtyStr = _quantityController.text.trim();
    final desc = _descController.text.trim();

    if (_selectedLotId == null) {
      setState(() => _error = 'No harvested produce lot is available to sell yet. Record a harvest first.');
      return;
    }

    if (title.isEmpty || priceStr.isEmpty || qtyStr.isEmpty) {
      setState(() => _error = 'Please fill in Title, Price per Kg, and Quantity.');
      return;
    }

    final price = double.tryParse(priceStr);
    final qty = double.tryParse(qtyStr);

    if (price == null || price <= 0 || qty == null || qty <= 0) {
      setState(() => _error = 'Please enter valid positive values for Price and Quantity.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      await _marketRepo.createListing(
        lotId: _selectedLotId!,
        title: title,
        description: desc.isNotEmpty ? desc : null,
        pricePerKg: price,
        availableQuantityKg: qty,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isSubmitting = false;
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _priceController.dispose();
    _quantityController.dispose();
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingData) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Sell Produce / List Lot')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.statusError)),
              const SizedBox(height: 12),
            ],
            if (_harvests.isEmpty) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.statusWarning.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.statusWarning.withOpacity(0.35)),
                ),
                child: const Text(
                  'No harvested lots are available yet. Record a harvest from My Farm before publishing a marketplace listing.',
                ),
              ),
              const SizedBox(height: 16),
            ] else ...[
              const Text('Select Harvested Produce', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedLotId,
                items: _harvests.map<DropdownMenuItem<String>>((h) {
                  final harvest = h as Map<String, dynamic>;
                  final id = harvest['id']?.toString();
                  final name = harvest['crop_name'] ?? harvest['name'] ?? 'Harvest lot';
                  final qty = harvest['available_quantity_kg'] ?? harvest['quantity_kg'] ?? '-';
                  return DropdownMenuItem<String>(
                    value: id,
                    child: Text('$name • $qty kg'),
                  );
                }).toList(),
                onChanged: (val) {
                  final matches = _harvests.whereType<Map<String, dynamic>>().where(
                    (h) => h['id']?.toString() == val,
                  );
                  final selected = matches.isNotEmpty ? matches.first : <String, dynamic>{};
                  setState(() {
                    _selectedLotId = val;
                    final cropName = selected['crop_name'] ?? selected['name'] ?? 'Produce';
                    _titleController.text = '$cropName Fresh Harvest';
                    final quantity = selected['available_quantity_kg'] ?? selected['quantity_kg'];
                    if (quantity != null) _quantityController.text = quantity.toString();
                  });
                },
                decoration: const InputDecoration(filled: true, fillColor: AppColors.cardBackground),
              ),
              const SizedBox(height: 16),
            ],

            const Text('Listing Title', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(hintText: 'e.g. Fresh Tomatoes Grade A'),
            ),

            const SizedBox(height: 16),
            PriceRecommendationCard(
              commodity: _titleController.text,
              reply: _aiGuidanceReply,
              isLoading: _isLoadingGuidance,
              onAskGuidance: _fetchAiGuidance,
            ),

            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Price per Kg (₹)', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _priceController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(hintText: '35.0'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Quantity (Kg)', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _quantityController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(hintText: '500.0'),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Text('Notes / Description', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _descController,
              maxLines: 2,
              decoration: const InputDecoration(hintText: 'Harvested today, ready for immediate pickup.'),
            ),

            const SizedBox(height: 24),
            CustomButton(
              text: 'Publish Marketplace Listing',
              isLoading: _isSubmitting,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
