import { NextRequest, NextResponse } from 'next/server'
import { RolUsuario } from '@/types/enums'
import { COOKIE_TOKEN, COOKIE_ROL } from '@/lib/constants/config'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/activate', '/accept-invitation']
const ADMIN_PATHS = ['/control-acceso']

const IS_PROD = process.env.NODE_ENV === 'production'

// CSP estricta basada en nonce (produccion). Cada request genera un nonce y
// Next.js lo aplica automaticamente a sus <script>/<style>. Con 'strict-dynamic',
// los scripts cargados por scripts ya confiables (p. ej. reCAPTCHA via
// react-google-recaptcha) quedan permitidos sin necesidad de 'unsafe-inline'.
//  - script-src: sin 'unsafe-inline' ni 'unsafe-eval'.
//  - style-src: sin 'unsafe-inline' para <style>; los atributos style inline en
//    runtime (React style={{}}, drag&drop, charts) se permiten via style-src-attr.
function buildStrictCsp(nonce: string): string {
    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
        `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
        "style-src-attr 'unsafe-inline'",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https: http://localhost:* ws://localhost:*",
        "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ].join('; ')
}

// En desarrollo se mantiene una CSP relajada: con un nonce presente el navegador
// ignora 'unsafe-inline' (spec CSP), lo que rompe el HMR/Fast Refresh de Next.
function buildDevCsp(): string {
    return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https: http://localhost:* ws://localhost:*",
        "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ].join('; ')
}

export function proxy(request: NextRequest) {
    const token = request.cookies.get(COOKIE_TOKEN)?.value
    const rol = request.cookies.get(COOKIE_ROL)?.value
    const { pathname } = request.nextUrl

    const nonce = IS_PROD ? btoa(crypto.randomUUID()) : ''
    const csp = IS_PROD ? buildStrictCsp(nonce) : buildDevCsp()

    const isPublicPath = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    )
    const isAdminPath = ADMIN_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    )

    const redirectTo = (url: string) => {
        const redirect = NextResponse.redirect(new URL(url, request.url))
        redirect.headers.set('Content-Security-Policy', csp)
        return redirect
    }

    if (!token && !isPublicPath) return redirectTo('/login')
    if (token && isPublicPath) return redirectTo('/dashboard')
    if (token && isAdminPath && rol !== RolUsuario.Administrador) {
        return redirectTo('/dashboard')
    }

    // En produccion se pasa el nonce y la CSP en los headers de la request para
    // que Next.js los lea y firme sus propios scripts/estilos del documento.
    if (IS_PROD) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('Content-Security-Policy', csp)
        requestHeaders.set('x-nonce', nonce)

        const response = NextResponse.next({ request: { headers: requestHeaders } })
        response.headers.set('Content-Security-Policy', csp)
        return response
    }

    const response = NextResponse.next()
    response.headers.set('Content-Security-Policy', csp)
    return response
}

export const config = {
    // Nota: el matcher debe ser un literal estático analizable por Next.js;
    // no usar String.raw ni concatenaciones (rompe "next build"). Sonar S7780.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)'],
}
