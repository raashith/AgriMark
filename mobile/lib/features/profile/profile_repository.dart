import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';

class ProfileRepository {
  final ApiClient _apiClient;

  ProfileRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> fetchProfile() async {
    final response = await _apiClient.get(ApiEndpoints.me);
    return response as Map<String, dynamic>;
  }
}
