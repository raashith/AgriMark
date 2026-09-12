import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../core/widgets/status_badge.dart';
import 'order_detail_screen.dart';
import 'orders_repository.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _ordersRepo = OrdersRepository();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _orders = [];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await _ordersRepo.fetchOrders();
      setState(() {
        _orders = res;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String? status) {
    switch ((status ?? '').toUpperCase()) {
      case 'CONFIRMED':
        return AppColors.primary;
      case 'IN_TRANSIT':
        return AppColors.statusInfo;
      case 'DELIVERED':
      case 'COMPLETED':
        return AppColors.accent;
      case 'CANCELLED':
        return AppColors.statusError;
      default:
        return AppColors.statusWarning;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingView(message: 'Loading orders & pickups...');
    }

    if (_error != null) {
      return ErrorView(message: _error!, onRetry: _loadOrders);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buyer Orders & Pickup'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadOrders,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadOrders,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logistics Banner
              CustomCard(
                backgroundColor: AppColors.chipBackground,
                child: Row(
                  children: const [
                    Icon(Icons.local_shipping_outlined, size: 36, color: AppColors.primary),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Direct Field-to-Market Transport', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                          SizedBox(height: 2),
                          Text('Track confirmed orders and pickup schedules.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text('Recent Orders', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              if (_orders.isEmpty)
                const EmptyView(
                  title: 'No active orders',
                  subtitle: 'Orders placed by buyers for your produce listings will be displayed here.',
                  icon: Icons.assignment_outlined,
                )
              else
                ..._orders.map((o) => Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: CustomCard(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => OrderDetailScreen(order: o)),
                          );
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Order #${o['id'].toString().substring(0, 8)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                StatusBadge(label: o['order_status'] ?? 'CREATED', color: _getStatusColor(o['order_status'])),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text('Quantity: ${o['quantity_kg']} Kg • Total: ₹${o['total_amount']}', style: const TextStyle(fontSize: 14, color: AppColors.textMain)),
                            const SizedBox(height: 4),
                            Text('Buyer ID: ${o['buyer_id']}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                    )),
            ],
          ),
        ),
      ),
    );
  }
}
