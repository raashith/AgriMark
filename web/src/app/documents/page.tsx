'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FarmerDocument } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldCheck, Plus, FileText, Lock } from 'lucide-react';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [docs, setDocs] = useState<FarmerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [docType, setDocType] = useState<FarmerDocument['doc_type']>('Land Record (Patta/Chitta)');
  const [docNumber, setDocNumber] = useState('');
  const [authority, setAuthority] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const list = await dataService.getDocuments(user.id);
        setDocs(list);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to upload documents.');
      return;
    }
    try {
      const created = await dataService.createDocument({
        user_id: user.id,
        doc_type: docType,
        doc_number: docNumber,
        issuing_authority: authority || 'Revenue Department',
        is_private: true,
      });
      if (created) {
        setDocs((prev) => [created, ...prev]);
        showSuccess('Document Uploaded Successfully!', 'Document stored under your private vault.');
        setIsModalOpen(false);
        setDocNumber('');
      } else {
        showError('Upload Failed', 'Database submission failed.');
      }
    } catch (err: any) {
      showError('Failed to upload document', err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin', 'buyer']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Land Records & Certifications
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Farmer Document Vault & Records
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Storage for Patta/Chitta land records, Kisan Credit Cards, organic certificates, and soil reports.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <EmptyState
            title="No Uploaded Documents Found"
            description="You have not uploaded any land records or certifications yet. Click 'Upload New Document' to add to your vault."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">{doc.doc_type}</h3>
                      <p className="text-xs text-gray-400 font-mono">No: {doc.doc_number}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {doc.verification_status}
                  </span>
                </div>

                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Issuing Authority:</span>
                    <span className="text-white font-medium">{doc.issuing_authority}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Privacy Mode:</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Private Vault
                    </span>
                  </div>
                </div>

                {doc.extracted_info && (
                  <p className="text-xs text-gray-400 bg-[#0a0f0d] p-3 rounded-xl border border-[#1e2d26]">
                    {doc.extracted_info}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document" subtitle="Private Storage">
          <form onSubmit={handleUploadDoc} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value as any)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                <option value="Land Record (Patta/Chitta)">Land Record (Patta/Chitta)</option>
                <option value="Aadhaar ID">Aadhaar ID</option>
                <option value="Kisan Credit Card">Kisan Credit Card</option>
                <option value="Soil Test Report">Soil Test Report</option>
                <option value="Organic Certification">Organic Certification</option>
                <option value="FPO Membership">FPO Membership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Document / License Number</label>
              <input type="text" required value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="PATTA-TN-2026-8891" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Issuing Authority</label>
              <input type="text" value={authority} onChange={(e) => setAuthority(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="Revenue Dept, Govt of Tamil Nadu" />
            </div>

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">
              Upload Document
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
