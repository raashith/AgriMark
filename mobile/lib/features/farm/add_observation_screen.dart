import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import 'farm_repository.dart';

class AddObservationScreen extends StatefulWidget {
  final String farmId;
  final String? cropId;

  const AddObservationScreen({super.key, required this.farmId, this.cropId});

  @override
  State<AddObservationScreen> createState() => _AddObservationScreenState();
}

class _AddObservationScreenState extends State<AddObservationScreen> {
  final _notesController = TextEditingController();
  final _farmRepo = FarmRepository();
  bool _isLoading = false;
  String? _error;

  Future<void> _handleSubmit() async {
    final notes = _notesController.text.trim();
    if (notes.isEmpty) {
      setState(() => _error = 'Please enter field observation notes.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _farmRepo.recordObservation(
        farmId: widget.farmId,
        cropId: widget.cropId,
        observationNotes: notes,
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
      appBar: AppBar(title: const Text('Record Field Observation')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.statusError)),
              const SizedBox(height: 12),
            ],
            const Text('Observation Notes / Symptoms', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _notesController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'e.g. Yellowing leaves observed on lower branches, mild leaf curl.',
              ),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Save Observation',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
