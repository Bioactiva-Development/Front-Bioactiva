import {
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

  it('rejects empty email in login', () => {
    expect(() =>
      loginSchema.parse({ correo: '', password: 'secret' })
    ).toThrow('El correo es obligatorio')
  })

  it('validates forgot password data', () => {
    expect(
      forgotPasswordSchema.parse({ correo: 'admin@bioactiva.pe' })
    ).toEqual({ correo: 'admin@bioactiva.pe' })
  })

  it('rejects empty email in forgot password', () => {
    expect(() =>
      forgotPasswordSchema.parse({ correo: '' })
    ).toThrow('El correo es obligatorio')
  })

  it('rejects invalid email in forgot password', () => {
    expect(() =>
      forgotPasswordSchema.parse({ correo: 'bad-email' })
    ).toThrow()
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

  it('rejects reset password without uppercase', () => {
    expect(() =>
      resetPasswordSchema.parse({
        password: 'secret123!',
        confirmPassword: 'secret123!',
      })
    ).toThrow('Debe contener al menos una letra mayúscula')
  })

  it('rejects reset password without number', () => {
    expect(() =>
      resetPasswordSchema.parse({
        password: 'Secret!!!',
        confirmPassword: 'Secret!!!',
      })
    ).toThrow('Debe contener al menos un número')
  })

  it('rejects reset password without special char', () => {
    expect(() =>
      resetPasswordSchema.parse({
        password: 'Secret123',
        confirmPassword: 'Secret123',
      })
    ).toThrow('Debe contener al menos un carácter especial')
  })

  it('rejects reset password shorter than 8 chars', () => {
    expect(() =>
      resetPasswordSchema.parse({
        password: 'Se1!',
        confirmPassword: 'Se1!',
      })
    ).toThrow('La contraseña debe tener al menos 8 caracteres')
  })

})
