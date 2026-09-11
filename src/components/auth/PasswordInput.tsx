'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  autoComplete?: string
}

export function PasswordInput({ id, name, label, value, onChange, error, autoComplete }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-slate-300 pl-3 pr-10 py-2.5 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
