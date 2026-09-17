'use client';

import React, { useState } from 'react';
import { Upload, Camera, Check, X } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  value?: string;
  onChange?: (url: string) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Photo or File Evidence',
  value,
  onChange,
  accept = 'image/*',
}) => {
  const [fileUrl, setFileUrl] = useState(value || '');

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      setFileUrl(mockUrl);
      if (onChange) onChange(mockUrl);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-[#19201D] uppercase tracking-wide">
          {label}
        </label>
      )}

      {fileUrl ? (
        <div className="p-3 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4D3E]">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>File Evidence Uploaded</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFileUrl('');
              if (onChange) onChange('');
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-[#E7E5DC] hover:border-[#1B4D3E] rounded-xl cursor-pointer transition text-center space-y-1">
          <div className="p-2 bg-[#F6F4ED] text-[#1B4D3E] rounded-full">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#19201D]">Tap to Take Photo or Upload File</span>
          <span className="text-[10px] text-gray-400">JPG, PNG, PDF up to 10MB</span>
          <input type="file" accept={accept} onChange={handleSimulatedUpload} className="hidden" />
        </label>
      )}
    </div>
  );
};
