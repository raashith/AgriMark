import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class ChatMessageModel {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? actionRecommendation;

  ChatMessageModel({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.actionRecommendation,
  });
}

class ChatBubble extends StatelessWidget {
  final ChatMessageModel message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6.0),
        padding: const EdgeInsets.all(14.0),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        decoration: BoxDecoration(
          color: message.isUser ? AppColors.primary : AppColors.cardBackground,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(message.isUser ? 16 : 4),
            bottomRight: Radius.circular(message.isUser ? 4 : 16),
          ),
          border: message.isUser ? null : Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!message.isUser) ...[
              Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.psychology, size: 16, color: AppColors.accent),
                  SizedBox(width: 6),
                  Text('AgriAI Assistant', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.accent)),
                ],
              ),
              const SizedBox(height: 6),
            ],
            Text(
              message.text,
              style: TextStyle(
                color: message.isUser ? Colors.white : AppColors.textMain,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            if (message.actionRecommendation != null && message.actionRecommendation!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.chipBackground,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lightbulb_outline, size: 16, color: AppColors.statusWarning),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Recommended: ${message.actionRecommendation}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
