import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('en'));
  }

  static const _localizedValues = <String, Map<String, String>>{
    'en': {
      'app_title': 'AgriMark',
      'nav_home': 'Home',
      'nav_farm': 'Farm',
      'nav_market': 'Market',
      'nav_orders': 'Orders',
      'nav_agri_ai': 'AgriAI',
      'quick_add_crop': 'Add Crop',
      'quick_sell_produce': 'Sell Produce',
      'quick_view_market': 'View Market',
      'quick_book_pickup': 'Book Pickup',
      'quick_ask_ai': 'Ask AgriAI',
      'weather_title': 'Weather & Climate',
      'crop_health_title': 'Crop Health',
      'market_signal_title': 'Market Signals',
      'best_action_title': "Today's Best Action",
      'live_data_unavailable': 'Live data unavailable',
      'forecast_unavailable': 'Forecast unavailable',
      'no_observation': 'No recent observation',
      'offline_banner': 'Offline — showing your last saved farm information',
      'sign_in': 'Sign In',
      'register': 'Create Account',
      'logout': 'Log Out',
    },
    'ta': {
      'app_title': 'அக்ரிமார்க்',
      'nav_home': 'முகப்பு',
      'nav_farm': 'பண்ணை',
      'nav_market': 'சந்தை',
      'nav_orders': 'ஆர்டர்கள்',
      'nav_agri_ai': 'அக்ரி-AI',
      'quick_add_crop': 'பயிர் சேர்க்க',
      'quick_sell_produce': 'விற்பனை செய்ய',
      'quick_view_market': 'சந்தை விலை',
      'quick_book_pickup': 'வாகனம் பதிவு',
      'quick_ask_ai': 'AI கேட்க',
      'weather_title': 'வானிலை தகவல்',
      'crop_health_title': 'பயிர் ஆரோக்கியம்',
      'market_signal_title': 'சந்தை நிலவரம்',
      'best_action_title': 'இன்றைய சிறந்த செயல்',
      'live_data_unavailable': 'நேரலை தகவல் கிடைக்கவில்லை',
      'forecast_unavailable': 'முன்னறிவிப்பு கிடைக்கவில்லை',
      'no_observation': 'சமீபத்திய அவதானிப்பு இல்லை',
      'offline_banner': 'ஆஃப்லைன் — சேமிக்கப்பட்ட தகவல்கள் காட்டப்படுகின்றன',
      'sign_in': 'உள்நுழைக',
      'register': 'பதிவு செய்க',
      'logout': 'வெளியேறு',
    },
  };

  String get(String key) {
    return _localizedValues[locale.languageCode]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'ta'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}
