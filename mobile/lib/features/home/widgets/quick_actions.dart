import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class QuickActions extends StatelessWidget {
  final VoidCallback onAddCrop;
  final VoidCallback onSellProduce;
  final VoidCallback onViewMarket;
  final VoidCallback onBookPickup;
  final VoidCallback onAskAi;

  const QuickActions({
    super.key,
    required this.onAddCrop,
    required this.onSellProduce,
    required this.onViewMarket,
    required this.onBookPickup,
    required this.onAskAi,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quick Farmer Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildActionItem(Icons.grass, 'Add Crop', AppColors.primary, onAddCrop),
            _buildActionItem(Icons.sell, 'Sell Produce', AppColors.accent, onSellProduce),
            _buildActionItem(Icons.storefront, 'View Market', AppColors.statusInfo, onViewMarket),
            _buildActionItem(Icons.local_shipping, 'Book Pickup', AppColors.statusWarning, onBookPickup),
            _buildActionItem(Icons.psychology, 'Ask AgriAI', AppColors.primary, onAskAi),
          ],
        ),
      ],
    );
  }

  Widget _buildActionItem(IconData icon, String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56, // 56px touch target
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withOpacity(0.4)),
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMain),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
