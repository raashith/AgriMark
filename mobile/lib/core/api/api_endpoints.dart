import '../config/app_config.dart';

class ApiEndpoints {
  static const String baseUrl = '${AppConfig.apiBaseUrl}${AppConfig.apiPrefix}';

  // Authentication
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String logout = '$baseUrl/auth/logout';
  static const String refresh = '$baseUrl/auth/refresh';
  static const String me = '$baseUrl/auth/me';

  // Farmer Operations
  static const String farmerDashboard = '$baseUrl/farmer/dashboard';
  static const String farmerProfile = '$baseUrl/farmer/profile';
  static const String farmerFarms = '$baseUrl/farmer/farms';
  static const String farmerCrops = '$baseUrl/farmer/crops';
  static const String farmerObservations = '$baseUrl/farmer/observations';
  static const String farmerHarvests = '$baseUrl/farmer/harvests';
  static const String farmerInputs = '$baseUrl/farmer/inputs';
  static const String farmerLabour = '$baseUrl/farmer/labour';
  static const String farmerTasks = '$baseUrl/farmer/tasks';

  // Marketplace
  static const String marketplaceSearch = '$baseUrl/marketplace/search';
  static const String marketplaceListings = '$baseUrl/marketplace/listings';
  static const String marketplaceRfqs = '$baseUrl/marketplace/rfqs';
  static const String marketplaceOrders = '$baseUrl/marketplace/orders';

  // AgriAI
  static const String aiChat = '$baseUrl/ai/chat';

  // Tracking & Weather
  static const String locationLatest = '$baseUrl/tracking/latest';
  static const String locationPost = '$baseUrl/tracking/location';
  static const String weatherSignal = '$baseUrl/weather/signal';
  static const String marketPrice = '$baseUrl/market/prices';

  // Health Probe
  static const String healthDb = '$baseUrl/health/db';
}
