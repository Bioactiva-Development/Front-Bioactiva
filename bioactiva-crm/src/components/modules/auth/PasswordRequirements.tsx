'use client'

import { CheckCircle, XCircle, Circle } from 'lucide-react'

const REQUIREMENTS = [
    { label: 'Mínimo 6 caracteres', test: (p: string) => p.length >= 6 },
]

interface PasswordRequirementsProps {
    password: string
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
    const hasStarted = password.length > 0

    return (
        <ul className="space-y-1.5">
            {REQUIREMENTS.map(({ label, test }) => {
                const met = test(password)
                return (
                    <li key={label} className="flex items-center gap-2 text-xs">
                        {!hasStarted ? (
                            <Circle size={13} className="text-gray-300 shrink-0" />
                        ) : met ? (
                            <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                        ) : (
                            <XCircle size={13} className="text-red-400 shrink-0" />
                        )}
                        <span className={
                            !hasStarted ? 'text-gray-400' :
                            met        ? 'text-emerald-600' :
                                         'text-red-500'
                        }>
                            {label}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
