import { CheckCircle, XCircle } from 'lucide-react'

type AlertVariant = 'error' | 'success'

const variantStyles: Record<AlertVariant, string> = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-[#F1FFEC] border-[#BCF7B3] text-[#1C7E3C]',
}

const variantIcons: Record<AlertVariant, React.ReactNode> = {
    error: <XCircle size={18} className="mt-0.5 shrink-0" />,
    success: <CheckCircle size={18} className="mt-0.5 shrink-0" />,
}

interface AuthAlertBannerProps {
    variant: AlertVariant
    message: string
    withIcon?: boolean
}

export function AuthAlertBanner({ variant, message, withIcon = false }: AuthAlertBannerProps) {
    return (
        <div className={`${withIcon ? 'flex items-start gap-3 ' : ''}${variantStyles[variant]} border text-sm rounded-lg px-4 py-3`}>
            {withIcon && variantIcons[variant]}
            <p>{message}</p>
        </div>
    )
}
