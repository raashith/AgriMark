import '../config/app_config.dart';

class ApiEndpoints {
  static const String baseUrl = '${AppConfig.apiBaseUrl}${AppConfig.apiPrefix}';

  // Authentication
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String logout = '$baseUrl/auth/logout';
  static const String refresh = '$baseUrl/auth/refresh';
  static const String me = '$baseUrl/auth/me';

  // Canonical agricultural resources
  static const String crops = '$baseUrl/core/crops';
  static const String profiles = '$baseUrl/core/profiles';
  static String profileFarms(String profileId) => '$baseUrl/core/profiles/$profileId/farms';
  static const String cultivations = '$baseUrl/core/cultivations';
  static const String produceLots = '$baseUrl/core/produce-lots';
  static const String listings = '$baseUrl/core/listings';

  // Marketplace
  static const String marketplaceSearch = '$baseUrl/marketplace/search';
  static const String marketplaceListings = '$baseUrl/marketplace/listings';
  static const String marketplaceRfqs = '$baseUrl/marketplace/rfqs';
  static const String marketplaceOrders = '$baseUrl/marketplace/orders';

  // AgriAI and intelligence
  static const String aiChat = '$baseUrl/ai/chat';
  static const String weatherSignal = '$baseUrl/weather/signal';
  static const String marketPrice = '$baseUrl/market/prices';

  // Tracking
  static const String locationLatest = '$baseUrl/tracking/latest';
  static const String locationPost = '$baseUrl/tracking/location';

  // Health
  static const String healthDb = '$baseUrl/health/db';
}
