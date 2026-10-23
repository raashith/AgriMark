'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml' | 'mr' | 'bn' | 'gu' | 'pa';

export const SUPPORTED_LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

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
    fpo: 'விவசாயி உற்பத்தியாளர் நிறுவனம் (FPO)',
    logistics: 'போக்குவரத்து கூட்டாளி',
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
    qualityGrade: 'தரம் குறியீடு',
    placeOrder: 'ஆர்டர் செய்ய',
    orderTotal: 'மொத்த தொகை',
    status: 'நிலை',
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
    fpo: 'एफपीओ / सहकारी समिति',
    logistics: 'लॉजिस्टिक्स पार्टनर',
    service_provider: 'सेवा प्रदाता',
    selectRole: 'अपनी भूमिका चुनें',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    location: 'स्थान / गांव',
    dashboard: 'डैशबोर्ड',
    farms: 'मेरे खेत',
    crops: 'मेरी फसलें',
    harvest: 'कटाई रिकॉर्ड',
    listings: 'बाजार सूची',
    orders: 'ऑर्डर और बिक्री',
    marketPrices: 'बाजार मूल्य संकेत',
    agriAI: 'एग्री-AI सलाह',
    addFarm: 'नया खेत जोड़ें',
    addCrop: 'फसल की खेती जोड़ें',
    recordHarvest: 'कटाई दर्ज करें',
    sellProduce: 'उत्पाद बेचें',
    browseMarket: 'बाजार देखें',
    viewOrders: 'मेरे ऑर्डर देखें',
    checkPrices: 'मंडी भाव देखें',
    askingPrice: 'मांग मूल्य',
    quantity: 'मात्रा',
    minOrderQty: 'न्यूनतम ऑर्डर मात्रा',
    qualityGrade: 'गुणवत्ता श्रेणी',
    placeOrder: 'ऑर्डर दें',
    orderTotal: 'कुल योग',
    status: 'स्थिति',
    date: 'तिथि',
    action: 'कार्रवाई',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',
    noData: 'कोई रिकॉर्ड नहीं मिला।',
    marketReference: 'मंडी संदर्भ मूल्य',
    farmerListingPrice: 'किसान सूची मूल्य',
    aiIntelligence: 'AI बुद्धिमत्ता और संकेत',
    freshness: 'डेटा ताज़गी',
    confidence: 'विश्वसनीयता स्कोर',
    disclaimer: 'AI अनुमान निर्णय सहायता के लिए प्रदान किए गए हैं।',
  },
  te: {
    appName: 'అగ్రిమార్క్ (AgriMark)',
    tagline: 'రైతు-మొదటి వ్యవసాయ మార్కెట్‌ప్లేస్ & నిఘా వ్యవస్థ',
    login: 'లాగిన్',
    register: 'ఖాతా తెరవండి',
    logout: 'లాగ్ అవుట్',
    farmer: 'రైతు',
    buyer: 'కొనుగోలుదారు',
    fpo: 'ఎఫ్.పి.ఓ / సహకార సంస్థ',
    logistics: 'రవాణా భాగస్వామి',
    service_provider: 'సేవా వివరాలు',
    selectRole: 'మీ పాత్రను ఎంచుకోండి',
    email: 'ఈమెయిల్ చిరునామా',
    password: 'పాస్‌వర్డ్',
    fullName: 'పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    location: 'ప్రాంతం / గ్రామం',
    dashboard: 'డాష్‌బోర్డ్',
    farms: 'నా పొలాలు',
    crops: 'నా పంటలు',
    harvest: 'కోత రికార్డులు',
    listings: 'మార్కెట్‌ప్లేస్ జాబితాలు',
    orders: 'ఆర్డర్లు & అమ్మకాలు',
    marketPrices: 'మార్కెట్ ధర సంకేతాలు',
    agriAI: 'అగ్రి-AI సలహా',
    addFarm: 'కొత్త పొలం జోడించు',
    addCrop: 'పంట సాగును జోడించు',
    recordHarvest: 'కోత నమోదు చేయండి',
    sellProduce: 'ఉత్పత్తిని విక్రయించండి',
    browseMarket: 'మార్కెట్‌ప్లేస్ చూడండి',
    viewOrders: 'నా ఆర్డర్‌లను చూడండి',
    checkPrices: 'మండీ ధరలను తనిఖీ చేయండి',
    askingPrice: 'అడుగుతున్న ధర',
    quantity: 'పరిమాణం',
    minOrderQty: 'కనీస ఆర్డర్ పరిమాణం',
    qualityGrade: 'నాణ్యత గ్రేడ్',
    placeOrder: 'ఆర్డర్ చేయండి',
    orderTotal: 'మొత్తం ఆర్డర్',
    status: 'స్థితి',
    date: 'తేదీ',
    action: 'చర్య',
    submit: 'సమర్పించండి',
    cancel: 'రద్దు చేయి',
    loading: 'లోడ్ అవుతోంది...',
    noData: 'ఏ రికార్డులు లేవు.',
    marketReference: 'మండీ సూచన ధర',
    farmerListingPrice: 'రైతు జాబితా ధర',
    aiIntelligence: 'AI నిఘా & సంకేతం',
    freshness: 'డేటా తాజాదనం',
    confidence: 'నమ్మకం స్కోరు',
    disclaimer: 'AI అంచనాలు నిర్ణయ మద్దతు కోసం మాత్రమే అందించబడ్డాయి.',
  },
  kn: {
    appName: 'ಅಗ್ರಿಮಾರ್ಕ್ (AgriMark)',
    tagline: 'ರೈತ-ಮೊದಲ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಬುದ್ಧಿವಂತ ವ್ಯವಸ್ಥೆ',
    login: 'ಲಾಗಿನ್ ಮಾಡಿ',
    register: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    logout: 'ಲಾಗ್ ಔಟ್',
    farmer: 'ರೈತ',
    buyer: 'ಖರೀದಿದಾರ',
    fpo: 'ಎಫ್‌ಪಿಒ / ಸಹಕಾರಿ ಸಂಸ್ಥೆ',
    logistics: 'ಸಾರಿಗೆ ಪಾಲುದಾರ',
    service_provider: 'ಸೇವೆ ಒದಗಿಸುವವರು',
    selectRole: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    phoneNumber: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    location: 'ಸ್ಥಳ / ಗ್ರಾಮ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    farms: 'ನನ್ನ ಜಮೀನುಗಳು',
    crops: 'ನನ್ನ ಬೆಳೆಗಳು',
    harvest: 'ಕೊಯ್ಲು ದಾಖಲೆಗಳು',
    listings: 'ಮಾರುಕಟ್ಟೆ ಪಟ್ಟಿಗಳು',
    orders: 'ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಮಾರಾಟ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಸೂಚನೆಗಳು',
    agriAI: 'ಅಗ್ರಿ-AI ಸಲಹೆ',
    addFarm: 'ಹೊಸ ಜಮೀನು ಸೇರಿಸಿ',
    addCrop: 'ಬೆಳೆ ಸಾಕು ಸೇರಿಸಿ',
    recordHarvest: 'ಕೊಯ್ಲು ದಾಖಲಿಸಿ',
    sellProduce: 'ಉತ್ಪನ್ನ ಮಾರಾಟ ಮಾಡಿ',
    browseMarket: 'ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಿಸಿ',
    viewOrders: 'ನನ್ನ ಆರ್ಡರ್ ನೋಡಿ',
    checkPrices: 'ಮಂಡಿ ಬೆಲೆ ಪರಿಶೀಲಿಸಿ',
    askingPrice: 'ಕೇಳುವ ಬೆಲೆ',
    quantity: 'ಪ್ರಮಾಣ',
    minOrderQty: 'ಕನಿಷ್ಠ ಆರ್ಡರ್ ಪ್ರಮಾಣ',
    qualityGrade: 'ಗುಣಮಟ್ಟದ ಗ್ರೇಡ್',
    placeOrder: 'ಆರ್ಡರ್ ಮಾಡಿ',
    orderTotal: 'ಒಟ್ಟು ಮೊತ್ತ',
    status: 'ಸ್ಥಿತಿ',
    date: 'ದಿನಾಂಕ',
    action: 'ಕ್ರಿಯೆ',
    submit: 'ಸಲ್ಲಿಸಿ',
    cancel: 'ರದ್ದುಗೊಳಿಸಿ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noData: 'ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    marketReference: 'ಮಂಡಿ ಉಲ್ಲೇಖ ಬೆಲೆ',
    farmerListingPrice: 'ರೈತರ ಪಟ್ಟಿ ಬೆಲೆ',
    aiIntelligence: 'AI ಬುದ್ಧಿವಂತಿಕೆ ಮತ್ತು ಸೂಚನೆ',
    freshness: 'ಡೇಟಾ ತಾಜಾತನ',
    confidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್',
    disclaimer: 'AI ಅಂದಾಜುಗಳು ನಿರ್ಧಾರ ಬೆಂಬಲಕ್ಕಾಗಿ ನೀಡಲಾದ ಮುನ್ಸೂಚನೆಗಳಾಗಿವೆ.',
  },
  ml: {
    appName: 'അഗ്രിമാർക്ക് (AgriMark)',
    tagline: 'കർഷക-പ്രഥമ കാർഷിക വിപണനശാലയും വിവര സംവിധാനവും',
    login: 'ലോഗിൻ ചെയ്യുക',
    register: 'അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യുക',
    logout: 'ലോഗ് ഔട്ട്',
    farmer: 'കർഷകൻ',
    buyer: 'വാങ്ങുന്നയാൾ (Buyer)',
    fpo: 'എഫ്.പി.ഒ / സഹകരണ സംഘം',
    logistics: 'ലോജിസ്റ്റിക്സ് പങ്കാളി',
    service_provider: 'സേവന ദാതാവ്',
    selectRole: 'നിങ്ങളുടെ പങ്ക് തിരഞ്ഞെടുക്കുക',
    email: 'ഇമെയിൽ വിലാസം',
    password: 'പാസ്‌വേഡ്',
    fullName: 'പൂർണ്ണ നാമം',
    phoneNumber: 'ഫോൺ നമ്പർ',
    location: 'സ്ഥലം / ഗ്രാമം',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    farms: 'എന്റെ കൃഷിയിടങ്ങൾ',
    crops: 'എന്റെ വിളകൾ',
    harvest: 'വിളവെടുപ്പ് വിവരങ്ങൾ',
    listings: 'വിപണി ലിസ്റ്റിംഗുകൾ',
    orders: 'ഓർഡറുകളും വിൽപ്പനയും',
    marketPrices: 'വിപണി വില വിവരങ്ങൾ',
    agriAI: 'അഗ്രി-AI ഉപദേശം',
    addFarm: 'പുതിയ കൃഷിയിടം ചേർക്കുക',
    addCrop: 'വിള കൃഷി ചേർക്കുക',
    recordHarvest: 'വിളവെടുപ്പ് രേഖപ്പെടുത്തുക',
    sellProduce: 'ഉൽപ്പന്നങ്ങൾ വിൽക്കുക',
    browseMarket: 'മാർക്കറ്റ് പരിശോധിക്കുക',
    viewOrders: 'എന്റെ ഓർഡറുകൾ കാണുക',
    checkPrices: 'മണ്ടി വില പരിശോധിക്കുക',
    askingPrice: 'ചോദിക്കുന്ന വില',
    quantity: 'അളവ്',
    minOrderQty: 'കുറഞ്ഞ ഓർഡർ അളവ്',
    qualityGrade: 'ഗുണനിലവാര ഗ്രേഡ്',
    placeOrder: 'ഓർഡർ നൽകുക',
    orderTotal: 'ആകെ തുക',
    status: 'സ്ഥിതി',
    date: 'തീയതി',
    action: 'നടപടി',
    submit: 'സമർപ്പിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    loading: 'ലോഡുചെയ്യുന്നു...',
    noData: 'വിവരങ്ങൾ ഒന്നും ലഭ്യമല്ല.',
    marketReference: 'മണ്ടി സൂചിക വില',
    farmerListingPrice: 'കർഷക വിൽപന വില',
    aiIntelligence: 'AI വിവര വിശകലനം',
    freshness: 'വിവര ലഭ്യത സമയം',
    confidence: 'വിശ്വാസ്യത സ്കോർ',
    disclaimer: 'AI പ്രവചനങ്ങൾ തീരുമാനങ്ങൾ എടുക്കുന്നതിനുള്ള സഹായ സൂചകങ്ങൾ മാത്രമാണ്.',
  },
  mr: {
    appName: 'ॲग्रीमार्क (AgriMark)',
    tagline: 'शेतकरी-प्रथम कृषी बाजारपेठ आणि बुद्धिमत्ता प्रणाली',
    login: 'लॉग इन करा',
    register: 'खाते तयार करा',
    logout: 'लॉग आउट',
    farmer: 'शेतकरी',
    buyer: 'खरेदीदार',
    fpo: 'एफपीओ / सहकारी संस्था',
    logistics: 'लॉजिस्टिक्स पार्टनर',
    service_provider: 'सेवा प्रदाता',
    selectRole: 'आपली भूमिका निवडा',
    email: 'ईमेल पत्ता',
    password: 'पासवर्ड',
    fullName: 'पूर्ण नाव',
    phoneNumber: 'फोन नंबर',
    location: 'ठिकाण / गाव',
    dashboard: 'डॅशबोर्ड',
    farms: 'माझी शेती',
    crops: 'माझी पिके',
    harvest: 'काढणी नोंदी',
    listings: 'बाजार सूची',
    orders: 'ऑर्डर्स आणि विक्री',
    marketPrices: 'बाजार भाव संकेत',
    agriAI: 'ॲग्री-AI सल्ला',
    addFarm: 'नवीन शेत जोडा',
    addCrop: 'पीक लागवड जोडा',
    recordHarvest: 'काढणीची नोंद करा',
    sellProduce: 'शेतमाल विका',
    browseMarket: 'बाजारपेठ पहा',
    viewOrders: 'माझ्या ऑर्डर्स पहा',
    checkPrices: 'मंडी भाव तपासा',
    askingPrice: 'मागणी किंमत',
    quantity: 'प्रमाण',
    minOrderQty: 'किमान ऑर्डर प्रमाण',
    qualityGrade: 'गुणवत्ता श्रेणी',
    placeOrder: 'ऑर्डर द्या',
    orderTotal: 'एकूण रक्कम',
    status: 'स्थिती',
    date: 'दिनांक',
    action: 'कृती',
    submit: 'सादर करा',
    cancel: 'रद्द करा',
    loading: 'लोड होत आहे...',
    noData: 'कोणतीही नोंद आढळली नाही.',
    marketReference: 'मंडी संदर्भ किंमत',
    farmerListingPrice: 'शेतकरी सूची किंमत',
    aiIntelligence: 'AI बुद्धिमत्ता आणि संकेत',
    freshness: 'माहिती ताजेपणा',
    confidence: 'विश्वासार्हता स्कोअर',
    disclaimer: 'AI अंदाज हे केवळ निर्णय सुलभतेसाठी दिलेले आहेत.',
  },
  bn: {
    appName: 'এগ্রিমার্ক (AgriMark)',
    tagline: 'কৃষক-প্রথম কৃষি বাজার ও বুদ্ধিমত্তা সিস্টেম',
    login: 'লগ ইন করুন',
    register: 'একাউন্ট তৈরি করুন',
    logout: 'লগ আউট',
    farmer: 'কৃষক',
    buyer: 'ক্রেতা',
    fpo: 'এফপিও / সমবায়',
    logistics: 'লজিস্টিক পার্টনার',
    service_provider: 'সেবা প্রদানকারী',
    selectRole: 'আপনার ভূমিকা নির্বাচন করুন',
    email: 'ইমেল ঠিকানা',
    password: 'পাসওয়ার্ড',
    fullName: 'পূর্ণ নাম',
    phoneNumber: 'ফোন নম্বর',
    location: 'অবস্থান / গ্রাম',
    dashboard: 'ড্যাশবোর্ড',
    farms: 'আমার খামার',
    crops: 'আমার ফসল',
    harvest: 'ফসল কাটার রেকর্ড',
    listings: 'বাজারের তালিকা',
    orders: 'অর্ডার ও বিক্রি',
    marketPrices: 'বাজার দর সংকেত',
    agriAI: 'এগ্রি-AI পরামর্শ',
    addFarm: 'নতুন খামার যোগ করুন',
    addCrop: 'ফসল চাষ যোগ করুন',
    recordHarvest: 'ফসল কাটা রেকর্ড করুন',
    sellProduce: 'ফসল বিক্রি করুন',
    browseMarket: 'মার্কেটপ্লেস দেখুন',
    viewOrders: 'আমার অর্ডার দেখুন',
    checkPrices: 'মন্ডির দাম দেখুন',
    askingPrice: 'চাওয়া দাম',
    quantity: 'পরিমাণ',
    minOrderQty: 'নূন্যতম অর্ডার পরিমাণ',
    qualityGrade: 'গুণমানের মান',
    placeOrder: 'অর্ডার দিন',
    orderTotal: 'মোট মূল্য',
    status: 'অবস্থা',
    date: 'তারিখ',
    action: 'পদক্ষেপ',
    submit: 'জমা দিন',
    cancel: 'বাতিল করুন',
    loading: 'লোড হচ্ছে...',
    noData: 'কোন রেকর্ড পাওয়া যায়নি।',
    marketReference: 'মন্ডি রেফারেন্স মূল্য',
    farmerListingPrice: 'কৃষকের নির্ধারিত মূল্য',
    aiIntelligence: 'AI বুদ্ধিমত্তা সংকেত',
    freshness: 'তথ্যের সময়কাল',
    confidence: 'বিশ্বস্ততা স্কোর',
    disclaimer: 'AI পূর্বাভাস সিদ্ধান্তের সহায়তার জন্য প্রদান করা হয়েছে।',
  },
  gu: {
    appName: 'એગ્રીમાર્ક (AgriMark)',
    tagline: 'ખેડૂત-પ્રથમ કૃષિ બજાર અને બુદ્ધિમત્તા સિસ્ટમ',
    login: 'લૉગ ઇન કરો',
    register: 'ખાતું બનાવો',
    logout: 'લૉગ આઉટ',
    farmer: 'ખેડૂત',
    buyer: 'ખરીદદાર',
    fpo: 'એફપીઓ / સહકારી મંડળી',
    logistics: 'લોજિસ્ટિક્સ પાર્ટનર',
    service_provider: 'સેવા પ્રદાતા',
    selectRole: 'તમારી ભૂમિકા પસંદ કરો',
    email: 'ઈમેલ સરનામું',
    password: 'પાસવર્ડ',
    fullName: 'પૂરું નામ',
    phoneNumber: 'ફોન નંબર',
    location: 'સ્થળ / ગામ',
    dashboard: 'ડેશબોર્ડ',
    farms: 'મારા ખેતરો',
    crops: 'મારા પાક',
    harvest: 'લણણી રેકોર્ડ',
    listings: 'બજાર યાદી',
    orders: 'ઓર્ડર અને વેચાણ',
    marketPrices: 'બજાર ભાવ સંકેતો',
    agriAI: 'એગ્રી-AI સલાહ',
    addFarm: 'નવું ખેતર ઉમેરો',
    addCrop: 'પાક વાવેતર ઉમેરો',
    recordHarvest: 'લણણી નોંધો',
    sellProduce: 'ઉત્પાદન વેચો',
    browseMarket: 'બજાર જુઓ',
    viewOrders: 'મારા ઓર્ડર જુઓ',
    checkPrices: 'મંડીના ભાવ તપાસો',
    askingPrice: 'માગવામાં આવેલ ભાવ',
    quantity: 'જથ્થો',
    minOrderQty: 'ન્યૂનતમ ઓર્ડર જથ્થો',
    qualityGrade: 'ગુણવત્તા ગ્રેડ',
    placeOrder: 'ઓર્ડર આપો',
    orderTotal: 'કુલ રકમ',
    status: 'સ્થિતિ',
    date: 'તારીખ',
    action: 'પગલું',
    submit: 'સબમિટ કરો',
    cancel: 'રદ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    noData: 'કોઈ રેકોર્ડ મળ્યો નથી.',
    marketReference: 'મંડી સંદર્ભ ભાવ',
    farmerListingPrice: 'ખેડૂત યાદી ભાવ',
    aiIntelligence: 'AI બુદ્ધિમત્તા અને સંకేત',
    freshness: 'ડેટા તાજગી',
    confidence: 'વિશ્વાસ સ્કોર',
    disclaimer: 'AI અંદાજો નિર્ણય સહાય માટે આપેલ છે.',
  },
  pa: {
    appName: 'ਐਗਰੀਮਾਰਕ (AgriMark)',
    tagline: 'ਕਿਸਾਨ-ਪਹਿਲਾਂ ਖੇਤੀਬਾੜੀ ਮਾਰਕੀਟਪਲੇਸ ਅਤੇ ਖੁਫੀਆ ਸਿਸਟਮ',
    login: 'ਲੌਗ ਇਨ ਕਰੋ',
    register: 'ਖਾਤਾ ਬਣਾਓ',
    logout: 'ਲੌਗ ਆਉਟ',
    farmer: 'ਕਿਸਾਨ',
    buyer: 'ਖਰੀਦਦਾਰ',
    fpo: 'ਐਫ.ਪੀ.ਓ / ਸਹਿਕਾਰੀ ਸਭਾ',
    logistics: 'ਲੌਜਿਸਟਿਕਸ ਭਾਈਵਾਲ',
    service_provider: 'ਸੇਵਾ ਪ੍ਰਦਾਤਾ',
    selectRole: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ',
    email: 'ਈਮੇਲ ਪਤਾ',
    password: 'ਪਾਸਵਰਡ',
    fullName: 'ਪੂਰਾ ਨਾਮ',
    phoneNumber: 'ਫੋਨ ਨੰਬਰ',
    location: 'ਸਥਾਨ / ਪਿੰਡ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    farms: 'ਮੇਰੇ ਖੇਤ',
    crops: 'ਮੇਰੀਆਂ ਫਸਲਾਂ',
    harvest: 'ਵਾਢੀ ਦਾ ਰਿਕਾਰਡ',
    listings: 'ਮਾਰਕੀਟ ਲਿਸਟਿੰਗ',
    orders: 'ਆਰਡਰ ਅਤੇ ਵਿਕਰੀ',
    marketPrices: 'ਮੰਡੀ ਭਾਅ ਦੇ ਸੰਕੇਤ',
    agriAI: 'ਐਗਰੀ-AI ਸਲਾਹ',
    addFarm: 'ਨਵਾਂ ਖੇਤ ਜੋੜੋ',
    addCrop: 'ਫਸਲ ਦੀ ਬੀਜਾਈ ਜੋੜੋ',
    recordHarvest: 'ਵਾਢੀ ਦਰਜ ਕਰੋ',
    sellProduce: 'ਫ਼ਸਲ ਵੇਚੋ',
    browseMarket: 'ਮਾਰਕੀਟਪਲੇਸ ਦੇਖੋ',
    viewOrders: 'ਮੇਰੇ ਆਰਡਰ ਦੇਖੋ',
    checkPrices: 'ਮੰਡੀ ਭਾਅ ਚੈੱਕ ਕਰੋ',
    askingPrice: 'ਮੰਗ ਦਾ ਭਾਅ',
    quantity: 'ਮਾਤਰਾ',
    minOrderQty: 'ਘੱਟੋ-ਘੱਟ ਆਰਡਰ ਮਾਤਰਾ',
    qualityGrade: 'ਗੁਣਵੱਤਾ ਗ੍ਰੇਡ',
    placeOrder: 'ਆਰਡਰ ਦਿਓ',
    orderTotal: 'ਕੁੱਲ ਰਕਮ',
    status: 'ਸਥਿਤੀ',
    date: 'ਮਿਤੀ',
    action: 'ਕਾਰਵਾਈ',
    submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    noData: 'ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।',
    marketReference: 'ਮੰਡੀ ਦਾ ਹਵਾਲਾ ਭਾਅ',
    farmerListingPrice: 'ਕਿਸਾਨ ਲਿਸਟਿੰਗ ਭਾਅ',
    aiIntelligence: 'AI ਖੁਫੀਆ ਅਤੇ ਸੰਕੇਤ',
    freshness: 'ਡੇਟਾ ਤਾਜ਼ਗੀ',
    confidence: 'ਭਰੋਸੇਯੋਗਤਾ ਸਕੋਰ',
    disclaimer: 'AI ਅਨੁਮਾਨ ਫੈਸਲੇ ਦੀ ਸਹਾਇਤਾ ਲਈ ਮੁਹੱਈਆ ਕਰਵਾਏ ਗਏ ਹਨ।',
  },
};

