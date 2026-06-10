interface PageHeaderProps {
    titulo: string
    descripcion?: string
    acciones?: React.ReactNode
}

export function PageHeader({ titulo, descripcion, acciones }: Readonly<PageHeaderProps>) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
                {descripcion && (
                    <p className="text-sm text-gray-500 mt-0.5">{descripcion}</p>
                )}
            </div>
            {acciones && (
                <div className="flex items-center gap-2 shrink-0 ml-4">
                    {acciones}
                </div>
            )}
        </div>
    )
}