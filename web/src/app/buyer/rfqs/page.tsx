'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RFQ } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FileText, Plus, MapPin, Calendar, Tag, ArrowRight } from 'lucide-react';

export default function BuyerRFQsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [cropName, setCropName] = useState('');
  const [qtyKg, setQtyKg] = useState<number>(1000);
  const [targetPrice, setTargetPrice] = useState<number>(100);
  const [grade, setGrade] = useState('Grade A');
  const [location, setLocation] = useState('');
  const [neededBy, setNeededBy] = useState('');

  useEffect(() => {
    dataService.getRFQs().then(setRfqs);
  }, []);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await dataService.createRFQ({
        buyer_id: user?.id || 'user-buyer-01',
        buyer_name: user?.full_name || 'Procurement Buyer',
        crop_name: cropName,
        required_quantity_kg: Number(qtyKg),
        target_price_per_kg: Number(targetPrice),
        quality_grade: grade,
        location: location || 'Regional Warehouse',
        needed_by_date: neededBy || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
      setRfqs((prev) => [created, ...prev]);
      showSuccess('RFQ Posted Successfully!', 'Farmers and FPOs can now view and submit competitive pricing offers.');
      setIsModalOpen(false);
      setCropName('');
    } catch (err: any) {
      showError('Failed to post RFQ', err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['buyer', 'admin', 'farmer', 'fpo']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <FileText className="w-4 h-4" /> Bulk Procurement Demands
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Requests For Quotation (RFQs)
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Post your crop specifications and volume requirements to receive direct offers from farmers and cooperatives.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New RFQ</span>
          </button>
        </div>

        {/* RFQ List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{rfq.crop_name}</h3>
                  <p className="text-xs text-emerald-400 font-medium">{rfq.buyer_name}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full">
                  {rfq.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                  <span className="text-gray-400 uppercase font-mono text-[10px]">Required Vol</span>
                  <p className="font-bold text-white text-sm mt-0.5">{rfq.required_quantity_kg.toLocaleString('en-IN')} kg</p>
                </div>
                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                  <span className="text-gray-400 uppercase font-mono text-[10px]">Target Price</span>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">₹{rfq.target_price_per_kg}/kg</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1e2d26]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {rfq.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Needed by: {rfq.needed_by_date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New RFQ" subtitle="Post bulk demand for farmers">
          <form onSubmit={handleCreateRFQ} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Crop Name & Spec</label>
              <input type="text" required value={cropName} onChange={(e) => setCropName(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. Red Chilli / Byadgi" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Required Quantity (kg)</label>
                <input type="number" required value={qtyKg} onChange={(e) => setQtyKg(Number(e.target.value))} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Target Price (₹/kg)</label>
                <input type="number" required value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quality Grade</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="Grade A">Grade A</option>
                  <option value="Export Quality">Export Quality</option>
                  <option value="Grade B">Grade B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Delivery Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. Bengaluru Warehouse" />
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">
              Publish RFQ Demand
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
