import { getErrorMessage } from '@/lib/utils/error.utils'

/**
 * ErrorUtils
 * ----------
 * Responsable de:
 * - extraer mensaje de error desde distintos formatos
 */
// STATUS: Implementación completa.

describe('security/error.utils', () => {
  it('extracts message from an AppError object', () => {
    const error = { status: 400, message: 'Correo o contraseña incorrectos' }
    expect(getErrorMessage(error)).toBe('Correo o contraseña incorrectos')
  })

  it('extracts message from an Error instance', () => {
    const error = new Error('Error de red')
    expect(getErrorMessage(error)).toBe('Error de red')
  })

  it('returns fallback when err is a string', () => {
    expect(getErrorMessage('raw string', 'fallback')).toBe('fallback')
  })

  it('returns fallback when err is null', () => {
    expect(getErrorMessage(null, 'fallback null')).toBe('fallback null')
  })

  it('returns fallback when err is undefined', () => {
    expect(getErrorMessage(undefined, 'fallback undefined')).toBe('fallback undefined')
  })

  it('returns fallback when err object has no message', () => {
    expect(getErrorMessage({ foo: 'bar' }, 'sin mensaje')).toBe('sin mensaje')
  })

  it('uses default fallback when none provided', () => {
    expect(getErrorMessage('')).toBe('Ocurrió un error inesperado')
  })

  it('returns fallback when err is a number', () => {
    expect(getErrorMessage(500, 'error numérico')).toBe('error numérico')
  })
})
