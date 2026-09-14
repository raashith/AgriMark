import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import '../../core/widgets/status_badge.dart';
import 'logistics_tracker.dart';

class OrderDetailScreen extends StatelessWidget {
  final Map<String, dynamic> order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final status = order['order_status'] ?? 'CREATED';

    return Scaffold(
      appBar: AppBar(title: Text('Order #${order['id'].toString().substring(0, 8)}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Order Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      StatusBadge(label: status, color: AppColors.primary),
                    ],
                  ),
                  const Divider(height: 24, color: AppColors.cardBorder),
                  _buildDetailRow('Listing ID', order['listing_id'] ?? 'N/A'),
                  _buildDetailRow('Buyer ID', order['buyer_id'] ?? 'N/A'),
                  _buildDetailRow('Ordered Quantity', '${order['quantity_kg']} Kg'),
                  _buildDetailRow('Total Price', '₹${order['total_amount']}'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Logistics & Pickup Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const LogisticsTracker(),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 14)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textMain)),
        ],
      ),
    );
  }
}
