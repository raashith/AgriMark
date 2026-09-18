'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'mr' | 'te' | 'kn';

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'கன்னட', flag: '🇮🇳' },
];

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    app_title: 'AgriMark',
    sub_title: 'Bharat Agricultural OS & Intelligence',
    login: 'Log In',
    register: 'Register',
    logout: 'Log Out',
    farmer: 'Farmer',
    buyer: 'Buyer',
    fpo: 'FPO / Co-op',
    logistics: 'Logistics',
    admin: 'Administrator',
    dashboard: 'Dashboard',
    farms: 'My Farms',
    marketplace: 'Live Mandi Marketplace',
    orders: 'Orders & Dispatches',
    inventory: 'Produce Inventory',
    finance: 'Farm Khaata',
    ai_assistant: 'AgriAI Assistant',
    today_focus: "Today's Focus & Tasks",
    weather: 'Live Weather',
    market_ticker: 'Mandi Price Ticker',
    search_placeholder: 'Search crops, mandi listings, orders...',
    create_listing: 'List Produce on Mandi',
    field_scouting: 'Field Scouting',
    add_farm: 'Register New Farm',
    record_harvest: 'Record Harvest Batch',
  },
  hi: {
    app_title: 'एग्रीमार्क',
    sub_title: 'भारत कृषि ऑपरेटिंग सिस्टम',
    login: 'लॉग इन करें',
    register: 'पंजीकरण करें',
    logout: 'लॉग आउट',
    farmer: 'किसान',
    buyer: 'खरीदार',
    fpo: 'एफपीओ',
    logistics: 'लॉजिस्टिक्स',
    admin: 'प्रशासक',
    dashboard: 'डैशबोर्ड',
    farms: 'मेरे खेत',
    marketplace: 'लाइव मंडी बाजार',
    orders: 'ऑर्डर और प्रेषण',
    inventory: 'उपज सूची',
    finance: 'फॉर्म खाता',
    ai_assistant: 'एग्री एआई सहायक',
    today_focus: 'आज का कार्य',
    weather: 'लाइव मौसम',
    market_ticker: 'मंडी मूल्य टिकर',
    search_placeholder: 'फसलें, मंडी की सूचियां खोजें...',
    create_listing: 'मंडी में उपज सूचीबद्ध करें',
    field_scouting: 'खेत का निरीक्षण',
    add_farm: 'नया खेत पंजीकृत करें',
    record_harvest: 'फसल की कटाई दर्ज करें',
  },
  ta: {
    app_title: 'அகிரிமார்க்',
    sub_title: 'பாரத் விவசாய இயங்குதளம்',
    login: 'உள்நுழைய',
    register: 'பதிவு செய்ய',
    logout: 'வெளியேறு',
    farmer: 'விவசாயி',
    buyer: 'கொள்முதல் செய்பவர்',
    fpo: 'எஃப்.பி.ஓ',
    logistics: 'போக்குவரத்து',
    admin: 'நிர்வாகி',
    dashboard: 'டாஷ்போர்டு',
    farms: 'என் பண்ணைகள்',
    marketplace: 'நேரடி சந்தை',
    orders: 'ஆர்டர்கள்',
    inventory: 'விளைபொருள் இருப்பு',
    finance: 'பண்ணை கணக்கு',
    ai_assistant: 'அகிரி AI உதவியாளர்',
    today_focus: 'இன்றைய வேலைகள்',
    weather: 'வானிலை',
    market_ticker: 'சந்தை விலை',
    search_placeholder: 'தேடுங்கள்...',
    create_listing: 'விற்பனை பட்டியல்',
    field_scouting: 'வயல் ஆய்வு',
    add_farm: 'புதிய பண்ணை சேர்',
    record_harvest: 'அறுவடை பதிவு',
  },
  mr: {
    app_title: 'अ‍ॅग्रीमार्क',
    sub_title: 'भारत कृषी ऑपरेटिंग सिस्टम',
    login: 'लॉग इन करा',
    register: 'नोंदणी करा',
    logout: 'लॉग आउट',
    farmer: 'शेतकरी',
    buyer: 'व्यापारी / खरेदीदार',
    fpo: 'एफपीओ',
    logistics: 'वाहतूकदार',
    admin: 'प्रशासक',
    dashboard: 'डॅशबोर्ड',
    farms: 'माझी शेती',
    marketplace: 'थेट मोंढा / बाजार',
    orders: 'ऑर्डर्स',
    inventory: 'माल साठा',
    finance: 'फॉर्म खाते',
    ai_assistant: 'अ‍ॅग्री एआय मदतनीस',
    today_focus: 'आजचे काम',
    weather: 'हवामान',
    market_ticker: 'बाजार भाव',
    search_placeholder: 'शोधा...',
    create_listing: 'माल विक्रीस काढा',
    field_scouting: 'पाहणी',
    add_farm: 'नवीन शेत जोडा',
    record_harvest: 'काढणी नोंदवा',
  },
  te: {
    app_title: 'అగ్రిమార్క్',
    sub_title: 'భారత్ వ్యవసాయ ఆపరేటింగ్ సిస్టమ్',
    login: 'లాగిన్',
    register: 'రిజిస్టర్',
    logout: 'లాగౌట్',
    farmer: 'రైతు',
    buyer: 'కొనుగోలుదారు',
    fpo: 'ఎఫ్‌పిఓ',
    logistics: 'లాజిస్టిక్స్',
    admin: 'అడ్మినిస్ట్రేటర్',
    dashboard: 'డాష్‌బోర్డ్',
    farms: 'నా పొలాలు',
    marketplace: 'మార్కెట్‌ప్లేస్',
    orders: 'ఆర్డర్లు',
    inventory: 'ఉత్పత్తి నిల్వలు',
    finance: 'ఫారం ఖాతా',
    ai_assistant: 'అగ్రి AI సహాయకుడు',
    today_focus: 'ఈరోజు పనులు',
    weather: 'వాతావరణం',
    market_ticker: 'మార్కెట్ ధరలు',
    search_placeholder: 'వెతకండి...',
    create_listing: 'ఉత్పత్తి విక్రయానికి ఉంచు',
    field_scouting: 'చేను పరిశీలన',
    add_farm: 'కొత్త పొలం జోడించు',
    record_harvest: 'కోత నమోదు',
  },
  kn: {
    app_title: 'ಅಗ್ರಿಮಾರ್ಕ್',
    sub_title: 'ಭಾರತ ಕೃಷಿ ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್',
    login: 'ಲಾಗಿನ್ ಮಾಡಿ',
    register: 'ನೋಂದಾಯಿಸಿ',
    logout: 'ಲಾಗ್ ಔಟ್',
    farmer: 'ರೈತ',
    buyer: 'ಖರೀದಿದಾರ',
    fpo: 'ಎಫ್‌ಪಿಒ',
    logistics: 'ಸಾರಿಗೆ',
    admin: 'ಆಡಳಿತಗಾರ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    farms: 'ನನ್ನ ಜಮೀನುಗಳು',
    marketplace: 'ಮಾರುಕಟ್ಟೆ',
    orders: 'ಆರ್ಡರ್‌ಗಳು',
    inventory: 'ಉತ್ಪನ್ನ ದಾಸ್ತಾನು',
    finance: 'ಖಾತೆ ಪುಸ್ತಕ',
    ai_assistant: 'ಅಗ್ರಿ AI ಸಹಾಯಕ',
    today_focus: 'ಇಂದಿನ ಕೆಲಸ',
    weather: 'ಹವಾಮಾನ',
    market_ticker: 'ಮಾರುಕಟ್ಟೆ ದರ',
    search_placeholder: 'ಹುಡುಕಿ...',
    create_listing: 'ಮಾರಾಟ ಪಟ್ಟಿ ಮಾಡಿ',
    field_scouting: 'ಹೊಲದ ವೀಕ್ಷಣೆ',
    add_farm: 'ಹೊಸ ಜಮೀನು ಸೇರಿಸಿ',
    record_harvest: 'ಕೊಯ್ಲು ದಾಖಲಿಸಿ',
  },
};

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (k, f) => f || k,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agrimark_lang') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrimark_lang', lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
