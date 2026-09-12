import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/custom_card.dart';

class WeatherCard extends StatelessWidget {
  final Map<String, dynamic>? weatherData;

  const WeatherCard({super.key, this.weatherData});

  @override
  Widget build(BuildContext context) {
    final hasData = weatherData != null && weatherData!['temperature_c'] != null;

    return CustomCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Row(
                children: [
                  Icon(Icons.wb_sunny_outlined, color: AppColors.statusWarning, size: 20),
                  SizedBox(width: 8),
                  Text('Weather & Climate', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (hasData) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${weatherData!['temperature_c']}°C',
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.accent),
                    ),
                    Text(
                      weatherData!['condition'] ?? 'Clear',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 14),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Humidity: ${weatherData!['humidity_pct'] ?? 65}%', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    Text('Rainfall: ${weatherData!['rainfall_mm'] ?? 0.0} mm', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              ],
            ),
          ] else ...[
            const Text(
              'Live weather data unavailable for current region.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }
}
