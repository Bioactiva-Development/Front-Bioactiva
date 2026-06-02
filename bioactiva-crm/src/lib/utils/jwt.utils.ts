/**
 * Decodificación de JWT en el frontend.
 *
 * IMPORTANTE: este decodificador NO valida la firma — solo extrae el payload
 * para uso de UI (mostrar nombre, id, rol). La validación real ocurre en el
 * backend en cada request.
 */

export interface JwtPayloadRaw {
  sub: string | number
  correo?: string
  nombres?: string
  apellidos?: string
  role?: number
  estado?: number
  iat?: number
  exp?: number
  aud?: string
  iss?: string
}

const base64UrlDecode = (input: string): string => {
  // base64url → base64 estándar.
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = padded.length % 4
  const base64 = padding ? padded + '='.repeat(4 - padding) : padded

  // atob convierte base64 ASCII a binary string. Usamos decodeURIComponent
  // para manejar caracteres UTF-8 (ej. nombres con tildes).
  const binary = atob(base64)
  try {
    return decodeURIComponent(
      Array.from(binary)
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
  } catch {
    return binary
  }
}

/**
 * Decodifica el payload de un JWT sin validar firma.
 * Devuelve null si el token no es un JWT válido.
 */
export const decodeJwt = (token: string): JwtPayloadRaw | null => {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayloadRaw
  } catch {
    return null
  }
}

/**
 * `sub` puede venir como string o número según el backend. Devuelve siempre
 * número o NaN si no se puede parsear.
 */
export const subToNumber = (sub: string | number | undefined): number => {
  if (sub === undefined) return NaN
  return typeof sub === 'number' ? sub : Number(sub)
}
