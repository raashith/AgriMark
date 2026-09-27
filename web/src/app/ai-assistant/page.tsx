'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { dataService } from '@/lib/data-service';
import { Bot, Send, Sparkles, User, Mic, Square, Volume2, Globe, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  audioUrl?: string;
  language?: string;
}

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en-IN', name: 'English' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'kn-IN', name: 'Kannada (கன்னட/ಕನ್ನಡ)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! I am your AgriMark AI Agricultural Voice Assistant. Speak or type your question about crop care, mandi prices, pests, or irrigation.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    'What crop should I plant this Samba season in Thanjavur?',
    'What is today\'s mandi market price for paddy in Tamil Nadu?',
    'When should I irrigate my 5-acre tomato crop?',
    'Explain leaf curl disease treatment for chillies.',
    'Estimate expected revenue for 4 acres of turmeric.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, recording]);

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const getSupportedMimeType = (): string => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  };

  const startVoiceRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stopRecordingCleanup();
        setRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        if (audioBlob.size > 0) {
          await handleVoiceSubmit(audioBlob);
        } else {
          setErrorMessage('No audio recorded. Please try speaking again.');
        }
      };

      mediaRecorder.start(250);
      setRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => {
          if (prev >= 29) {
            stopVoiceRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      stopRecordingCleanup();
      setRecording(false);
      setErrorMessage(`Microphone access failed: ${err?.message || 'Please allow microphone permissions.'}`);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      stopRecordingCleanup();
      setRecording(false);
    }
  };

  const decodeHeader = (val: string | null): string => {
    if (!val) return '';
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  };

  const handleVoiceSubmit = async (audioBlob: Blob) => {
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_recording.webm');
    formData.append('language_code', selectedLanguage);

    const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1';
    const apiBase = rawApiUrl.includes('supabase.co') ? 'https://agrimark-api.onrender.com/api/v1' : rawApiUrl.replace(/\/+$/, '');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('agrimark_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/ai/voice`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        let errorDetail = `Voice request failed with status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.detail) errorDetail = errJson.detail;
        } catch {}
        throw new Error(errorDetail);
      }

      const rawTranscript = decodeHeader(res.headers.get('x-agrimark-transcript'));
      const rawAnswer = decodeHeader(res.headers.get('x-agrimark-answer'));
      const langCode = res.headers.get('x-agrimark-language') || selectedLanguage;

      const audioArrayBuffer = await res.arrayBuffer();
      const responseBlob = new Blob([audioArrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(responseBlob);

      // Add user transcript message
      if (rawTranscript) {
        setMessages((prev) => [
          ...prev,
          {
            id: `usr-voice-${Date.now()}`,
            sender: 'user',
            text: rawTranscript,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: langCode,
          },
        ]);
      }

      // Add AI answer message with audio playback
      const aiAnswerText = rawAnswer || 'AgriMark AI decision support answer processed.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-voice-${Date.now()}`,
          sender: 'ai',
          text: aiAnswerText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          audioUrl,
          language: langCode,
        },
      ]);

      // Attempt automatic playback
      try {
        const audio = new Audio(audioUrl);
        await audio.play();
      } catch {}

      await dataService.logAiInteraction({ query: rawTranscript || 'Voice Input', response: aiAnswerText, context: 'voice-assistant' });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Voice assistant error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.askAgriAI(q, 'Thanjavur, Tamil Nadu Delta Region');
      const answerText = res.answer;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      await dataService.logAiInteraction({ query: q, response: answerText, context: 'web-assistant' });
    } catch (err: any) {
      const detail = err?.detail || err?.message || 'AgriMark AI service error';
      setErrorMessage(detail);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `AgriMark AI Notice: ${detail}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
            <Bot className="w-4 h-4 text-emerald-400" /> AgriAI Multilingual Voice Assistant
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-[#0a0f0d] border border-[#1e2d26] px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-emerald-300 font-semibold border-none outline-none text-xs cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#121a16] text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          AgriMark Voice & Text Decision Support
        </h1>
        <p className="text-xs text-gray-300">
          Powered by Sarvam Saaras v3 STT & Bulbul v3 TTS. Speak in Tamil, Hindi, Telugu, or English for real-time voice advisories.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-800/80 p-4 rounded-2xl flex items-center justify-between text-rose-200 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:underline shrink-0 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Box */}
      <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 shadow-2xl flex flex-col h-[550px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                    : 'bg-[#0a0f0d] border border-[#1e2d26] text-gray-200 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {/* Optional Voice Playback Button */}
                {msg.audioUrl && (
                  <div className="pt-2 border-t border-[#1e2d26] flex items-center gap-2">
                    <button
                      onClick={() => {
                        const audio = new Audio(msg.audioUrl);
                        audio.play();
                      }}
                      className="px-3 py-1.5 bg-emerald-950 border border-emerald-700 hover:bg-emerald-900 text-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Play Voice Response
                    </button>
                    {msg.language && (
                      <span className="text-[10px] text-emerald-500 font-mono">[{msg.language}]</span>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 font-mono block text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-xs text-emerald-400 font-mono animate-pulse">
                Sarvam AI Voice Engine is processing speech and synthesizing response...
              </div>
            </div>
          )}

          {recording && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-950 border border-rose-700 text-rose-400 flex items-center justify-center animate-pulse">
                <Mic className="w-4 h-4" />
              </div>
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 font-mono flex items-center gap-2">
                <span>Listening to microphone... ({recordTimer}s / 30s max)</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Buttons */}
        <div className="pt-3 border-t border-[#1e2d26] flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              className="px-3 py-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 text-gray-300 text-[11px] rounded-xl whitespace-nowrap transition"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AgriAI or tap the microphone to speak..."
            className="flex-1 px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
          />

          {/* Voice Record Button */}
          {recording ? (
            <button
              type="button"
              onClick={stopVoiceRecording}
              className="px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 animate-pulse"
              title="Stop Recording"
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="text-xs hidden md:inline">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              disabled={loading}
              className="px-4 py-3 bg-emerald-950 border border-emerald-700 hover:bg-emerald-900 text-emerald-400 font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
              title="Speak Question"
            >
              <Mic className="w-4 h-4" />
              <span className="text-xs hidden md:inline">Voice</span>
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
