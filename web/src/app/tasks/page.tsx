'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FarmTask } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckSquare, Plus, Calendar, CheckCircle2 } from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<FarmTask['priority']>('medium');

  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const list = await dataService.getTasks(user.id);
        setTasks(list);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to add farm tasks.');
      return;
    }
    try {
      const created = await dataService.createTask({
        user_id: user.id,
        title,
        description,
        due_date: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        priority,
      });
      if (created) {
        setTasks((prev) => [created, ...prev]);
        showSuccess('Task Added!', `Task "${title}" created for your farm.`);
        setIsModalOpen(false);
        setTitle('');
      } else {
        showError('Task Creation Failed', 'Database submission failed.');
      }
    } catch (err: any) {
      showError('Failed to add task', err.message);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    await dataService.toggleTaskStatus(id, currentStatus);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin', 'service_provider']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <CheckSquare className="w-4 h-4" /> Farm Operations & Field Work
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Farm Task Management & Reminders
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Organize irrigation schedules, fertigation, pest spraying, and harvesting tasks with automated alerts.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Task</span>
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No Farm Tasks Found"
            description="You have no pending tasks. Click 'Add New Task' to schedule field work."
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition flex items-center justify-between gap-4 shadow-md ${
                  task.status === 'completed'
                    ? 'bg-[#0a0f0d] border-[#1e2d26] opacity-60'
                    : 'bg-[#121a16] border-[#1e2d26]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`p-1.5 rounded-xl border transition ${
                      task.status === 'completed'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-[#2a3c33] text-gray-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div>
                    <h4 className={`font-bold text-sm text-white ${task.status === 'completed' ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-400">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {task.due_date}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                      task.priority === 'urgent'
                        ? 'bg-rose-950 border-rose-800 text-rose-300'
                        : task.priority === 'high'
                        ? 'bg-amber-950 border-amber-800 text-amber-300'
                        : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Farm Task" subtitle="Set field task & deadline">
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Task Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. Clean solar irrigation pump filter" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none" placeholder="Task details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Due Date</label>
                <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">
              Save Farm Task
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
