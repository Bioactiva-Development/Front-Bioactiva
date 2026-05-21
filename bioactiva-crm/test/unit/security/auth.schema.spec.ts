import {
  activateAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from '@/lib/validators/auth.schema'

/**
 * AuthSchema
 * ----------
 * Responsable de:
 * - validar datos de login
 * - validar recuperación y reseteo de contraseña
 * - validar activación de cuenta
 */
// STATUS: Implementación parcial (validaciones base de autenticación).

describe('security/auth.schema', () => {
  it('validates login data', () => {
    expect(
      loginSchema.parse({ correo: 'admin@bioactiva.pe', password: 'secret123' })
    ).toEqual({ correo: 'admin@bioactiva.pe', password: 'secret123' })
  })

  it('rejects invalid login data', () => {
    expect(() =>
      loginSchema.parse({ correo: 'invalid', password: '' })
    ).toThrow()
  })

  it('validates forgot password data', () => {
    expect(
      forgotPasswordSchema.parse({ correo: 'admin@bioactiva.pe' })
    ).toEqual({ correo: 'admin@bioactiva.pe' })
  })

  it('validates reset password confirmation', () => {
    expect(
      resetPasswordSchema.parse({
        password: 'Secret123!',
        confirmPassword: 'Secret123!',
      })
    ).toEqual({
      password: 'Secret123!',
      confirmPassword: 'Secret123!',
    })
  })

  it('rejects reset password mismatch', () => {
    expect(() =>
      resetPasswordSchema.parse({
        password: 'Secret123!',
        confirmPassword: 'Secret1234!',
      })
    ).toThrow('Las contraseñas no coinciden')
  })

  it('validates activate account payload', () => {
    expect(
      activateAccountSchema.parse({
        nombres: 'Maria',
        apellidos: 'Torres',
        password: 'Secret123!',
        confirmPassword: 'Secret123!',
      })
    ).toEqual({
      nombres: 'Maria',
      apellidos: 'Torres',
      password: 'Secret123!',
      confirmPassword: 'Secret123!',
    })
  })
})
