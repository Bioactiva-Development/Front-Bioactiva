import type { ReactNode } from 'react'

type MaxWidth = 'sm' | 'md'

const maxWidthClass: Record<MaxWidth, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
}

interface ModalShellProps {
    onClose: () => void
    maxWidth?: MaxWidth
    children: ReactNode
}

export function ModalShell({ onClose, maxWidth = 'md', children }: ModalShellProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative z-10 w-full ${maxWidthClass[maxWidth]} bg-white rounded-2xl shadow-2xl`}>
                {children}
            </div>
        </div>
    )
}
