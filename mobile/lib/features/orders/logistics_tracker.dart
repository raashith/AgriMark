import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import 'orders_repository.dart';

class LogisticsTracker extends StatefulWidget {
  const LogisticsTracker({super.key});

  @override
  State<LogisticsTracker> createState() => _LogisticsTrackerState();
}

class _LogisticsTrackerState extends State<LogisticsTracker> {
  final _ordersRepo = OrdersRepository();
  bool _isLoading = true;
  Map<String, dynamic>? _locationData;

  @override
  void initState() {
    super.initState();
    _loadLocation();
  }

  Future<void> _loadLocation() async {
    final loc = await _ordersRepo.fetchLocationLatest();
    setState(() {
      _locationData = loc;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const CustomCard(
        child: Padding(
          padding: EdgeInsets.all(12.0),
          child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
        ),
      );
    }

    final hasLocation = _locationData != null && _locationData!['latitude'] != null;

    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.my_location, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text('Live Field Telemetry & Pickup Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 12),
          if (hasLocation) ...[
            Text(
              'Lat: ${_locationData!['latitude']} • Lon: ${_locationData!['longitude']}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.accent),
            ),
            const SizedBox(height: 4),
            Text(
              'Last Ping: ${_locationData!['updated_at'] ?? 'Just now'}',
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ] else ...[
            const Text(
              'No active telemetry stream. Tap below to send field pickup coordinates.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () async {
                setState(() => _isLoading = true);
                await _ordersRepo.postLocation(latitude: 10.9984, longitude: 76.9944);
                await _loadLocation();
              },
              icon: const Icon(Icons.gps_fixed, size: 16),
              label: const Text('Update Pickup Location'),
            ),
          ],
        ],
      ),
    );
  }
}
