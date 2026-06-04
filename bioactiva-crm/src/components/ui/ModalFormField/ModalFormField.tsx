import type { ReactNode } from 'react'

interface ModalFormFieldProps {
    label: string
    error?: string
    children: ReactNode
}

export function ModalFormField({ label, error, children }: Readonly<ModalFormFieldProps>) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label}
            </label>
            {children}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

export function modalInputCn(hasError: boolean) {
    return `w-full px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 rounded-xl border-2 outline-none transition-colors bg-gray-50 ${
        hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#1C7E3C]'
    }`
}
