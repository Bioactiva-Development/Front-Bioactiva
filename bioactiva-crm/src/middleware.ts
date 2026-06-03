import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/activate',
    '/accept-invitation',
]

const ADMIN_ONLY_PATHS = ['/control-acceso']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('bioactiva_token')?.value
    const rol   = request.cookies.get('bioactiva_rol')?.value

    const isPublic = PUBLIC_PATHS.some(
        p => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`)
    )

    // Usuarios autenticados no deben acceder a páginas públicas de auth
    if (isPublic && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Rutas protegidas requieren sesión
    if (!isPublic && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rutas exclusivas del Administrador
    if (ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p)) && token && rol !== 'Administrador') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
