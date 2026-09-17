import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-bold text-[#19201D] uppercase tracking-wide">
            {label} {props.required && <span className="text-amber-600">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-12 px-4 bg-white border border-[#E7E5DC] focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/20 rounded-xl text-sm text-[#19201D] placeholder-gray-400 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-bold text-[#19201D] uppercase tracking-wide">
            {label} {props.required && <span className="text-amber-600">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full h-12 px-4 bg-white border border-[#E7E5DC] focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/20 rounded-xl text-sm text-[#19201D] outline-none transition ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariant = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#1B4D3E] hover:bg-[#143B30] text-white shadow-md';
      case 'accent':
        return 'bg-[#D97706] hover:bg-amber-700 text-white shadow-md';
      case 'secondary':
        return 'bg-[#F6F4ED] hover:bg-[#E7E5DC] text-[#19201D] border border-[#E7E5DC]';
      case 'outline':
        return 'bg-transparent border border-[#1B4D3E] text-[#1B4D3E] hover:bg-[#1B4D3E]/5';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-md';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 text-xs font-semibold rounded-lg';
      case 'md':
        return 'h-12 px-5 text-sm font-bold rounded-xl';
      case 'lg':
        return 'h-14 px-6 text-base font-extrabold rounded-2xl';
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${getVariant()} ${getSize()} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      )}
      {children}
    </button>
  );
};
