'use client'

import { type JSX } from 'react'
import { CheckCircle, XCircle, Circle } from 'lucide-react'

const REQUIREMENTS_SIMPLE = [
    { label: 'Mínimo 6 caracteres', test: (p: string) => p.length >= 6 },
]

const REQUIREMENTS_FULL = [
    { label: 'Mínimo 8 caracteres',          test: (p: string) => p.length >= 8 },
    { label: 'Al menos una letra mayúscula',  test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Al menos un número',            test: (p: string) => /\d/.test(p) },
    { label: 'Al menos un carácter especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

interface PasswordRequirementsProps {
    password: string
    mode?: 'simple' | 'full'
}

export function PasswordRequirements({ password, mode = 'simple' }: Readonly<PasswordRequirementsProps>) {
    const requirements = mode === 'full' ? REQUIREMENTS_FULL : REQUIREMENTS_SIMPLE
    const hasStarted = password.length > 0

    return (
        <ul className="space-y-1.5">
            {requirements.map(({ label, test }) => {
                const met = test(password)
                let icon: JSX.Element = <Circle size={13} className="text-gray-300 shrink-0" />
                if (hasStarted) {
                    icon = met
                        ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                        : <XCircle size={13} className="text-red-400 shrink-0" />
                }
                let textClass = 'text-gray-400'
                if (hasStarted) {
                    textClass = met ? 'text-emerald-600' : 'text-red-500'
                }
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
