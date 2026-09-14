import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_card.dart';
import '../../../core/widgets/status_badge.dart';

class CropHealthCard extends StatelessWidget {
  final List<dynamic> crops;
  final VoidCallback onAddCrop;

  const CropHealthCard({super.key, required this.crops, required this.onAddCrop});

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.eco_outlined, color: AppColors.primary, size: 20),
                  SizedBox(width: 8),
                  Text('Crop Health', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              if (crops.isNotEmpty)
                TextButton(
                  onPressed: onAddCrop,
                  child: const Text('+ Add', style: TextStyle(fontSize: 12)),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (crops.isEmpty) ...[
            const Text(
              'No active crop observations.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: onAddCrop,
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Add Crop'),
            ),
          ] else ...[
            ...crops.take(2).map((c) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('🌾 ${c['name']} (${c['variety'] ?? 'Std'})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      StatusBadge(label: c['status'] ?? 'GROWING', color: AppColors.primary),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }
}
