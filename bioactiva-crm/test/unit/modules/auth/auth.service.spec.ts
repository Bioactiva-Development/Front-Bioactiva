
/**
 * AuthService
 * ----------
 * Responsable de:
 * - login de usuarios
 * - validación de tokens
 * - recuperación, reseteo y activación de cuenta
 */
// STATUS: Implementación parcial (ruteo HTTP del servicio de autenticación).

jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: false,
}))

const postMock = jest.fn()
const getMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: postMock,
    get: getMock,
  },
}))

jest.mock('@/services/mock/auth.mock', () => ({
  mockLogin: jest.fn(),
  mockForgotPassword: jest.fn(),
  mockValidateToken: jest.fn(),
  mockResetPassword: jest.fn(),
  mockActivateAccount: jest.fn(),
}))

import { authService } from '@/services/modules/auth.service'

/**
 * AuthService — modo API real
 * ----------------------------
 * Responsable de:
 * - login de usuarios
 * - validación de tokens
 * - recuperación, reseteo y activación de cuenta
 * - refresh y getMe
 */
// STATUS: Implementación parcial (ruteo HTTP del servicio de autenticación).

describe('security/auth.service (API mode)', () => {
  beforeEach(() => {
    postMock.mockReset()
    getMock.mockReset()
  })

  it('posts login requests to the auth endpoint', async () => {
    postMock.mockResolvedValueOnce({ data: { accessToken: 'token-123', accessTokenExpiresIn: 900 } })

    const response = await authService.login({
      correo: 'admin@bioactiva.pe',
      password: 'Secret123!',
    })

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      correo: 'admin@bioactiva.pe',
      password: 'Secret123!',
    })
    expect(response).toEqual({ accessToken: 'token-123', accessTokenExpiresIn: 900 })
  })

  it('posts refresh request to the auth refresh endpoint', async () => {
    postMock.mockResolvedValueOnce({ data: { accessToken: 'refreshed-token', accessTokenExpiresIn: 900 } })

    const response = await authService.refresh()

    expect(postMock).toHaveBeenCalledWith('/auth/refresh')
    expect(response).toEqual({ accessToken: 'refreshed-token', accessTokenExpiresIn: 900 })
  })

  it('gets current user from /auth/me endpoint', async () => {
    const rawUser = {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      password: 'hashed',
      role: 0,
      estado: 1,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    }
    getMock.mockResolvedValueOnce({ data: rawUser })

    const usuario = await authService.getMe()

    expect(getMock).toHaveBeenCalledWith('/auth/me')
    expect(usuario).toEqual({
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      rol: 'Administrador',
      estado: 'Activo',
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    })
  })

  it('sends forgot password request', async () => {
    postMock.mockResolvedValueOnce({ data: { ok: true } })

    const response = await authService.forgotPassword('admin@bioactiva.pe')

    expect(postMock).toHaveBeenCalledWith('/reset-password/request', { correo: 'admin@bioactiva.pe' })
    expect(response).toEqual({ ok: true })
  })

  it('sends reset password request', async () => {
    postMock.mockResolvedValueOnce({ data: { ok: true } })

    const response = await authService.resetPassword('token-abc', 'NewPass123!', 'NewPass123!')

    expect(postMock).toHaveBeenCalledWith('/reset-password/reset', {
      token: 'token-abc',
      password: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    })
    expect(response).toEqual({ ok: true })
  })

  it('gets token validation from the dynamic endpoint', async () => {
    postMock.mockResolvedValueOnce({ data: { valid: true, correo: 'admin@bioactiva.pe' } })

    const response = await authService.validateToken('token-abc')

    expect(postMock).toHaveBeenCalledWith('/reset-password/validate', { token: 'token-abc' })
    expect(response).toEqual({ valid: true, correo: 'admin@bioactiva.pe' })
  })

  it('does not call API on logout (no-op)', async () => {
    postMock.mockResolvedValue({})

    await authService.logout()

    expect(postMock).not.toHaveBeenCalled()
  })

  it('handles 400 error from validateToken gracefully', async () => {
    postMock.mockRejectedValueOnce({ status: 400, message: 'El enlace de recuperación ha expirado.' })

    const response = await authService.validateToken('expired-token')

    expect(response).toEqual({
      valid: false,
      message: 'El enlace de recuperación ha expirado.',
    })
  })

  it('handles non-400 error from validateToken gracefully', async () => {
    postMock.mockRejectedValueOnce({ status: 500, message: 'Server error' })

    const response = await authService.validateToken('bad-token')

    expect(response).toEqual({
      valid: false,
      message: 'Server error',
    })
  })
})
