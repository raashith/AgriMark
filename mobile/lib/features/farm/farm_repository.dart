import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/errors/failure.dart';

class FarmRepository {
  final ApiClient _apiClient;

  FarmRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<dynamic>> fetchCrops({String? search}) async {
    final path = search == null || search.trim().isEmpty
        ? ApiEndpoints.crops
        : '${ApiEndpoints.crops}?search=${Uri.encodeQueryComponent(search.trim())}';
    final response = await _apiClient.get(path);
    if (response is Map<String, dynamic>) {
      final items = response['items'] ?? response['data'];
      if (items is List) return items;
    }
    if (response is List) return response;
    return [];
  }

  Future<List<dynamic>> fetchFarms(String profileId) async {
    final response = await _apiClient.get('${ApiEndpoints.profiles}/$profileId/farms');
    if (response is List) return response;
    return [];
  }

  Future<Map<String, dynamic>> createFarm({
    required String profileId,
    required String name,
    String? village,
    String? district,
    String? state,
    double? latitude,
    double? longitude,
    double? areaAcres,
  }) async {
    final body = {
      'name': name,
      if (village != null) 'village': village,
      if (district != null) 'district': district,
      if (state != null) 'state': state,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (areaAcres != null) 'area_acres': areaAcres,
    };

    final response = await _apiClient.post(
      '${ApiEndpoints.profiles}/$profileId/farms',
      body: body,
    );
    if (response is Map<String, dynamic>) return response;
    throw const ServerFailure('Invalid farm response format.');
  }

  Future<List<dynamic>> fetchCultivations({String? farmId, String? cropId}) async {
    final params = <String>[];
    if (farmId != null) params.add('farm_id=${Uri.encodeQueryComponent(farmId)}');
    if (cropId != null) params.add('crop_id=${Uri.encodeQueryComponent(cropId)}');
    final query = params.isEmpty ? '' : '?${params.join('&')}';
    final response = await _apiClient.get('${ApiEndpoints.cultivations}$query');
    if (response is List) return response;
    return [];
  }

  Future<Map<String, dynamic>> createCultivation({
    required String farmId,
    required String cropId,
    String? season,
    String? sowingDate,
    String? expectedHarvestDate,
    double? areaAcres,
  }) async {
    final body = {
      'farm_id': farmId,
      'crop_id': cropId,
      if (season != null) 'season': season,
      if (sowingDate != null) 'sowing_date': sowingDate,
      if (expectedHarvestDate != null) 'expected_harvest_date': expectedHarvestDate,
      if (areaAcres != null) 'area_acres': areaAcres,
    };
    final response = await _apiClient.post(ApiEndpoints.cultivations, body: body);
    if (response is Map<String, dynamic>) return response;
    throw const ServerFailure('Invalid cultivation response format.');
  }

  Future<Map<String, dynamic>> recordHarvest({
    required String cropId,
    String? cultivationId,
    required double quantityKg,
    required String harvestDate,
    String? qualityGrade,
  }) async {
    final body = {
      'crop_id': cropId,
      if (cultivationId != null) 'cultivation_id': cultivationId,
      'quantity': quantityKg,
      'unit': 'kg',
      if (qualityGrade != null) 'quality_grade': qualityGrade,
      'available_quantity': quantityKg,
      'status': 'available',
      'harvested_at': harvestDate,
    };
    final response = await _apiClient.post(ApiEndpoints.produceLots, body: body);
    if (response is Map<String, dynamic>) return response;
    throw const ServerFailure('Invalid produce lot response format.');
  }

  Future<List<dynamic>> fetchHarvestLots() async {
    final response = await _apiClient.get(ApiEndpoints.produceLots);
    if (response is List) return response;
    return [];
  }
}
