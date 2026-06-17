interface PageHeaderProps {
    titulo: string
    descripcion?: string
    acciones?: React.ReactNode
}

export function PageHeader({ titulo, descripcion, acciones }: Readonly<PageHeaderProps>) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
                {descripcion && (
                    <p className="text-sm text-gray-500 mt-0.5">{descripcion}</p>
                )}
            </div>
            {acciones && (
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-4">
                    {acciones}
                </div>
            )}
        </div>
    )
}