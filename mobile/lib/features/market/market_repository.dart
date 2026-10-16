import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';

class MarketRepository {
  final ApiClient _apiClient;
  final http.Client _publicClient;

  MarketRepository({ApiClient? apiClient, http.Client? publicClient})
      : _apiClient = apiClient ?? ApiClient(),
        _publicClient = publicClient ?? http.Client();

  static const String _supabaseUrl = 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
  static const String _publishableKey = 'sb_publishable_YvBVc_mQXS5606qGvJqZ1g_kg9ot7TF';

  Future<List<dynamic>> searchListings({String? commodity, double? maxPrice}) async {
    final params = <String>[];
    if (commodity != null && commodity.isNotEmpty) {
      params.add('commodity=${Uri.encodeQueryComponent(commodity)}');
    }
    if (maxPrice != null && maxPrice > 0) params.add('max_price=$maxPrice');
    final queryString = params.isNotEmpty ? '?${params.join('&')}' : '';
    final response = await _apiClient.get('${ApiEndpoints.marketplaceSearch}$queryString');
    if (response is List) return response;
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

  /// Reads market data with a client-safe publishable key; never use service-role credentials in an app.
  Future<List<dynamic>> fetchNationalMarketPrices({
    String commodity = '',
    String state = '',
    String district = '',
    int limit = 100,
  }) async {
    final query = <String, String>{
      'select': 'observation_date,state_code,district_code,mandi_code,commodity_code,variety,grade,min_price,max_price,modal_price,source',
      'order': 'observation_date.desc',
      'limit': '$limit',
    };
    if (commodity.isNotEmpty) query['commodity_code'] = 'eq.$commodity';
    if (state.isNotEmpty) query['state_code'] = 'eq.$state';
    if (district.isNotEmpty) query['district_code'] = 'eq.$district';

    final uri = Uri.parse('$_supabaseUrl/rest/v1/national_market_price_observations')
        .replace(queryParameters: query);
    final response = await _publicClient.get(uri, headers: {
      'apikey': _publishableKey,
      'Authorization': 'Bearer $_publishableKey',
      'Accept': 'application/json',
    }).timeout(const Duration(seconds: 20));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Market price service returned ${response.statusCode}. Please refresh or try again later.');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! List) throw const FormatException('Unexpected market price response.');
    return decoded;
  }

  Future<Map<String, dynamic>> fetchNationalMarketFilters() async {
    Future<List<dynamic>> fetchDimension(String table, String codeColumn, String nameColumn) async {
      final uri = Uri.parse('$_supabaseUrl/rest/v1/$table').replace(
        queryParameters: {
          'select': '$codeColumn,$nameColumn',
          'order': '$nameColumn.asc',
          'limit': '2000',
        },
      );
      final response = await _publicClient.get(uri, headers: {
        'apikey': _publishableKey,
        'Authorization': 'Bearer $_publishableKey',
        'Accept': 'application/json',
      }).timeout(const Duration(seconds: 20));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('Could not load market filters (${response.statusCode}).');
      }
      final decoded = jsonDecode(response.body);
      if (decoded is! List) throw const FormatException('Invalid market filter response.');
      return decoded;
    }

    final values = await Future.wait([
      fetchDimension('national_commodities', 'code', 'name'),
      fetchDimension('national_states', 'state_code', 'state_name'),
      fetchDimension('national_districts', 'district_code', 'district_name'),
      fetchDimension('national_mandis', 'mandi_code', 'mandi_name'),
    ]);

    List<Map<String, String>> normalize(List<dynamic> rows, String codeColumn, String nameColumn) {
      final byCode = <String, Map<String, String>>{};
      for (final row in rows) {
        if (row is! Map) continue;
        final code = row[codeColumn]?.toString() ?? '';
        final name = row[nameColumn]?.toString() ?? '';
        if (code.isNotEmpty) byCode[code] = {'code': code, 'name': name.isNotEmpty ? name : code};
      }
      final result = byCode.values.toList();
      result.sort((a, b) => a['name']!.compareTo(b['name']!));
      return result;
    }

    return {
      'commodities': normalize(values[0], 'code', 'name'),
      'states': normalize(values[1], 'state_code', 'state_name'),
      'districts': normalize(values[2], 'district_code', 'district_name'),
      'mandis': normalize(values[3], 'mandi_code', 'mandi_name'),
    };
  }

  Future<Map<String, dynamic>> getPriceGuidance({
    required String commodity,
    required String location,
  }) async {
    final body = {
      'message': 'Provide selling price guidance for $commodity in $location using stored official observations. '
          'Separate observed facts from estimates and never invent a price.',
    };
    try {
      final response = await _apiClient.post(ApiEndpoints.aiChat, body: body);
      return response as Map<String, dynamic>;
    } catch (_) {
      return {
        'reply': 'Live market price guidance is currently unavailable for $commodity. Please try again later.',
        'recommendation': 'REVIEW',
        'confidence': 0.0,
      };
    }
  }
}
