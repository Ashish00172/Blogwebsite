"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PasswordInput({ label, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      {label ? <label className="text-sm font-medium text-slate-700">{label}</label> : null}
      <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <input {...props} type={show ? "text" : "password"} className="w-full bg-transparent text-sm text-slate-900 outline-none" />
        <button type="button" onClick={() => setShow((value) => !value)} className="ml-3 text-slate-500 transition hover:text-slate-700">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
