import { forwardRef, type InputHTMLAttributes } from 'react'

interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
}

export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
    ({ label, error, ...inputProps }, ref) => (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label} <span className="text-red-500">*</span>
            </label>
            <input
                ref={ref}
                type="text"
                {...inputProps}
                className={`w-full px-4 py-3 text-gray-900 placeholder:text-gray-400 rounded-xl border-2 text-sm outline-none transition-colors bg-[#F1FFEC] ${error ? 'border-red-400' : 'border-[#BCF7B3] focus:border-[#1C7E3C]'}`}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
)
AuthTextField.displayName = 'AuthTextField'
