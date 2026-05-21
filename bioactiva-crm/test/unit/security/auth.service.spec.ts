
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

describe('security/auth.service', () => {
  beforeEach(() => {
    postMock.mockReset()
    getMock.mockReset()
  })

  it('posts login requests to the auth endpoint', async () => {
    postMock.mockResolvedValueOnce({ data: { token: 'token-123', usuario: { id: 1 } } })

    const response = await authService.login({
      correo: 'admin@bioactiva.pe',
      password: 'Secret123!',
    })

    expect(postMock).toHaveBeenCalledWith('/api/auth/login', {
      correo: 'admin@bioactiva.pe',
      password: 'Secret123!',
    })
    expect(response).toEqual({ token: 'token-123', usuario: { id: 1 } })
  })

  it('gets token validation from the dynamic endpoint', async () => {
    getMock.mockResolvedValueOnce({ data: { valid: true, correo: 'admin@bioactiva.pe' } })

    const response = await authService.validateToken('token-abc')

    expect(getMock).toHaveBeenCalledWith('/api/auth/validate-token/token-abc')
    expect(response).toEqual({ valid: true, correo: 'admin@bioactiva.pe' })
  })

  it('calls logout endpoint', async () => {
    postMock.mockResolvedValueOnce({})

    await authService.logout()

    expect(postMock).toHaveBeenCalledWith('/api/auth/logout')
  })
})
