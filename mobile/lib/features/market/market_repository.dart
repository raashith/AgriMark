import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';

class MarketRepository {
  final ApiClient _apiClient;

  MarketRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<List<dynamic>> searchListings({String? commodity, double? maxPrice}) async {
    final params = <String>[];
    if (commodity != null && commodity.isNotEmpty) params.add('commodity=$commodity');
    if (maxPrice != null && maxPrice > 0) params.add('max_price=$maxPrice');

    final queryString = params.isNotEmpty ? '?${params.join('&')}' : '';
    final response = await _apiClient.get('${ApiEndpoints.marketplaceSearch}$queryString');
    if (response is List) {
      return response;
    }
    return [];
  }

  Future<Map<String, dynamic>> createListing({
    required String lotId,
    required String title,
    String? description,
    required double pricePerKg,
    required double availableQuantityKg,
  }) async {
    final body = {
      'lot_id': lotId,
      'title': title,
      if (description != null) 'description': description,
      'price_per_kg': pricePerKg,
      'available_quantity_kg': availableQuantityKg,
    };

    final response = await _apiClient.post(ApiEndpoints.marketplaceListings, body: body);
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPriceGuidance({
    required String commodity,
    required String location,
  }) async {
    final body = {
      'message': 'Provide selling price guidance for $commodity in $location. Should I sell now or wait?',
    };

    try {
      final response = await _apiClient.post(ApiEndpoints.aiChat, body: body);
      return response as Map<String, dynamic>;
    } catch (_) {
      return {
        'reply': 'Live market price forecast is currently unavailable for $commodity.',
        'recommendation': 'REVIEW',
        'confidence': 0.0,
      };
    }
  }
}
