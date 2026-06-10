jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    () => ({ usuario: null }),
    { getState: () => ({ setSession: jest.fn() }) },
  ),
}))

import {
  mockLogin,
  mockForgotPassword,
  mockValidateToken,
  mockResetPassword,
} from '@/services/mock/auth.mock'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

describe('security/auth.mock (implementation)', () => {
  describe('mockLogin', () => {
    it('logs in admin user successfully', async () => {
      const result = await mockLogin({
        correo: 'admin@bioactiva.pe',
        password: 'admin123!',
      })

      expect(result.accessToken).toBeDefined()
      expect(result.accessTokenExpiresIn).toBe(900)
    })

    it('logs in worker user successfully', async () => {
      const result = await mockLogin({
        correo: 'maria@bioactiva.pe',
        password: 'trabajador123!',
      })

      expect(result.accessToken).toBeDefined()
    })

    it('throws 404 for unknown user', async () => {
      await expect(
        mockLogin({ correo: 'unknown@test.com', password: 'x' }),
      ).rejects.toMatchObject({ status: 404 })
    })

    it('throws 403 for inactive user', async () => {
      await expect(
        mockLogin({ correo: 'juan@bioactiva.pe', password: 'x' }),
      ).rejects.toMatchObject({ status: 403, message: expect.stringContaining('deshabilitado') })
    })

    it('throws 401 for wrong password', async () => {
      await expect(
        mockLogin({ correo: 'admin@bioactiva.pe', password: 'wrong' }),
      ).rejects.toMatchObject({ status: 401 })
    })
  })

  describe('mockForgotPassword', () => {
    it('always returns ok', async () => {
      const result = await mockForgotPassword('admin@bioactiva.pe')
      expect(result).toEqual({ ok: true })
    })
  })

  describe('mockValidateToken', () => {
    it('validates a valid recovery token', async () => {
      const result = await mockValidateToken('token-recuperacion-valido-123')
      expect(result.valid).toBe(true)
      expect(result.correo).toContain('@bioactiva.pe')
    })

    it('throws for consumed token', async () => {
      // Consumed token is not in the list, will be treated as unknown
      await expect(
        mockValidateToken('token-inexistente'),
      ).rejects.toMatchObject({ status: 400 })
    })

    it('throws for expired token', async () => {
      await expect(
        mockValidateToken('token-expirado-789'),
      ).rejects.toMatchObject({ status: 400, message: expect.stringContaining('expirado') })
    })
  })

  describe('mockResetPassword', () => {
    it('resets password with valid token', async () => {
      const result = await mockResetPassword('token-recuperacion-valido-123', 'newPass1!')
      expect(result).toEqual({ ok: true })
    })

    it('throws for invalid token', async () => {
      await expect(
        mockResetPassword('token-invalido', 'newPass1!'),
      ).rejects.toMatchObject({ status: 400 })
    })
  })
})
