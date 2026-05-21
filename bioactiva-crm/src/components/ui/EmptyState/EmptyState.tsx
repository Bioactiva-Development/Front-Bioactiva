import { Building2 } from 'lucide-react'

interface EmptyStateProps {
    title?: string
    description?: string
    action?: React.ReactNode
}

export function EmptyState({
    title = 'No hay resultados',
    description = 'No se encontraron datos para mostrar.',
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F1FFEC] flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-[#1C7E3C]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}
