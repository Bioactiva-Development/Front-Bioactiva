import { NextRequest, NextResponse } from 'next/server'
import { RolUsuario } from '@/types/enums'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/activate']
const ADMIN_PATHS = ['/control-acceso']

export function middleware(request: NextRequest) {
    const token = request.cookies.get('bioactiva_token')?.value
    const rol = request.cookies.get('bioactiva_rol')?.value
    const { pathname } = request.nextUrl

    const isPublicPath = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    )
    const isAdminPath = ADMIN_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    )

    // Sin token → redirigir a login si la ruta está protegida
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Con token → no mostrar páginas públicas (redirigir al dashboard)
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Ruta de solo administrador → redirigir al dashboard si no es admin
    if (token && isAdminPath && rol !== RolUsuario.Administrador) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)'],
}
