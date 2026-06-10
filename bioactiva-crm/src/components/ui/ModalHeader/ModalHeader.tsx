import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalHeaderProps {
    icon: ReactNode
    iconBg: string
    title: string
    subtitle?: string
    onClose: () => void
}

export function ModalHeader({ icon, iconBg, title, subtitle, onClose }: Readonly<ModalHeaderProps>) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    )
}
