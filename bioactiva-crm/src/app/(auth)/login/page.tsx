import { Suspense } from 'react'
import { LoginForm } from '@/components/modules/auth/LoginForm'

export const metadata = {
  title: 'Iniciar sesión | BioActiva CRM',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#F1FFEC]">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}