'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, Sparkles, MessageSquare, ArrowRight, Languages, Check, Send } from 'lucide-react';

export const AgriAISection: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'mr' | 'hi' | 'ta' | 'te' | 'kn' | 'en'>('mr');

  const langQueries = {
    mr: {
      langName: 'Marathi (मराठी)',
      flag: '🇮🇳',
      question: 'नाशिक कांद्याला पुढच्या आठवड्यात काय भाव मिळेल?',
      answer:
        'नाशिक एपीएमसी मध्ये सध्या लाल कांद्याचा भाव ₹२,४५०/क्विंटल आहे. एआय अंदाजानुसार मुंबई आणि भिवंडी बाजारात मागणी वाढल्याने पुढील ७ दिवसांत भाव ₹२,६५० ते ₹२,७२० पर्यंत जाण्याची शक्यता आहे.',
    },
    hi: {
      langName: 'Hindi (हिंदी)',
      flag: '🇮🇳',
      question: 'प्याज की फसल में थ्रिप्स कीट से बचाव कैसे करें?',
      answer:
        'प्याज में थ्रिप्स के नियंत्रण के लिए शाम के समय फिप्रोनिल 5% SC (2 ml/लीटर पानी) या इमिडाक्लोप्रिड 17.8% SL (0.5 ml/लीटर पानी) का छिड़काव करें। साथ ही पीले और नीले चिपचिपे ट्रैप का उपयोग करें।',
    },
    ta: {
      langName: 'Tamil (தமிழ்)',
      flag: '🇮🇳',
      question: 'வெங்காய அறுவடைக்கு ஏற்ற தட்பவெப்பநிலை என்ன?',
      answer:
        'வெங்காய அறுவடைக்கு 25°C முதல் 30°C வரையிலான உலர் வெப்பநிலை சிறந்தது. மழை பெய்ய வாய்ப்புள்ளதால் அறுவடை செய்த வெங்காயத்தை நிழலில் 3-4 நாட்கள் காய வைக்கவும்.',
    },
    te: {
      langName: 'Telugu (తెలుగు)',
      flag: '🇮🇳',
      question: 'ఉల్లిపాయ పంటకు ప్రస్తుత మండీ ధర ఎంత ఉంది?',
      answer:
        'నాసిక్ మండీలో గ్రేడ్ A ఉల్లిపాయల సగటు ధర ₹2,450/క్వింటాల్‌గా ఉంది. రాబోయే వారంలో డిమాండ్ 5% పెరిగే అవకాశం ఉందని AgriAI నివేదిస్తోంది.',
    },
    kn: {
      langName: 'Kannada (ಕನ್ನಡ)',
      flag: '🇮🇳',
      question: 'ಈರುಳ್ಳಿ ಬೆಳೆಗೆ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಹೇಗೆ ಮಾಡಬೇಕು?',
      answer:
        'ಈರುಳ್ಳಿ ಬೆಳೆಗೆ ಬಿತ್ತನೆಯ 30 ದಿನಗಳ ನಂತರ NPK 19:19:19 ಜೊತೆಗೆ ಸಲ್ಫರ್ (ಸಂಧಿ) ಬಳಕೆ ಮಾಡುವುದರಿಂದ ಈರುಳ್ಳಿಯ ಗಾತ್ರ ಮತ್ತು ಸಂಗ್ರಹಣಾ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚಾಗುತ್ತದೆ.',
    },
    en: {
      langName: 'English',
      flag: '🌐',
      question: 'What is the optimal harvest timing for Nashik Red Onion?',
      answer:
        'Harvest when 50-70% of crop tops fall naturally (Day 110-120). Cure bulbs in shade for 3-5 days to ensure maximum shelf life and NABL Grade A certification.',
    },
  };

  const activeSample = langQueries[selectedLang];

  return (
    <section id="ai" className="py-24 bg-[#19201D] text-white relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#1B4D3E]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Multilingual Scope */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-[#E5A93C] uppercase">
              <Bot className="w-4 h-4 text-amber-300" /> MULTILINGUAL AGRONOMIC AI
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              An agricultural intelligence layer built around the farmer.
            </h2>

            <p className="text-base text-emerald-100/90 leading-relaxed font-normal">
              AgriAI speaks the languages of India’s farming communities. Get instant answers on crop diseases, fertilizer dosing, mandi price trends, and weather warnings in real time.
            </p>

            {/* Language Pills */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono text-emerald-300 uppercase font-bold flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#E5A93C]" /> Supported Languages:
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(langQueries) as Array<keyof typeof langQueries>).map((code) => (
                  <button
                    key={code}
                    onClick={() => setSelectedLang(code)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedLang === code
                        ? 'bg-[#E5A93C] text-[#19201D] shadow-md scale-105'
                        : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/80 hover:bg-emerald-900'
                    }`}
                  >
                    {langQueries[code].flag} {langQueries[code].langName}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/ai-assistant"
                className="px-6 py-3.5 bg-[#E5A93C] hover:bg-[#d4982b] text-[#19201D] font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transition inline-flex"
              >
                <span>Meet AgriAI Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Live Chat Interface Simulation */}
          <div className="lg:col-span-7 bg-[#143B30]/90 border border-emerald-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-[#E5A93C]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    AgriAI Assistant <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-300/80">{activeSample.langName} Engine Active</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 font-mono text-[10px] rounded-full border border-emerald-800">
                LLM AGRI ADVISORY
              </span>
            </div>

            {/* Chat Bubble Simulation */}
            <div className="space-y-4">
              {/* User Question */}
              <div className="flex items-start justify-end gap-3">
                <div className="bg-[#19201D] text-emerald-100 p-4 rounded-2xl rounded-tr-none border border-emerald-800/80 max-w-md text-xs font-medium space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Farmer Question</span>
                  <p className="text-sm font-semibold text-white">{activeSample.question}</p>
                </div>
              </div>

              {/* AgriAI Answer */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#E5A93C] text-[#19201D] rounded-xl shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-emerald-950/90 text-white p-5 rounded-2xl rounded-tl-none border border-emerald-700/80 space-y-2 max-w-lg text-xs leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#E5A93C] uppercase font-bold">
                      AgriAI Advisory Response
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified Agronomist Engine</span>
                  </div>
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
                    {activeSample.answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Bar Preview */}
            <div className="pt-2">
              <div className="bg-[#19201D] border border-emerald-800 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-300/70">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#E5A93C]" />
                  Type your crop or mandi question in any language...
                </span>
                <Link
                  href="/ai-assistant"
                  className="p-2 bg-[#E5A93C] text-[#19201D] rounded-xl font-bold hover:bg-[#d4982b] transition"
                >
                  <Send className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
