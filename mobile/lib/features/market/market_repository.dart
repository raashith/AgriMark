import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';

class MarketRepository {
  final ApiClient _apiClient;

  MarketRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<dynamic>> searchListings({String? commodity, double? maxPrice}) async {
    final params = <String>[];
    if (commodity != null && commodity.trim().isNotEmpty) {
      params.add('commodity=${Uri.encodeQueryComponent(commodity.trim())}');
    }
    if (maxPrice != null && maxPrice > 0) {
      params.add('max_price=$maxPrice');
    }
    final query = params.isEmpty ? '' : '?${params.join('&')}';
    final response = await _apiClient.get('${ApiEndpoints.marketplaceSearch}$query');
    if (response is List) return response;
    if (response is Map<String, dynamic>) {
      final items = response['items'] ?? response['data'] ?? response['listings'];
      if (items is List) return items;
    }
    return [];
  }

  Future<List<dynamic>> fetchListings() async {
    final response = await _apiClient.get(ApiEndpoints.listings);
    if (response is List) return response;
    return [];
  }

  Future<Map<String, dynamic>> createListing({
    required String lotId,
    required String title,
    required double pricePerKg,
    double minimumOrderQuantity = 1,
  }) async {
    final body = {
      'lot_id': lotId,
      'title': title,
      'price_per_unit': pricePerKg,
      'currency': 'INR',
      'min_order_quantity': minimumOrderQuantity,
      'status': 'active',
    };
    final response = await _apiClient.post(ApiEndpoints.listings, body: body);
    if (response is Map<String, dynamic>) return response;
    throw StateError('Invalid listing response.');
  }

  Future<List<dynamic>> fetchOrders() async {
    final response = await _apiClient.get(ApiEndpoints.marketplaceOrders);
    if (response is List) return response;
    return [];
  }

  Future<Map<String, dynamic>> placeOrder({
    required String listingId,
    required double quantity,
  }) async {
    final body = {
      'listing_id': listingId,
      'quantity': quantity,
      'unit': 'kg',
    };
    final response = await _apiClient.post(ApiEndpoints.marketplaceOrders, body: body);
    if (response is Map<String, dynamic>) return response;
    throw StateError('Invalid order response.');
  }

  Future<Map<String, dynamic>> getPriceGuidance({
    required String commodity,
    required String location,
  }) async {
    final body = {
      'message': 'Give market-price decision support for $commodity in $location. Use verified market data where available. Clearly distinguish observations, estimates, freshness, confidence and uncertainty. Do not invent prices.',
      'intent': 'market_price_guidance',
    };
    try {
      final response = await _apiClient.post(ApiEndpoints.aiChat, body: body);
      if (response is Map<String, dynamic>) return response;
      return {'reply': 'Market guidance is unavailable right now.', 'confidence': 0.0};
    } catch (_) {
      return {
        'reply': 'Live market price guidance is currently unavailable for $commodity.',
        'recommendation': 'REVIEW',
        'confidence': 0.0,
        'uncertainty': 'No verified intelligence response was available.',
      };
    }
  }
}
