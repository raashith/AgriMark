import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import 'farm_repository.dart';

class RecordHarvestScreen extends StatefulWidget {
  final String cropId;
  final String cropName;

  const RecordHarvestScreen({super.key, required this.cropId, required this.cropName});

  @override
  State<RecordHarvestScreen> createState() => _RecordHarvestScreenState();
}

class _RecordHarvestScreenState extends State<RecordHarvestScreen> {
  final _quantityController = TextEditingController();
  final _farmRepo = FarmRepository();
  String _selectedGrade = 'STANDARD';
  bool _isLoading = false;
  String? _error;

  Future<void> _handleSubmit() async {
    final qtyStr = _quantityController.text.trim();
    final qty = double.tryParse(qtyStr);

    if (qty == null || qty <= 0) {
      setState(() => _error = 'Please enter a valid harvested quantity in Kg.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _farmRepo.recordHarvest(
        cropId: widget.cropId,
        quantityKg: qty,
        harvestDate: DateTime.now().toIso8601String().split('T').first,
        qualityGrade: _selectedGrade,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Record Harvest — ${widget.cropName}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.statusError)),
              const SizedBox(height: 12),
            ],
            const Text('Harvested Quantity (Kg)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _quantityController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(hintText: 'e.g. 450.0'),
            ),
            const SizedBox(height: 16),
            const Text('Quality Grade', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedGrade,
              items: const [
                DropdownMenuItem(value: 'PREMIUM', child: Text('PREMIUM (Grade A)')),
                DropdownMenuItem(value: 'STANDARD', child: Text('STANDARD (Grade B)')),
                DropdownMenuItem(value: 'REJECT', child: Text('REJECT / Low Quality')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedGrade = val);
              },
              decoration: const InputDecoration(filled: true, fillColor: AppColors.cardBackground),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Save Harvest & Produce Lot',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
