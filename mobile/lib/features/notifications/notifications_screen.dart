import 'package:flutter/material.dart';
import '../../core/widgets/empty_view.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications & Alerts')),
      body: const EmptyView(
        title: 'No new notifications',
        subtitle: 'Weather advisories, buyer offers, and field recommendations will appear here.',
        icon: Icons.notifications_none_outlined,
      ),
    );
  }
}
