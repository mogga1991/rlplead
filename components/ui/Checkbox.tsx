import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  className = '',
  ...props
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            w-5 h-5 border rounded flex items-center justify-center
            transition-colors
            ${checked
              ? 'bg-fed-green-900 border-fed-green-900'
              : 'bg-white border-gray-300 hover:border-gray-400'
            }
            ${className}
          `}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
};
