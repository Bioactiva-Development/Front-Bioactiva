import type { ReactNode } from 'react'

interface AuthLayoutProps {
    title: string
    subtitle: string
    children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: Readonly<AuthLayoutProps>) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1C7E3C] via-[#1C7E3C]/90 to-[#BCF7B3]">
            <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/10 blur-sm" />
            <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/10 blur-sm" />
            <div className="absolute top-1/2 left-[-120px] w-80 h-80 rounded-full bg-white/5" />

            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#1C7E3C] px-8 py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                        <img src="/BAlogo.svg" alt="BioActiva" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-white text-xl font-bold">Bioactiva CRM</h1>
                </div>

                <div className="bg-white px-8 py-8 space-y-5">
                    <div>
                        <h2 className="text-gray-900 text-xl font-bold">{title}</h2>
                        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
