import 'package:flutter/material.dart';

import '../../core/errors/failure.dart';
import '../market/market_repository.dart';
import 'farm_repository.dart';

class FarmerSellScreen extends StatefulWidget {
  const FarmerSellScreen({super.key});

  @override
  State<FarmerSellScreen> createState() => _FarmerSellScreenState();
}

class _FarmerSellScreenState extends State<FarmerSellScreen> {
  final _farmRepo = FarmRepository();
  final _marketRepo = MarketRepository();
  final _formKey = GlobalKey<FormState>();

  final _farmName = TextEditingController();
  final _village = TextEditingController();
  final _district = TextEditingController();
  final _state = TextEditingController(text: 'Tamil Nadu');
  final _area = TextEditingController();
  final _quantity = TextEditingController();
  final _quality = TextEditingController(text: 'A');
  final _title = TextEditingController();
  final _price = TextEditingController();
  final _minimum = TextEditingController(text: '1');

  List<dynamic> _crops = [];
  String? _cropId;
  bool _loadingCrops = true;
  bool _submitting = false;
  String? _message;
  bool _success = false;

  @override
  void initState() {
    super.initState();
    _loadCrops();
  }

  Future<void> _loadCrops() async {
    try {
      final crops = await _farmRepo.fetchCrops();
      if (!mounted) return;
      setState(() {
        _crops = crops;
        _cropId = crops.isNotEmpty ? '${crops.first['id']}' : null;
        _loadingCrops = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loadingCrops = false;
        _message = 'Could not load crops. Please try again.';
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _cropId == null) {
      setState(() => _message = 'Select a crop and complete the required fields.');
      return;
    }

    setState(() {
      _submitting = true;
      _message = null;
      _success = false;
    });

    try {
      final profile = await _farmRepo.fetchProfile();
      final profileId = profile['id']?.toString();
      if (profileId == null || profileId.isEmpty) {
        throw const AuthFailure('Your farmer profile is not available yet.');
      }

      final farm = await _farmRepo.createFarm(
        profileId: profileId,
        name: _farmName.text.trim(),
        village: _village.text.trim(),
        district: _district.text.trim(),
        state: _state.text.trim(),
        areaAcres: double.parse(_area.text.trim()),
      );

      final cultivation = await _farmRepo.createCultivation(
        farmId: farm['id'].toString(),
        cropId: _cropId!,
        season: 'Current season',
        areaAcres: double.parse(_area.text.trim()),
      );

      final lot = await _farmRepo.recordHarvest(
        cropId: _cropId!,
        cultivationId: cultivation['id']?.toString(),
        quantityKg: double.parse(_quantity.text.trim()),
        harvestDate: DateTime.now().toIso8601String().substring(0, 10),
        qualityGrade: _quality.text.trim(),
      );

      final listing = await _marketRepo.createListing(
        lotId: lot['id'].toString(),
        title: _title.text.trim(),
        pricePerKg: double.parse(_price.text.trim()),
        minimumOrderQuantity: double.parse(_minimum.text.trim()),
      );

      if (!mounted) return;
      setState(() {
        _submitting = false;
        _success = true;
        _message = 'Your produce is now listed for buyers. Listing ID: ${listing['id']}';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _submitting = false;
        _success = false;
        _message = e is Failure ? e.message : 'Unable to publish the produce right now.';
      });
    }
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) return '$label is required.';
    return null;
  }

  String? _positive(String? value, String label) {
    final parsed = double.tryParse(value?.trim() ?? '');
    if (parsed == null || parsed <= 0) return '$label must be greater than 0.';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sell your produce')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text('1. Farm details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            _field(_farmName, 'Farm name', validator: (v) => _required(v, 'Farm name')),
            _field(_village, 'Village'),
            _field(_district, 'District'),
            _field(_state, 'State'),
            _field(
              _area,
              'Area in acres',
              keyboard: const TextInputType.numberWithOptions(decimal: true),
              validator: (v) => _positive(v, 'Area'),
            ),
            const SizedBox(height: 24),
            const Text('2. Crop & harvest', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            if (_loadingCrops)
              const Center(child: CircularProgressIndicator())
            else if (_crops.isEmpty)
              const Text('No crops are available in the crop catalog.')
            else
              DropdownButtonFormField<String>(
                value: _cropId,
                decoration: const InputDecoration(labelText: 'Crop'),
                items: _crops.map((crop) {
                  return DropdownMenuItem<String>(
                    value: '${crop['id']}',
                    child: Text('${crop['name']}'),
                  );
                }).toList(),
                onChanged: (value) => setState(() => _cropId = value),
              ),
            const SizedBox(height: 12),
            _field(
              _quantity,
              'Harvest quantity (kg)',
              keyboard: const TextInputType.numberWithOptions(decimal: true),
              validator: (v) => _positive(v, 'Quantity'),
            ),
            _field(_quality, 'Quality grade'),
            const SizedBox(height: 24),
            const Text('3. Sell to buyers', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            _field(_title, 'Listing title', validator: (v) => _required(v, 'Listing title')),
            _field(
              _price,
              'Selling price per kg (₹)',
              keyboard: const TextInputType.numberWithOptions(decimal: true),
              validator: (v) => _positive(v, 'Price'),
            ),
            _field(
              _minimum,
              'Minimum order (kg)',
              keyboard: const TextInputType.numberWithOptions(decimal: true),
              validator: (v) => _positive(v, 'Minimum order'),
            ),
            const SizedBox(height: 8),
            const Text(
              'Publishing creates the farm, crop cycle, harvest lot, and listing as separate backend records. If a later step fails, the earlier records may remain and can be reused on retry.',
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.sell_outlined),
              label: Text(_submitting ? 'Publishing…' : 'Publish produce'),
            ),
            if (_message != null) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Text(
                    _message!,
                    style: TextStyle(color: _success ? null : Theme.of(context).colorScheme.error),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    TextInputType? keyboard,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboard,
        validator: validator,
        decoration: InputDecoration(labelText: label),
      ),
    );
  }

  @override
  void dispose() {
    _farmName.dispose();
    _village.dispose();
    _district.dispose();
    _state.dispose();
    _area.dispose();
    _quantity.dispose();
    _quality.dispose();
    _title.dispose();
    _price.dispose();
    _minimum.dispose();
    super.dispose();
  }
}
