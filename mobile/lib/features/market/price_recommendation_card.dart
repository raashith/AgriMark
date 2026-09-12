import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import 'market_repository.dart';

class PriceRecommendationCard extends StatelessWidget {
  final String commodity;
  final String? reply;
  final bool isLoading;
  final VoidCallback onAskGuidance;

  const PriceRecommendationCard({
    super.key,
    required this.commodity,
    this.reply,
    this.isLoading = false,
    required this.onAskGuidance,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      backgroundColor: AppColors.chipBackground,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.psychology, color: AppColors.accent, size: 20),
              SizedBox(width: 8),
              Text('AgriAI Market Price Guidance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 8),
          if (isLoading)
            const Padding(
              padding: EdgeInsets.all(12.0),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
            )
          else if (reply != null) ...[
            Text(
              reply!,
              style: const TextStyle(fontSize: 13, color: AppColors.textMain, height: 1.4),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'Note: Price recommendations are AI estimates. Market prices vary by mandi quality.',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
            ),
          ] else ...[
            const Text(
              'Get AI analysis on whether to sell now or wait based on recent market trends.',
              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onAskGuidance,
              icon: const Icon(Icons.analytics_outlined, size: 16),
              label: const Text('Ask AgriAI Price Guidance'),
            ),
          ],
        ],
      ),
    );
  }
}
