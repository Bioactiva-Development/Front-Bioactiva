import { forwardRef, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
    label: string
    show: boolean
    onToggle: () => void
    error?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({ label, show, onToggle, error, ...inputProps }, ref) => (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    ref={ref}
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...inputProps}
                    className={`w-full px-4 py-3 pr-11 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 text-sm outline-none transition-colors bg-[#F1FFEC] ${error ? 'border-red-400' : 'border-[#BCF7B3] focus:border-[#1C7E3C]'}`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C7E3C]"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
)
PasswordField.displayName = 'PasswordField'
