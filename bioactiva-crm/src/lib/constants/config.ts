export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'BioActiva CRM'

export const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000

export const TOKEN_KEY = 'bioactiva_token'

export const USER_KEY = 'bioactiva_user'

// Nombres de cookies usadas por el middleware de Next para los guards de
// sesión y rol. Mantenerlos sincronizados con `middleware.ts`.
export const COOKIE_TOKEN = 'bioactiva_token'
export const COOKIE_ROL   = 'bioactiva_rol'

export const DOMINIO_INSTITUCIONAL = 'bioactiva.pe'

export const HORARIO_LABORAL = {
    inicio: 8,
    fin: 18,
}

export const DIAS_INACTIVIDAD_LEAD = 30