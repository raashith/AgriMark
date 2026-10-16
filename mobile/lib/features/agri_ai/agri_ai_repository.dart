import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/errors/failure.dart';
import '../market/market_repository.dart';

class AgriAiRepository {
  final ApiClient _apiClient;
  final MarketRepository _marketRepository;

  AgriAiRepository({ApiClient? apiClient, MarketRepository? marketRepository})
      : _apiClient = apiClient ?? ApiClient(),
        _marketRepository = marketRepository ?? MarketRepository();

  Future<Map<String, dynamic>> sendChatMessage(String message) async {
    final groundedMessage = await _addOfficialMarketContext(message);
    final body = {
      'message': groundedMessage,
      'context': {
        'client': 'flutter_mobile',
        'market_data_source': 'AGMARKNET',
        'market_data_grounded': groundedMessage != message,
      },
    };

    final response = await _apiClient.post(ApiEndpoints.aiChat, body: body);
    if (response is Map<String, dynamic>) {
      return response;
    }
    throw const ServerFailure('Invalid AgriAI response format.');
  }

  Future<String> _addOfficialMarketContext(String message) async {
    final text = message.trim().toLowerCase();
    final marketIntent = RegExp(
      r'price|mandi|market|sell|selling|rate|bhav|விலை|சந்தை|விற்க|மண்டி|ధర|మార్కెట్|ಬೆಲೆ|മാർക്കറ്റ്|कीमत|मंडी|भाव|कीमत',
      caseSensitive: false,
    ).hasMatch(text);
    if (!marketIntent) return message;

    try {
      final filters = await _marketRepository.fetchNationalMarketFilters();
      final commodityOptions = (filters['commodities'] as List<dynamic>? ?? [])
          .whereType<Map>()
          .map((row) => Map<String, String>.from(row))
          .toList();
      final stateOptions = (filters['states'] as List<dynamic>? ?? [])
          .whereType<Map>()
          .map((row) => Map<String, String>.from(row))
          .toList();
      final districtOptions = (filters['districts'] as List<dynamic>? ?? [])
          .whereType<Map>()
          .map((row) => Map<String, String>.from(row))
          .toList();
      final mandiOptions = (filters['mandis'] as List<dynamic>? ?? [])
          .whereType<Map>()
          .map((row) => Map<String, String>.from(row))
          .toList();

      Map<String, String>? matchOption(List<Map<String, String>> options, String input) {
        final normalized = input.toLowerCase();
        for (final option in options) {
          final code = (option['code'] ?? '').toLowerCase();
          final name = (option['name'] ?? '').toLowerCase();
          if ((name.isNotEmpty && (normalized.contains(name) || name.contains(normalized))) ||
              (code.isNotEmpty && normalized.contains(code))) {
            return option;
          }
        }
        return null;
      }

      final commodity = matchOption(commodityOptions, text);
      final state = matchOption(stateOptions, text);
      final district = matchOption(districtOptions, text);
      final mandi = matchOption(mandiOptions, text);
      final records = await _marketRepository.fetchNationalMarketPrices(
        commodity: commodity?['code'] ?? '',
        state: state?['code'] ?? '',
        district: district?['code'] ?? '',
        mandi: mandi?['code'] ?? '',
        limit: 8,
      );
      if (records.isEmpty) {
        return '$message

Official market-data check: no matching AGMARKNET observation was returned for this query. '
            'Do not invent or assume a price. Explain that a matching observation was not found and ask the farmer '
            'to specify a commodity and/or state, district, or mandi.';
      }

      String nameFor(List<Map<String, String>> options, dynamic code) {
        final key = code?.toString() ?? '';
        for (final option in options) {
          if (option['code'] == key) return option['name'] ?? key;
        }
        return key;
      }

      final selected = records.where((raw) {
        final row = Map<String, dynamic>.from(raw as Map);
        if (commodity != null && row['commodity_code'] != commodity['code']) return false;
        if (state != null && row['state_code'] != state['code']) return false;
        if (district != null && row['district_code'] != district['code']) return false;
        if (mandi != null && row['mandi_code'] != mandi['code']) return false;
        return true;
      }).take(6).toList();

      if (selected.isEmpty) {
        return '$message

Official market-data check: no stored observation matched all the specified filters. '
            'Do not invent a price; tell the farmer that no matching record was found.';
      }

      final lines = selected.map((raw) {
        final row = Map<String, dynamic>.from(raw as Map);
        return '- Date: ${row['observation_date']}; commodity: ${nameFor(commodityOptions, row['commodity_code'])}; '
            'mandi: ${nameFor(mandiOptions, row['mandi_code'])}; '
            'district: ${nameFor(districtOptions, row['district_code'])}; '
            'state: ${nameFor(stateOptions, row['state_code'])}; '
            'min: ₹${row['min_price']}/quintal; modal: ₹${row['modal_price']}/quintal; '
            'max: ₹${row['max_price']}/quintal; source: ${row['source'] ?? 'AGMARKNET'}.';
      }).join('
');

      return '$message

Verified stored AGMARKNET observations (historical records, not live quotes):
'
          '$lines

Use only these records for numerical price claims. Clarify the observation date and location. '
          'Do not present the observed prices as a prediction or guarantee; if the question asks for a forecast, '
          'state that these records alone do not establish a reliable forecast.';
    } catch (_) {
      // Do not block the chat if the optional public market context is unavailable.
      return '$message

Market-data context could not be fetched right now. Do not invent a price; '
          'say that verified market data is temporarily unavailable if asked for specific current prices.';
    }
  }
}
