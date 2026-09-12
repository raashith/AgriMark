import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import 'farm_repository.dart';

class AddCropScreen extends StatefulWidget {
  final List<dynamic> farms;

  const AddCropScreen({super.key, required this.farms});

  @override
  State<AddCropScreen> createState() => _AddCropScreenState();
}

class _AddCropScreenState extends State<AddCropScreen> {
  final _nameController = TextEditingController();
  final _varietyController = TextEditingController();
  final _areaController = TextEditingController();
  final _farmRepo = FarmRepository();

  String? _selectedFarmId;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.farms.isNotEmpty) {
      _selectedFarmId = widget.farms.first['id'];
    }
  }

  Future<void> _handleSubmit() async {
    final name = _nameController.text.trim();
    final variety = _varietyController.text.trim();
    final areaStr = _areaController.text.trim();

    if (_selectedFarmId == null || name.isEmpty || areaStr.isEmpty) {
      setState(() => _error = 'Please select a Farm and enter Crop Name & Acreage.');
      return;
    }

    final area = double.tryParse(areaStr);
    if (area == null || area <= 0) {
      setState(() => _error = 'Please enter a valid positive acreage.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _farmRepo.addCrop(
        farmId: _selectedFarmId!,
        name: name,
        variety: variety.isNotEmpty ? variety : null,
        sowingDate: DateTime.now().toIso8601String().split('T').first,
        acreage: area,
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
      appBar: AppBar(title: const Text('Add New Crop')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.statusError)),
              const SizedBox(height: 12),
            ],
            const Text('Select Farm', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _selectedFarmId,
              items: widget.farms.map<DropdownMenuItem<String>>((f) {
                return DropdownMenuItem<String>(
                  value: f['id'],
                  child: Text(f['name'] ?? 'Farm'),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedFarmId = val),
              decoration: const InputDecoration(filled: true, fillColor: AppColors.cardBackground),
            ),
            const SizedBox(height: 16),
            const Text('Crop Name', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(hintText: 'e.g. Tomato, Rice, Maize'),
            ),
            const SizedBox(height: 16),
            const Text('Variety / Cultivar', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _varietyController,
              decoration: const InputDecoration(hintText: 'e.g. Hybrid PKM-1'),
            ),
            const SizedBox(height: 16),
            const Text('Acreage (Acres)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _areaController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(hintText: 'e.g. 1.5'),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Save Crop',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
