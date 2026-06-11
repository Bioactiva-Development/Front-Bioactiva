import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: true,
}))

jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

const mockLogin = jest.fn()
const mockForgotPassword = jest.fn()
const mockValidateToken = jest.fn()
const mockResetPassword = jest.fn()

jest.mock('@/services/mock/auth.mock', () => ({
  mockLogin,
  mockForgotPassword,
  mockValidateToken,
  mockResetPassword,
}))

import { authService } from '@/services/modules/auth.service'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

/**
 * AuthService — modo Mock
 * -----------------------
 * Verifica que authService delega correctamente en los mocks
 * cuando USE_MOCK = true.
 */
// STATUS: Tests de ruteo a mock.

describe('security/auth.service (mock mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates login to mockLogin', async () => {
    const mockResponse = { accessToken: 'mock-jwt-token-1-123', accessTokenExpiresIn: 900 }
    mockLogin.mockResolvedValueOnce(mockResponse)

    const result = await authService.login({ correo: 'admin@bioactiva.pe', password: 'admin123!' })

    expect(mockLogin).toHaveBeenCalledWith({ correo: 'admin@bioactiva.pe', password: 'admin123!' })
    expect(result).toEqual(mockResponse)
  })

  it('delegates forgotPassword to mockForgotPassword', async () => {
    mockForgotPassword.mockResolvedValueOnce({ ok: true })

    const result = await authService.forgotPassword('admin@bioactiva.pe')

    expect(mockForgotPassword).toHaveBeenCalledWith('admin@bioactiva.pe')
    expect(result).toEqual({ ok: true })
  })

  it('delegates validateToken to mockValidateToken', async () => {
    mockValidateToken.mockResolvedValueOnce({ valid: true, correo: 'ad***@bioactiva.pe' })

    const result = await authService.validateToken('token-recuperacion-valido-123')

    expect(mockValidateToken).toHaveBeenCalledWith('token-recuperacion-valido-123')
    expect(result).toEqual({ valid: true, correo: 'ad***@bioactiva.pe' })
  })

  it('delegates resetPassword to mockResetPassword', async () => {
    mockResetPassword.mockResolvedValueOnce({ ok: true })

    const result = await authService.resetPassword('token-abc', 'NewPass123!', 'NewPass123!')

    expect(mockResetPassword).toHaveBeenCalledWith('token-abc', 'NewPass123!')
    expect(result).toEqual({ ok: true })
  })

  it('throws on refresh in mock mode', async () => {
    await expect(authService.refresh()).rejects.toThrow('No implementado en mock')
  })

  it('throws on getMe in mock mode', async () => {
    await expect(authService.getMe()).rejects.toThrow('No implementado en mock')
  })

  it('does not call API on logout (no-op)', async () => {
    await expect(authService.logout()).resolves.toBeUndefined()
  })
})
