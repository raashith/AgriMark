import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
      <h4 className="text-sm font-bold text-red-800">{title}</h4>
      <p className="text-xs text-red-600 max-w-lg mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
