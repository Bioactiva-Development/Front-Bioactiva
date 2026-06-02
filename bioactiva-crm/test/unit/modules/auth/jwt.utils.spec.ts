import { decodeJwt, subToNumber } from '@/lib/utils/jwt.utils'

/**
 * JwtUtils
 * --------
 * Responsable de:
 * - decodificar payload de JWT sin validar firma
 * - convertir sub a número
 */
// STATUS: Implementación completa.

describe('security/jwt.utils', () => {
  describe('decodeJwt', () => {
    it('decodes a valid JWT payload', () => {
      const payload = { sub: 1, correo: 'admin@bioactiva.pe', role: 0 }
      const base64 = btoa(JSON.stringify(payload))
      const token = `header.${base64}.signature`

      const result = decodeJwt(token)

      expect(result).toEqual(payload)
    })

    it('decodes a JWT with UTF-8 characters in payload', () => {
      const payload = { nombres: 'María José', apellidos: 'González Pérez' }
      const utf8 = unescape(encodeURIComponent(JSON.stringify(payload)))
      const base64 = btoa(utf8)
      const token = `header.${base64.replace(/=/g, '')}.signature`

      const result = decodeJwt(token)

      expect(result?.nombres).toBe('María José')
      expect(result?.apellidos).toBe('González Pérez')
    })

    it('returns null for a token with no dot separators', () => {
      expect(decodeJwt('not-a-jwt')).toBeNull()
    })

    it('returns null for a token with only one part', () => {
      expect(decodeJwt('header.payload')).toBeNull()
    })

    it('returns null for a token with invalid base64 in payload', () => {
      const token = 'header.!!!not-base64!!!.signature'
      expect(decodeJwt(token)).toBeNull()
    })

    it('returns null for an empty string', () => {
      expect(decodeJwt('')).toBeNull()
    })
  })

  describe('subToNumber', () => {
    it('returns the number when sub is a number', () => {
      expect(subToNumber(42)).toBe(42)
    })

    it('parses a string sub to number', () => {
      expect(subToNumber('42')).toBe(42)
    })

    it('returns NaN when sub is a non-numeric string', () => {
      expect(subToNumber('abc')).toBeNaN()
    })

    it('returns NaN when sub is undefined', () => {
      expect(subToNumber(undefined)).toBeNaN()
    })
  })
})
