import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/errors/failure.dart';

class FarmRepository {
  final ApiClient _apiClient;

  FarmRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> fetchDashboard() async {
    final response = await _apiClient.get(ApiEndpoints.farmerDashboard);
    if (response is Map<String, dynamic>) {
      return response;
    }
    throw const ServerFailure('Invalid dashboard response format.');
  }

  Future<List<dynamic>> fetchFarms() async {
    final response = await _apiClient.get(ApiEndpoints.farmerFarms);
    if (response is List) {
      return response;
    }
    return [];
  }

  Future<Map<String, dynamic>> createFarm({
    required String name,
    required String locationName,
    required double totalAreaAcres,
    double? latitude,
    double? longitude,
    String? soilType,
    String? irrigationSource,
  }) async {
    final body = {
      'name': name,
      'location_name': locationName,
      'total_area_acres': totalAreaAcres,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (soilType != null) 'soil_type': soilType,
      if (irrigationSource != null) 'irrigation_source': irrigationSource,
    };

    final response = await _apiClient.post(ApiEndpoints.farmerFarms, body: body);
    return response as Map<String, dynamic>;
  }

  Future<List<dynamic>> fetchCrops() async {
    final response = await _apiClient.get(ApiEndpoints.farmerCrops);
    if (response is List) {
      return response;
    }
    return [];
  }

  Future<Map<String, dynamic>> addCrop({
    required String farmId,
    required String name,
    String? variety,
    required String sowingDate,
    String? expectedHarvestDate,
    required double acreage,
  }) async {
    final body = {
      'farm_id': farmId,
      'name': name,
      if (variety != null) 'variety': variety,
      'sowing_date': sowingDate,
      if (expectedHarvestDate != null) 'expected_harvest_date': expectedHarvestDate,
      'acreage': acreage,
      'status': 'PLANTED',
    };

    final response = await _apiClient.post(ApiEndpoints.farmerCrops, body: body);
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> recordObservation({
    required String farmId,
    String? cropId,
    required String observationNotes,
    String observationCategory = 'GENERAL',
  }) async {
    final body = {
      'farm_id': farmId,
      if (cropId != null) 'crop_id': cropId,
      'observation_notes': observationNotes,
      'observation_category': observationCategory,
      'observed_at': DateTime.now().toIso8601String(),
    };

    final response = await _apiClient.post(ApiEndpoints.farmerObservations, body: body);
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> recordHarvest({
    required String cropId,
    required double quantityKg,
    required String harvestDate,
    String qualityGrade = 'STANDARD',
  }) async {
    final body = {
      'crop_id': cropId,
      'quantity_kg': quantityKg,
      'harvest_date': harvestDate,
      'quality_grade': qualityGrade,
    };

    final response = await _apiClient.post(ApiEndpoints.farmerHarvests, body: body);
    return response as Map<String, dynamic>;
  }
}
