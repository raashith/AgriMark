import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_card.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../core/widgets/status_badge.dart';
import 'add_crop_screen.dart';
import 'add_farm_screen.dart';
import 'add_observation_screen.dart';
import 'farm_repository.dart';
import 'record_harvest_screen.dart';

class FarmScreen extends StatefulWidget {
  const FarmScreen({super.key});

  @override
  State<FarmScreen> createState() => _FarmScreenState();
}

class _FarmScreenState extends State<FarmScreen> {
  final _farmRepo = FarmRepository();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _farms = [];
  List<dynamic> _crops = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final farmsFuture = _farmRepo.fetchFarms();
      final cropsFuture = _farmRepo.fetchCrops();

      final results = await Future.wait([farmsFuture, cropsFuture]);
      setState(() {
        _farms = results[0];
        _crops = results[1];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingView(message: 'Loading farm details...');
    }

    if (_error != null) {
      return ErrorView(message: _error!, onRetry: _loadData);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Farm Operating System'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_location_alt_outlined),
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddFarmScreen()),
              );
              _loadData();
            },
            tooltip: 'Add Farm',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Farms Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Registered Farms', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton.icon(
                    onPressed: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AddFarmScreen()),
                      );
                      _loadData();
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Add Farm'),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_farms.isEmpty)
                CustomCard(
                  child: Row(
                    children: [
                      const Icon(Icons.landscape, size: 36, color: AppColors.textSubtle),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('No farms registered yet', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('Tap Add Farm to register your land', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              else
                ..._farms.map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: CustomCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(f['name'] ?? 'Unnamed Farm', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                StatusBadge(label: '${f['total_area_acres'] ?? 0} Acres', color: AppColors.accent),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('📍 ${f['location_name'] ?? 'Unknown location'}', style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                    )),

              const SizedBox(height: 24),

              // 2. Active Crops Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Active Cultivation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  if (_farms.isNotEmpty)
                    TextButton.icon(
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => AddCropScreen(farms: _farms)),
                        );
                        _loadData();
                      },
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Add Crop'),
                    ),
                ],
              ),
              const SizedBox(height: 8),

              if (_crops.isEmpty)
                EmptyView(
                  title: 'No crops added yet',
                  subtitle: 'Add your current crop to track field observations and record harvests.',
                  icon: Icons.grass,
                  buttonText: _farms.isNotEmpty ? 'Add First Crop' : 'Add Farm First',
                  onButtonPressed: () async {
                    if (_farms.isNotEmpty) {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => AddCropScreen(farms: _farms)),
                      );
                      _loadData();
                    } else {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AddFarmScreen()),
                      );
                      _loadData();
                    }
                  },
                )
              else
                ..._crops.map((c) => Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: CustomCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('🌾 ${c['name'] ?? 'Crop'}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                StatusBadge(label: c['status'] ?? 'PLANTED', color: AppColors.primary),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text('Variety: ${c['variety'] ?? 'Standard'} • Area: ${c['acreage'] ?? 0} Acres', style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => AddObservationScreen(farmId: c['farm_id'], cropId: c['id'])),
                                    );
                                    _loadData();
                                  },
                                  icon: const Icon(Icons.visibility_outlined, size: 16),
                                  label: const Text('Observe', style: TextStyle(fontSize: 12)),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton.icon(
                                  onPressed: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => RecordHarvestScreen(cropId: c['id'], cropName: c['name'] ?? 'Crop')),
                                    );
                                    _loadData();
                                  },
                                  style: ElevatedButton.styleFrom(minimumSize: const Size(100, 36)),
                                  icon: const Icon(Icons.inventory_2_outlined, size: 16),
                                  label: const Text('Harvest', style: TextStyle(fontSize: 12)),
                                ),
                              ],
                            ),
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
