'use client'

import { CheckCircle, XCircle, Circle } from 'lucide-react'

const REQUIREMENTS = [
    { label: 'Mínimo 6 caracteres', test: (p: string) => p.length >= 6 },
]

interface PasswordRequirementsProps {
    password: string
}

export function PasswordRequirements({ password }: Readonly<PasswordRequirementsProps>) {
    const hasStarted = password.length > 0

    return (
        <ul className="space-y-1.5">
            {REQUIREMENTS.map(({ label, test }) => {
                const met = test(password)
                const icon = hasStarted
                    ? met
                        ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                        : <XCircle size={13} className="text-red-400 shrink-0" />
                    : <Circle size={13} className="text-gray-300 shrink-0" />
                const textClass = !hasStarted ? 'text-gray-400' : met ? 'text-emerald-600' : 'text-red-500'
                return (
                    <li key={label} className="flex items-center gap-2 text-xs">
                        {icon}
                        <span className={textClass}>
                            {label}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
