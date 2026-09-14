import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_card.dart';

class ActionCard extends StatelessWidget {
  final Map<String, dynamic>? dashboardData;
  final VoidCallback onActionTap;

  const ActionCard({
    super.key,
    this.dashboardData,
    required this.onActionTap,
  });

  @override
  Widget build(BuildContext context) {
    final nextAction = dashboardData?['next_best_action'] ?? 'Inspect crop & check market price';

    return CustomCard(
      backgroundColor: AppColors.chipBackground,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.stars, color: AppColors.statusWarning, size: 22),
              SizedBox(width: 8),
              Text("Today's Best Action", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textMain)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            nextAction,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.accent, height: 1.3),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onActionTap,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                minimumSize: const Size.fromHeight(44),
              ),
              icon: const Icon(Icons.arrow_forward, size: 18),
              label: const Text('Execute Action'),
            ),
          ),
        ],
      ),
    );
  }
}
