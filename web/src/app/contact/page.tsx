'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ContactPage() {
  const { showSuccess } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Message Sent!', 'Thank you for reaching out to AgriMark Support. We will get back to you within 24 hours.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2 text-center md:text-left shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">Contact AgriMark Support</h1>
        <p className="text-xs text-gray-300">Have questions about farmer onboarding, bulk buyer procurement, or platform integration?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl">
          <h3 className="font-bold text-lg text-white">National Support Desk</h3>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex items-center gap-3 p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Toll-Free Helpline: 1800-425-AGRI (2474)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Email: support@agrimark.in</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>AgriMark Operations Center, Thanjavur / Bengaluru</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#121a16] border border-[#1e2d26] p-6 rounded-3xl">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Your Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none" placeholder="Ramanathan" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email or Mobile</label>
            <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none" placeholder="farmer@agrimark.in" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Message</label>
            <textarea rows={3} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none" placeholder="How can we help you?" />
          </div>
          <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
