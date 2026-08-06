'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}

export default function AuthInput({ id, label, type, value, onChange, placeholder, required, minLength }: AuthInputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className="relative w-full border-2 border-[#d9d9d9] has-[:focus]:border-[#187fe7] rounded-[10px] flex items-center gap-2 px-4 py-4 transition-colors">
      <input
        id={id}
        type={resolvedType}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="peer flex-1 min-w-0 text-[18px] text-[#232323] placeholder:text-[#9a9a9a] outline-none bg-transparent"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-[#9a9a9a] hover:text-[#232323] transition-colors shrink-0 cursor-pointer"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      )}
      <label
        htmlFor={id}
        className="absolute -top-[10.5px] left-[10px] bg-white px-1 text-[14px] font-medium text-[#9a9a9a] peer-focus:text-[#367aff]"
      >
        {label}
      </label>
    </div>
  );
}
