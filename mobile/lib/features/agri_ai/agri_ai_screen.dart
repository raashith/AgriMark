import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'agri_ai_repository.dart';
import 'chat_bubble.dart';
import 'suggested_prompts.dart';

class AgriAiScreen extends StatefulWidget {
  final String? initialPrompt;

  const AgriAiScreen({super.key, this.initialPrompt});

  @override
  State<AgriAiScreen> createState() => _AgriAiScreenState();
}

class _AgriAiScreenState extends State<AgriAiScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  final _aiRepo = AgriAiRepository();

  final List<ChatMessageModel> _messages = [];
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _messages.add(
      ChatMessageModel(
        text: 'Hello Farmer! I am AgriAI, your farm operating assistant. Ask me anything about crop health, irrigation, market prices, or selling advice.',
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );

    if (widget.initialPrompt != null && widget.initialPrompt!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _sendMessage(widget.initialPrompt!);
      });
    }
  }

  Future<void> _sendMessage(String text) async {
    final cleanText = text.trim();
    if (cleanText.isEmpty || _isSending) return;

    _inputController.clear();
    setState(() {
      _messages.add(ChatMessageModel(
        text: cleanText,
        isUser: true,
        timestamp: DateTime.now(),
      ));
      _isSending = true;
    });

    _scrollToBottom();

    try {
      final res = await _aiRepo.sendChatMessage(cleanText);
      final reply = res['reply'] ?? res['recommendation'] ?? 'I received your question and processed it with current farm telemetry.';
      final recommendation = res['recommendation'];

      setState(() {
        _messages.add(ChatMessageModel(
          text: reply,
          isUser: false,
          timestamp: DateTime.now(),
          actionRecommendation: recommendation is String ? recommendation : null,
        ));
        _isSending = false;
      });
    } catch (e) {
      setState(() {
        _messages.add(ChatMessageModel(
          text: 'Sorry, I could not process your query right now. ${e.toString()}',
          isUser: false,
          timestamp: DateTime.now(),
        ));
        _isSending = false;
      });
    }

    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.psychology, color: AppColors.accent),
            SizedBox(width: 8),
            Text('AgriAI Farm Assistant'),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return ChatBubble(message: _messages[index]);
              },
            ),
          ),
          if (_isSending)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('AgriAI is analyzing farm telemetry...', style: TextStyle(fontSize: 12, color: AppColors.accent)),
              ),
            ),
          SuggestedPrompts(onSelectPrompt: _sendMessage),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            color: AppColors.cardBackground,
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      style: const TextStyle(color: AppColors.textMain),
                      decoration: const InputDecoration(
                        hintText: 'Ask AgriAI a question...',
                        hintStyle: TextStyle(color: AppColors.textSubtle),
                        border: InputBorder.none,
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: AppColors.primary),
                    onPressed: () => _sendMessage(_inputController.text),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
