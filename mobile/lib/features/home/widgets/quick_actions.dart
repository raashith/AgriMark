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
    final actions = <_ActionData>[
      _ActionData(Icons.grass_outlined, 'Add Crop', AppColors.primary, onAddCrop),
      _ActionData(Icons.sell_outlined, 'Sell Produce', AppColors.accent, onSellProduce),
      _ActionData(Icons.storefront_outlined, 'Market', AppColors.statusInfo, onViewMarket),
      _ActionData(Icons.local_shipping_outlined, 'Pickup', AppColors.statusWarning, onBookPickup),
      _ActionData(Icons.auto_awesome, 'Ask AgriAI', AppColors.primaryDark, onAskAi),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What do you want to do?',
          style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: AppColors.textMain),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 96,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: actions.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final action = actions[index];
              return Semantics(
                button: true,
                label: action.label,
                child: InkWell(
                  onTap: action.onTap,
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    width: 92,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: action.color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(action.icon, color: action.color, size: 27),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          action.label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _ActionData {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionData(this.icon, this.label, this.color, this.onTap);
}
