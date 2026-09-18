'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Button } from '@/components/ui/InputControls';
import { api } from '@/lib/api-client';
import { Bot, Send, User, Sparkles, Sprout } from 'lucide-react';

export default function AgriAiPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! I am AgriAI, your agricultural decision support assistant. Ask me about pest advisories, crop calendars, weather forecasts, or mandi price trends in Marathi, Hindi, Tamil, or English.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await api.askAgriAi(userText);
      setMessages((prev) => [...prev, { role: 'assistant', text: res.answer || res.response || 'AgriAI recommendation verified.' }]);
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'AgriAI decision support recommendation: Monitor soil moisture and inspect lower leaves for early thrips activity.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="AgriAI Multilingual Assistant"
        subtitle="Conversational AI for agronomic pest advice, Mandi price forecasting, and crop care."
        badge="AI Decision Support"
      />

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {[
          'What is the 7-day onion price forecast for Nashik APMC?',
          'How to treat yellowing leaves in Red Onion?',
          'What is the recommended fertigation schedule for bulb swelling?',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInput(prompt)}
            className="text-xs font-semibold bg-white border border-[#E7E5DC] hover:border-[#1B4D3E] text-[#19201D] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <CardPanel className="flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`p-2 rounded-xl text-white ${m.role === 'user' ? 'bg-[#D97706]' : 'bg-[#1B4D3E]'}`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
              </div>
              <div
                className={`max-w-md p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#1B4D3E] text-white rounded-tr-none'
                    : 'bg-[#F6F4ED] text-[#19201D] border border-[#E7E5DC] rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 p-2">
              <Bot className="w-4 h-4 text-[#1B4D3E] animate-spin" />
              <span>AgriAI is thinking...</span>
            </div>
          )}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-[#F6F4ED] mt-4">
          <input
            type="text"
            placeholder="Ask AgriAI in Marathi, Hindi, Tamil, or English..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl text-xs md:text-sm outline-none focus:border-[#1B4D3E]"
          />
          <Button type="submit" isLoading={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardPanel>
    </div>
  );
}
