'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml' | 'mr' | 'bn' | 'gu' | 'pa';

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'AgriMark',
    tagline: 'Farmer-First Agricultural Marketplace & Intelligence OS',
    login: 'Log In',
    register: 'Register Account',
    logout: 'Log Out',
    farmer: 'Farmer',
    buyer: 'Buyer',
    fpo: 'FPO / Co-op',
    logistics: 'Logistics Partner',
    service_provider: 'Service Provider',
    selectRole: 'Select Your Role',
    email: 'Email Address',
    password: 'Password',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    location: 'Location / Village',
    dashboard: 'Dashboard',
    farms: 'My Farms',
    crops: 'My Crops',
    harvest: 'Harvest Logs',
    listings: 'Marketplace Listings',
    orders: 'Orders & Sales',
    marketPrices: 'Market Price Signals',
    agriAI: 'AgriAI Advisory',
    addFarm: 'Add New Farm',
    addCrop: 'Add Crop Cultivation',
    recordHarvest: 'Record Harvest',
    sellProduce: 'Sell Produce Lot',
    browseMarket: 'Browse Marketplace',
    viewOrders: 'View My Orders',
    checkPrices: 'Check Mandi Prices',
    askingPrice: 'Asking Price',
    quantity: 'Quantity',
    minOrderQty: 'Min Order Qty',
    qualityGrade: 'Quality Grade',
    placeOrder: 'Place Order',
    orderTotal: 'Order Total',
    status: 'Status',
    date: 'Date',
    action: 'Action',
    submit: 'Submit',
    cancel: 'Cancel',
    loading: 'Loading...',
    noData: 'No records found.',
    marketReference: 'Mandi Reference Price',
    farmerListingPrice: 'Farmer Listing Price',
    aiIntelligence: 'AI Intelligence & Signal',
    freshness: 'Data Freshness',
    confidence: 'Confidence Score',
    disclaimer: 'AI predictions are estimates provided for decision support.',
  },
  ta: {
    appName: 'அக்ரிமார்க் (AgriMark)',
    tagline: 'விவசாயிகளுக்கான முதன்மை வேளாண் சந்தை & அறிவுத்தளம்',
    login: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    logout: 'வெளியேறுக',
    farmer: 'விவசாயி',
    buyer: 'கொள்முதல் செய்பவர் (Buyer)',
    fpo: 'விவசாயி உற்பத்தியாளர் संस्था (FPO)',
    logistics: 'போக்குவரத்து கூட்னாளி',
    service_provider: 'சேவை வழங்குநர்',
    selectRole: 'உங்கள் பங்கினைக் தேர்ந்தெடுக்கவும்',
    email: 'மின்னஞ்சல் முகவரி',
    password: 'கடவுச்சொல்',
    fullName: 'முழு பெயர்',
    phoneNumber: 'தொலைபேசி எண்',
    location: 'இடம் / கிராமம்',
    dashboard: 'முகப்பு',
    farms: 'என் பண்ணைகள்',
    crops: 'என் பயிர்கள்',
    harvest: 'அறுவடை விபரம்',
    listings: 'சந்தை விற்பனை பட்டியல்கள்',
    orders: 'ஆர்டர்கள் & விற்பனை',
    marketPrices: 'சந்தை விலை விபரம்',
    agriAI: 'அக்ரி-AI ஆலோசனை',
    addFarm: 'புதிய பண்ணை சேர்க்க',
    addCrop: 'பயிர் சாகுபடி சேர்க்க',
    recordHarvest: 'அறுவடை பதிவு செய்ய',
    sellProduce: 'விளைபொருள் விற்பனை செய்ய',
    browseMarket: 'சந்தையை பார்வையிட',
    viewOrders: 'ஆர்டர்களை பார்க்க',
    checkPrices: 'மண்டி விலை அறிய',
    askingPrice: 'கேட்கும் விலை',
    quantity: 'அளவு',
    minOrderQty: 'குறைந்தபட்ச ஆர்டர் அளவு',
    qualityGrade: 'தரம் / தரம் குறியீடு',
    placeOrder: 'ஆர்டர் செய்ய',
    orderTotal: 'மொத்த தொகை',
    status: 'Status',
    date: 'தேதி',
    action: 'செயல்',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்து செய்',
    loading: 'ஏற்றப்படுகிறது...',
    noData: 'தகவல்கள் எதுவும் இல்லை.',
    marketReference: 'மண்டி குறிப்பு விலை',
    farmerListingPrice: 'விவசாயி விற்பனை விலை',
    aiIntelligence: 'AI நுண்ணறிவு கணிப்பு',
    freshness: 'தகவல் புதுமை',
    confidence: 'நம்பகத்தன்மை அளவு',
    disclaimer: 'AI கணிப்புகள் முடிவு எடுப்பதற்கான மதிப்பீடுகள் மட்டுமே.',
  },
  hi: {
    appName: 'एग्रीमार्क (AgriMark)',
    tagline: 'किसान-प्रथम कृषि बाजार और बुद्धिमत्ता प्रणाली',
    login: 'लॉग इन करें',
    register: 'खाता बनाएं',
    logout: 'लॉग आउट',
    farmer: 'किसान',
    buyer: 'खरीदार',
    fpo: 'एफपीओ / सहकारी',
    logistics: 'लॉजिस्टिक्स पार्टनर',
    service_provider: 'सेवा प्रदाता',
  },
  te: {}, kn: {}, ml: {}, mr: {}, bn: {}, gu: {}, pa: {}
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('agrimark_lang') as Language;
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agrimark_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
