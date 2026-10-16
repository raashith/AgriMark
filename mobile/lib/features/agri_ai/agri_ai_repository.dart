import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/errors/failure.dart';

class AgriAiRepository {
  final ApiClient _apiClient;

  AgriAiRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> sendChatMessage(String message) async {
    final body = {
      'message': message,
      'context': {'client': 'flutter_mobile'},
    };

    final response = await _apiClient.post(ApiEndpoints.aiChat, body: body);
    if (response is Map<String, dynamic>) {
      return response;
    }
    throw const ServerFailure('Invalid AgriAI response format.');
  }
}
