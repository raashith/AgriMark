'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { dataService } from '@/lib/data-service';
import { Bot, Send, Sparkles, User, Mic, Square, Volume2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  audioUrl?: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! I am your AgriMark AI Agricultural Assistant. Ask me anything about crop selection, mandi market prices, irrigation schedules, pest diagnosis, or buyers.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);

  const presets = [
    'What crop should I plant this Samba season in Thanjavur?',
    'What is today\'s mandi market price for paddy in Tamil Nadu?',
    'When should I irrigate my 5-acre tomato crop?',
    'Explain leaf curl disease treatment for chillies.',
    'Estimate expected revenue for 4 acres of turmeric.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    appendMessage(userMsg);
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

      appendMessage(aiMsg);
      await dataService.logAiInteraction({ query: q, response: answerText, context: 'web-assistant' });
    } catch {
      appendMessage({
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'AgriMark AI services are temporarily unavailable. Please try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (recording || loading) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await sendVoice(blob);
      };

      recorder.start();
      setRecording(true);
    } catch {
      appendMessage({
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Microphone access was not available. Please allow microphone permission and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !recording) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const sendVoice = async (audioBlob: Blob) => {
    setLoading(true);

    try {
      const formData = new FormData();
      const extension = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
      formData.append('file', audioBlob, `agrimark-voice.${extension}`);
      formData.append('language_code', 'en-IN');
      formData.append('context', 'Thanjavur, Tamil Nadu Delta Region');

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1';
      const response = await fetch(`${baseUrl}/ai/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: 'Voice AI request failed' }));
        throw new Error(body.detail || 'Voice AI request failed');
      }

      const transcript = response.headers.get('X-AgriMark-Transcript') || 'Voice message';
      const answer = response.headers.get('X-AgriMark-Answer') || 'AgriMark AI replied by voice.';
      const audio = await response.blob();
      const audioUrl = URL.createObjectURL(audio);

      appendMessage({
        id: `usr-voice-${Date.now()}`,
        sender: 'user',
        text: transcript,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      appendMessage({
        id: `ai-voice-${Date.now()}`,
        sender: 'ai',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioUrl,
      });

      const player = new Audio(audioUrl);
      await player.play().catch(() => undefined);
      await dataService.logAiInteraction({ query: transcript, response: answer, context: 'voice-assistant' });
    } catch {
      appendMessage({
        id: `err-voice-${Date.now()}`,
        sender: 'ai',
        text: 'Voice AI is temporarily unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <Bot className="w-4 h-4 text-emerald-400" /> AgriAI Agricultural Decision Engine
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          AgriMark Conversational AI Assistant
        </h1>
        <p className="text-xs text-gray-300">
          Context-aware AI advisory with text and voice interaction.
        </p>
      </div>

      <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 shadow-2xl flex flex-col h-[550px]">
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
                {msg.audioUrl && (
                  <button
                    type="button"
                    onClick={() => new Audio(msg.audioUrl).play()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Play
                  </button>
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
                AgriAI is processing your request...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AgriAI by text or voice..."
            className="flex-1 px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            aria-label={recording ? 'Stop recording' : 'Start voice input'}
            className={`px-4 py-3 rounded-xl shadow-lg transition flex items-center justify-center ${
              recording
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#0f1f18] border border-emerald-800 text-emerald-300 hover:bg-emerald-950'
            }`}
          >
            {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

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
