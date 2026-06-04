interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Spinner({ size = 'md', className = '' }: Readonly<SpinnerProps>) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    }

    return (
        <output
            className={`${sizeClasses[size]} border-[#BCF7B3] border-t-[#1C7E3C] rounded-full animate-spin ${className}`}
            aria-label="Cargando"
        />
    )
}