// Validate translation completeness in non-production environments
if (process.env.NODE_ENV !== 'production') {
  const englishKeys = Object.keys(translations.en);
  SUPPORTED_LANGUAGES.forEach(({ code }) => {
    const langDict = translations[code] || {};
    const missing = englishKeys.filter((key) => !langDict[key]);
    if (missing.length > 0) {
      console.warn(`[i18n Warning] Language "${code}" is missing ${missing.length} keys:`, missing);
    }
  });
}


// Keep original DOM copy so changing languages never translates a translation.
// This bridges existing hard-coded labels while screens are migrated to use t(key).
const originalTextNodes = new WeakMap<Text, string>();
const lastTranslatedTextNodes = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatableAttributes = ['placeholder', 'title', 'aria-label'];

function getPhraseMap(language: Language): Map<string, string> {
  const phraseMap = new Map<string, string>();
  const english = translations.en;
  const localized = translations[language] || english;
  Object.keys(english).forEach((key) => {
    const source = english[key]?.trim();
    const target = localized[key]?.trim();
    if (source && target && source !== target) phraseMap.set(source, target);
  });
  // Common labels that appear throughout screens but were not consistently
  // using the translation hook yet. Keep exact-match translation to avoid
  // altering names, addresses, product descriptions, or other user content.
  const extra: Record<Language, Record<string, string>> = {
    en: {},
    ta: { 'Dashboard': 'முகப்பு', 'Settings': 'அமைப்புகள்', 'Search': 'தேடுக', 'Refresh': 'புதுப்பி', 'Save': 'சேமி', 'Edit': 'திருத்து', 'Delete': 'நீக்கு', 'Back': 'பின் செல்ல', 'Next': 'அடுத்து', 'Previous': 'முந்தைய', 'Submit': 'சமர்ப்பி', 'Cancel': 'ரத்து செய்', 'Close': 'மூடு', 'Loading...': 'ஏற்றப்படுகிறது...', 'No records found': 'பதிவுகள் எதுவும் இல்லை', 'No data available': 'தரவு கிடைக்கவில்லை', 'Status': 'நிலை', 'Actions': 'செயல்கள்', 'View details': 'விவரங்களைப் பார்க்க', 'View all': 'அனைத்தையும் பார்க்க', 'Notifications': 'அறிவிப்புகள்', 'Select Language': 'மொழியைத் தேர்ந்தெடுக்கவும்', 'English': 'ஆங்கிலம்', 'Orders': 'ஆர்டர்கள்', 'Market': 'சந்தை', 'Home': 'முகப்பு', 'Profile': 'சுயவிவரம்', 'Logout': 'வெளியேறு' },
    hi: { 'Dashboard': 'डैशबोर्ड', 'Settings': 'सेटिंग्स', 'Search': 'खोजें', 'Refresh': 'रीफ़्रेश करें', 'Save': 'सहेजें', 'Edit': 'संपादित करें', 'Delete': 'हटाएँ', 'Back': 'वापस', 'Next': 'अगला', 'Previous': 'पिछला', 'Submit': 'जमा करें', 'Cancel': 'रद्द करें', 'Close': 'बंद करें', 'Loading...': 'लोड हो रहा है...', 'No records found': 'कोई रिकॉर्ड नहीं मिला', 'No data available': 'कोई डेटा उपलब्ध नहीं है', 'Status': 'स्थिति', 'Actions': 'कार्रवाई', 'View details': 'विवरण देखें', 'View all': 'सभी देखें', 'Notifications': 'सूचनाएँ', 'Select Language': 'भाषा चुनें', 'English': 'अंग्रेज़ी', 'Orders': 'ऑर्डर', 'Market': 'बाज़ार', 'Home': 'होम', 'Profile': 'प्रोफ़ाइल', 'Logout': 'लॉग आउट' },
    te: { 'Dashboard': 'డాష్‌బోర్డ్', 'Settings': 'సెట్టింగ్‌లు', 'Search': 'వెతకండి', 'Refresh': 'రిఫ్రెష్', 'Save': 'సేవ్ చేయండి', 'Edit': 'సవరించండి', 'Delete': 'తొలగించండి', 'Back': 'వెనక్కి', 'Next': 'తదుపరి', 'Previous': 'మునుపటి', 'Submit': 'సమర్పించండి', 'Cancel': 'రద్దు చేయండి', 'Close': 'మూసివేయండి', 'Loading...': 'లోడ్ అవుతోంది...', 'No records found': 'రికార్డులు కనబడలేదు', 'No data available': 'డేటా అందుబాటులో లేదు', 'Status': 'స్థితి', 'Actions': 'చర్యలు', 'View details': 'వివరాలు చూడండి', 'View all': 'అన్నీ చూడండి', 'Notifications': 'నోటిఫికేషన్‌లు', 'Select Language': 'భాషను ఎంచుకోండి', 'English': 'ఆంగ్లం', 'Orders': 'ఆర్డర్‌లు', 'Market': 'మార్కెట్', 'Home': 'హోమ్', 'Profile': 'ప్రొఫైల్', 'Logout': 'లాగ్ అవుట్' },
    kn: { 'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'Settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', 'Search': 'ಹುಡುಕಿ', 'Refresh': 'ರಿಫ್ರೆಶ್', 'Save': 'ಉಳಿಸಿ', 'Edit': 'ತಿದ್ದು', 'Delete': 'ಅಳಿಸಿ', 'Back': 'ಹಿಂದಕ್ಕೆ', 'Next': 'ಮುಂದೆ', 'Previous': 'ಹಿಂದಿನ', 'Submit': 'ಸಲ್ಲಿಸಿ', 'Cancel': 'ರದ್ದುಮಾಡಿ', 'Close': 'ಮುಚ್ಚಿ', 'Loading...': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', 'No records found': 'ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ', 'No data available': 'ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ', 'Status': 'ಸ್ಥಿತಿ', 'Actions': 'ಕ್ರಿಯೆಗಳು', 'View details': 'ವಿವರಗಳನ್ನು ನೋಡಿ', 'View all': 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ', 'Notifications': 'ಅಧಿಸೂಚನೆಗಳು', 'Select Language': 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ', 'English': 'ಇಂಗ್ಲಿಷ್', 'Orders': 'ಆರ್ಡರ್‌ಗಳು', 'Market': 'ಮಾರುಕಟ್ಟೆ', 'Home': 'ಮುಖಪುಟ', 'Profile': 'ಪ್ರೊಫೈಲ್', 'Logout': 'ಲಾಗ್ ಔಟ್' },
    ml: { 'Dashboard': 'ഡാഷ്ബോർഡ്', 'Settings': 'ക്രമീകരണങ്ങൾ', 'Search': 'തിരയുക', 'Refresh': 'പുതുക്കുക', 'Save': 'സേവ് ചെയ്യുക', 'Edit': 'തിരുത്തുക', 'Delete': 'ഇല്ലാതാക്കുക', 'Back': 'തിരികെ', 'Next': 'അടുത്തത്', 'Previous': 'മുമ്പത്തേത്', 'Submit': 'സമർപ്പിക്കുക', 'Cancel': 'റദ്ദാക്കുക', 'Close': 'അടയ്ക്കുക', 'Loading...': 'ലോഡുചെയ്യുന്നു...', 'No records found': 'രേഖകളൊന്നും കണ്ടെത്തിയില്ല', 'No data available': 'ഡാറ്റ ലഭ്യമല്ല', 'Status': 'സ്ഥിതി', 'Actions': 'നടപടികൾ', 'View details': 'വിശദാംശങ്ങൾ കാണുക', 'View all': 'എല്ലാം കാണുക', 'Notifications': 'അറിയിപ്പുകൾ', 'Select Language': 'ഭാഷ തിരഞ്ഞെടുക്കുക', 'English': 'ഇംഗ്ലീഷ്', 'Orders': 'ഓർഡറുകൾ', 'Market': 'വിപണി', 'Home': 'ഹോം', 'Profile': 'പ്രൊഫൈൽ', 'Logout': 'ലോഗ് ഔട്ട്' },
    mr: { 'Dashboard': 'डॅशबोर्ड', 'Settings': 'सेटिंग्ज', 'Search': 'शोधा', 'Refresh': 'रिफ्रेश करा', 'Save': 'जतन करा', 'Edit': 'संपादित करा', 'Delete': 'हटवा', 'Back': 'मागे', 'Next': 'पुढे', 'Previous': 'मागील', 'Submit': 'सबमिट करा', 'Cancel': 'रद्द करा', 'Close': 'बंद करा', 'Loading...': 'लोड होत आहे...', 'No records found': 'कोणतीही नोंद सापडली नाही', 'No data available': 'डेटा उपलब्ध नाही', 'Status': 'स्थिती', 'Actions': 'कृती', 'View details': 'तपशील पहा', 'View all': 'सर्व पहा', 'Notifications': 'सूचना', 'Select Language': 'भाषा निवडा', 'English': 'इंग्रजी', 'Orders': 'ऑर्डर्स', 'Market': 'बाजार', 'Home': 'मुख्यपृष्ठ', 'Profile': 'प्रोफाइल', 'Logout': 'लॉग आउट' },
    bn: { 'Dashboard': 'ড্যাশবোর্ড', 'Settings': 'সেটিংস', 'Search': 'খুঁজুন', 'Refresh': 'রিফ্রেশ', 'Save': 'সংরক্ষণ করুন', 'Edit': 'সম্পাদনা', 'Delete': 'মুছুন', 'Back': 'ফিরে যান', 'Next': 'পরবর্তী', 'Previous': 'আগের', 'Submit': 'জমা দিন', 'Cancel': 'বাতিল', 'Close': 'বন্ধ করুন', 'Loading...': 'লোড হচ্ছে...', 'No records found': 'কোনও রেকর্ড পাওয়া যায়নি', 'No data available': 'কোনও ডেটা নেই', 'Status': 'অবস্থা', 'Actions': 'কার্যকলাপ', 'View details': 'বিস্তারিত দেখুন', 'View all': 'সব দেখুন', 'Notifications': 'বিজ্ঞপ্তি', 'Select Language': 'ভাষা নির্বাচন করুন', 'English': 'ইংরেজি', 'Orders': 'অর্ডার', 'Market': 'বাজার', 'Home': 'হোম', 'Profile': 'প্রোফাইল', 'Logout': 'লগ আউট' },
    gu: { 'Dashboard': 'ડેશબોર્ડ', 'Settings': 'સેટિંગ્સ', 'Search': 'શોધો', 'Refresh': 'રિફ્રેશ કરો', 'Save': 'સાચવો', 'Edit': 'ફેરફાર કરો', 'Delete': 'કાઢી નાખો', 'Back': 'પાછળ', 'Next': 'આગળ', 'Previous': 'પહેલાંનું', 'Submit': 'સબમિટ કરો', 'Cancel': 'રદ કરો', 'Close': 'બંધ કરો', 'Loading...': 'લોડ થઈ રહ્યું છે...', 'No records found': 'કોઈ રેકોર્ડ મળ્યો નથી', 'No data available': 'ડેટા ઉપલબ્ધ નથી', 'Status': 'સ્થિતિ', 'Actions': 'ક્રિયાઓ', 'View details': 'વિગતો જુઓ', 'View all': 'બધું જુઓ', 'Notifications': 'સૂચનાઓ', 'Select Language': 'ભાષા પસંદ કરો', 'English': 'અંગ્રેજી', 'Orders': 'ઓર્ડર', 'Market': 'બજાર', 'Home': 'હોમ', 'Profile': 'પ્રોફાઇલ', 'Logout': 'લૉગ આઉટ' },
    pa: { 'Dashboard': 'ਡੈਸ਼ਬੋਰਡ', 'Settings': 'ਸੈਟਿੰਗਾਂ', 'Search': 'ਖੋਜੋ', 'Refresh': 'ਤਾਜ਼ਾ ਕਰੋ', 'Save': 'ਸੰਭਾਲੋ', 'Edit': 'ਸੋਧੋ', 'Delete': 'ਮਿਟਾਓ', 'Back': 'ਪਿੱਛੇ', 'Next': 'ਅੱਗੇ', 'Previous': 'ਪਿਛਲਾ', 'Submit': 'ਜਮ੍ਹਾਂ ਕਰੋ', 'Cancel': 'ਰੱਦ ਕਰੋ', 'Close': 'ਬੰਦ ਕਰੋ', 'Loading...': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', 'No records found': 'ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ', 'No data available': 'ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ', 'Status': 'ਸਥਿਤੀ', 'Actions': 'ਕਾਰਵਾਈਆਂ', 'View details': 'ਵੇਰਵੇ ਵੇਖੋ', 'View all': 'ਸਭ ਵੇਖੋ', 'Notifications': 'ਸੂਚਨਾਵਾਂ', 'Select Language': 'ਭਾਸ਼ਾ ਚੁਣੋ', 'English': 'ਅੰਗਰੇਜ਼ੀ', 'Orders': 'ਆਰਡਰ', 'Market': 'ਬਾਜ਼ਾਰ', 'Home': 'ਘਰ', 'Profile': 'ਪ੍ਰੋਫਾਈਲ', 'Logout': 'ਲੌਗ ਆਉਟ' },
  };
  Object.entries(extra[language] || {}).forEach(([source, target]) => phraseMap.set(source, target));
  return phraseMap;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const validCodes = SUPPORTED_LANGUAGES.map((item) => item.code);
    const applySavedLanguage = () => {
      const saved = localStorage.getItem('agrimark_lang') as Language | null;
      setLanguageState(saved && validCodes.includes(saved) ? saved : 'en');
    };
    applySavedLanguage();
    window.addEventListener('storage', applySavedLanguage);
    return () => window.removeEventListener('storage', applySavedLanguage);
  }, []);

  // Apply exact-match translations across the rendered app, including existing
  // screens whose labels have not yet been migrated to use the t() hook.
  useEffect(() => {
    document.documentElement.lang = language;
    const phrases = getPhraseMap(language);
    const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA']);
    let translating = false;

    const translateText = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName) || parent.closest('[data-no-translate],input,textarea,[contenteditable="true"]')) return;
      const currentValue = node.nodeValue ?? '';
      const previousTranslated = lastTranslatedTextNodes.get(node);
      if (originalTextNodes.has(node) && previousTranslated !== undefined && currentValue !== previousTranslated) {
        // React reused this text node for new dynamic content; treat it as fresh source text.
        originalTextNodes.set(node, currentValue);
        lastTranslatedTextNodes.delete(node);
      }
      const original = originalTextNodes.get(node) ?? currentValue;
      if (!originalTextNodes.has(node)) originalTextNodes.set(node, original);
      const trimmed = original.trim();
      if (!trimmed) return;
      const translated = phrases.get(trimmed);
      if (!translated) {
        if (node.nodeValue !== original) node.nodeValue = original;
        return;
      }
      const leading = original.match(/^\s*/)?.[0] || '';
      const trailing = original.match(/\s*$/)?.[0] || '';
      const next = `${leading}${translated}${trailing}`;
      if (node.nodeValue !== next) node.nodeValue = next;
      lastTranslatedTextNodes.set(node, next);
    };

    const translateElement = (element: Element) => {
      if (element.closest('[data-no-translate]') || skipTags.has(element.tagName)) return;
      let originals = originalAttributes.get(element);
      if (!originals) {
        originals = new Map<string, string>();
        originalAttributes.set(element, originals);
      }
      translatableAttributes.forEach((attribute) => {
        const current = element.getAttribute(attribute);
        if (current == null) return;
        if (!originals!.has(attribute)) originals!.set(attribute, current);
        const original = originals!.get(attribute) || current;
        const nextValue = phrases.get(original.trim()) || original;
        if (element.getAttribute(attribute) !== nextValue) {
          element.setAttribute(attribute, nextValue);
        }
      });
    };

    const translateTree = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) translateText(node as Text);
      if (root instanceof Element) translateElement(root);
      root.querySelectorAll?.('*').forEach(translateElement);
    };

    translating = true;
    translateTree(document.body);
    translating = false;
    const observer = new MutationObserver((records) => {
      if (translating) return;
      translating = true;
      records.forEach((record) => {
        if (record.type === 'characterData' && record.target instanceof Text) translateText(record.target);
        record.addedNodes.forEach((node) => {
          if (node instanceof Text) translateText(node);
          else if (node instanceof Element) translateTree(node);
        });
      });
      // Translation itself changes text nodes. Discard those self-generated records
      // so they do not trigger another translation pass.
      observer.takeRecords();
      translating = false;
    });
    // Attribute changes are intentionally excluded: they are usually caused by
    // this translator itself. Attributes are translated on initial scan and when
    // a new element enters the DOM; text updates remain supported.
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const setLanguage = (lang: Language) => {
    const validCodes = SUPPORTED_LANGUAGES.map((item) => item.code);
    const next = validCodes.includes(lang) ? lang : 'en';
    localStorage.setItem('agrimark_lang', next);
    setLanguageState(next);
    document.documentElement.lang = next;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
