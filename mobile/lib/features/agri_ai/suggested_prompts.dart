import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class SuggestedPrompts extends StatelessWidget {
  final Function(String) onSelectPrompt;

  const SuggestedPrompts({super.key, required this.onSelectPrompt});

  static const _prompts = [
    'Should I sell my tomato today?',
    'Why are my leaves turning yellow?',
    'When should I irrigate my field?',
    "What is today's market price in Pollachi?",
    'How can I improve my crop yield?',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        itemCount: _prompts.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final prompt = _prompts[index];
          return ActionChip(
            backgroundColor: AppColors.chipBackground,
            side: const BorderSide(color: AppColors.cardBorder),
            label: Text(
              prompt,
              style: const TextStyle(fontSize: 12, color: AppColors.textMain),
            ),
            onPressed: () => onSelectPrompt(prompt),
          );
        },
      ),
    );
  }
}
