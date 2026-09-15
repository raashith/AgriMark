'use client';

import React from 'react';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-[#121a16] border border-[#1e2d26] rounded-3xl text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl overflow-hidden shadow-xl">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d1410] border-b border-[#1e2d26] text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d26]/60 text-xs text-gray-200">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-[#18241f] transition">
                {columns.map((col, idx) => (
                  <td key={idx} className={`p-4 font-medium ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-[#1e2d26]">
        {data.map((item) => (
          <div key={keyExtractor(item)} className="p-4 space-y-2">
            {columns.map((col, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-gray-400">{col.header}:</span>
                <div className="font-semibold text-white">{col.accessor(item)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
