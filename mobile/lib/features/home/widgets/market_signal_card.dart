import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_card.dart';

class MarketSignalCard extends StatelessWidget {
  final List<dynamic> listings;

  const MarketSignalCard({super.key, required this.listings});

  @override
  Widget build(BuildContext context) {
    final hasListings = listings.isNotEmpty;

    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.trending_up, color: AppColors.accent, size: 20),
              SizedBox(width: 8),
              Text('Market Signals', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          if (hasListings) ...[
            Text(
              '${listings.first['title']}: ₹${listings.first['price_per_kg']}/kg',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.accent),
            ),
            const SizedBox(height: 4),
            Text(
              'Available: ${listings.first['available_quantity_kg']} Kg in nearby mandi',
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ] else ...[
            const Text(
              'Live market data unavailable for current mandi.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }
}
