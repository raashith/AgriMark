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

  List<dynamic> _crops = [];
  String? _selectedCropId;

  @override
  void initState() {
    super.initState();
    _loadCrops();
  }

  Future<void> _loadCrops() async {
    try {
      final crops = await _farmRepo.fetchCrops();
      setState(() {
        _crops = crops;
        if (crops.isNotEmpty) {
          _selectedCropId = crops.first['id'];
          _titleController.text = '${crops.first['name']} Lot';
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
    } catch (e) {
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
      // Use selected crop ID or fallback lot ID
      final lotId = _selectedCropId ?? 'lot-default-1';
      await _marketRepo.createListing(
        lotId: lotId,
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

            if (_crops.isNotEmpty) ...[
              const Text('Select Harvested Crop', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedCropId,
                items: _crops.map<DropdownMenuItem<String>>((c) {
                  return DropdownMenuItem<String>(
                    value: c['id'],
                    child: Text('${c['name']} (${c['variety'] ?? 'Standard'})'),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCropId = val;
                    final selected = _crops.firstWhere((c) => c['id'] == val, orElse: () => null);
                    if (selected != null) {
                      _titleController.text = '${selected['name']} Fresh Harvest';
                    }
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
