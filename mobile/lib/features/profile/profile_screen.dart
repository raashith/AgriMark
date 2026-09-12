import 'package:flutter/material.dart';
import '../../core/auth/secure_storage.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_card.dart';
import '../../core/widgets/loading_view.dart';
import '../onboarding/auth_repository.dart';
import 'profile_repository.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const ProfileScreen({super.key, required this.onLogout});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _profileRepo = ProfileRepository();
  final _authRepo = AuthRepository();

  bool _isLoading = true;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final user = await _profileRepo.fetchProfile();
      setState(() {
        _user = user;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingView(message: 'Loading farmer profile...');
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Farmer Profile & Settings')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.primary.withOpacity(0.2),
                    child: const Icon(Icons.person, size: 48, color: AppColors.primary),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _user?['full_name'] ?? 'Farmer User',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Phone: ${_user?['phone'] ?? 'N/A'} • Role: ${_user?['role'] ?? 'farmer'}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Account Metadata', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const Divider(height: 24, color: AppColors.cardBorder),
                  _buildRow('Application User ID', _user?['application_user_id'] ?? 'N/A'),
                  _buildRow('Profile ID', _user?['profile_id'] ?? 'N/A'),
                  _buildRow('Auth User ID', _user?['auth_user_id'] ?? 'N/A'),
                  _buildRow('Preferred Language', _user?['preferred_language']?.toUpperCase() ?? 'EN'),
                ],
              ),
            ),

            const SizedBox(height: 32),
            CustomButton(
              text: 'Log Out of AgriMark',
              isSecondary: true,
              onPressed: () async {
                await _authRepo.logout();
                widget.onLogout();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
          Flexible(
            child: Text(
              val,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
