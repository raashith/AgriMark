import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import 'farm_repository.dart';

class AddFarmScreen extends StatefulWidget {
  const AddFarmScreen({super.key});

  @override
  State<AddFarmScreen> createState() => _AddFarmScreenState();
}

class _AddFarmScreenState extends State<AddFarmScreen> {
  final _nameController = TextEditingController();
  final _locationController = TextEditingController();
  final _areaController = TextEditingController();
  final _farmRepo = FarmRepository();

  bool _isLoading = false;
  String? _error;

  Future<void> _handleSubmit() async {
    final name = _nameController.text.trim();
    final location = _locationController.text.trim();
    final areaStr = _areaController.text.trim();

    if (name.isEmpty || location.isEmpty || areaStr.isEmpty) {
      setState(() => _error = 'Please fill in Farm Name, Location, and Total Area.');
      return;
    }

    final area = double.tryParse(areaStr);
    if (area == null || area <= 0) {
      setState(() => _error = 'Please enter a valid positive area in acres.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _farmRepo.createFarm(
        name: name,
        locationName: location,
        totalAreaAcres: area,
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
      appBar: AppBar(title: const Text('Add Farm')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.statusError)),
              const SizedBox(height: 12),
            ],
            const Text('Farm Name', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(hintText: 'e.g. Green Valley Plot A'),
            ),
            const SizedBox(height: 16),
            const Text('Location / Village', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(hintText: 'e.g. Pollachi, Tamil Nadu'),
            ),
            const SizedBox(height: 16),
            const Text('Total Area (Acres)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _areaController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(hintText: 'e.g. 3.5'),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Save Farm',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
