'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FinanceRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FileText, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function FinancePage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<FinanceRecord['category']>('Seeds');
  const [amount, setAmount] = useState<number>(5000);
  const [description, setDescription] = useState('');

  useEffect(() => {
    dataService.getFinance(user?.id).then(setRecords);
  }, [user]);

  const totalIncome = records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await dataService.createFinanceRecord({
        user_id: user?.id || 'user-farmer-01',
        type,
        category,
        amount: Number(amount),
        description,
      });
      setRecords((prev) => [created, ...prev]);
      showSuccess('Transaction Saved!', `${type.toUpperCase()} of ₹${amount} recorded.`);
      setIsModalOpen(false);
      setDescription('');
    } catch (err: any) {
      showError('Failed to record transaction', err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'buyer', 'admin']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <FileText className="w-4 h-4" /> Farm Accounting & Profit Estimation
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Farm Financial Ledger
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Track farm-level and cultivation-level income, input expenses, labor costs, subsidies, and net profit.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Total Farm Income
            </span>
            <p className="text-2xl font-black text-emerald-400">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Input & Labour Expenses
            </span>
            <p className="text-2xl font-black text-rose-400">₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1">
            <span className="text-xs text-gray-400 font-mono">Estimated Net Profit</span>
            <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
          <h3 className="font-bold text-base text-white">Recent Transactions</h3>
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{r.description || r.category}</h4>
                  <p className="text-xs text-gray-400">{r.transaction_date} • {r.category}</p>
                </div>
                <span className={`font-black text-base ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {r.type === 'income' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Transaction" subtitle="Income or Expense entry">
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Labour">Labour</option>
                  <option value="Crop Sales">Crop Sales</option>
                  <option value="Government Subsidy">Government Subsidy</option>
                  <option value="Machinery">Machinery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Amount (₹)</label>
              <input type="number" required value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description</label>
              <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. Purchase of certified paddy seed" />
            </div>

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">
              Save Transaction Record
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
