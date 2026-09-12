import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';

class OrdersRepository {
  final ApiClient _apiClient;

  OrdersRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<List<dynamic>> fetchOrders() async {
    final response = await _apiClient.get(ApiEndpoints.marketplaceOrders);
    if (response is List) {
      return response;
    }
    return [];
  }

  Future<Map<String, dynamic>> fetchLocationLatest() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.locationLatest);
      if (response is Map<String, dynamic>) {
        return response;
      }
    } catch (_) {}
    return {
      'status': 'offline',
      'latitude': null,
      'longitude': null,
      'updated_at': null,
    };
  }

  Future<Map<String, dynamic>> postLocation({
    required double latitude,
    required double longitude,
    double? speed,
  }) async {
    final body = {
      'latitude': latitude,
      'longitude': longitude,
      if (speed != null) 'speed': speed,
      'timestamp': DateTime.now().toIso8601String(),
    };

    final response = await _apiClient.post(ApiEndpoints.locationPost, body: body);
    return response as Map<String, dynamic>;
  }
}
