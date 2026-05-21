import { act, renderHook, waitFor } from '@testing-library/react'

/**
 * useAuth
 * -------
 * Responsable de:
 * - orquestar login y logout
 * - manejar recuperación y validación de tokens
 * - coordinar activación y reseteo de contraseña
 */
// STATUS: Implementación parcial (flujos principales de autenticación).

const pushMock = jest.fn()
const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}))

const authServiceMock = {
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  validateToken: jest.fn(),
  resetPassword: jest.fn(),
  activateAccount: jest.fn(),
}

jest.mock('@/services/modules/auth.service', () => ({
  authService: authServiceMock,
}))

import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/auth/useAuth'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

describe('security/useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
    authServiceMock.login.mockReset()
    authServiceMock.logout.mockReset()
    authServiceMock.forgotPassword.mockReset()
    authServiceMock.validateToken.mockReset()
    authServiceMock.resetPassword.mockReset()
    authServiceMock.activateAccount.mockReset()
    pushMock.mockReset()
    replaceMock.mockReset()
  })

  it('logs in and stores the session', async () => {
    authServiceMock.login.mockResolvedValueOnce({
      token: 'token-123',
      usuario: {
        id: 1,
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
      },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({
        correo: 'admin@bioactiva.pe',
        password: 'Secret123!',
      })
    })

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    expect(authServiceMock.login).toHaveBeenCalledWith({
      correo: 'admin@bioactiva.pe',
      password: 'Secret123!',
    })
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('surfaces forgot password success message', async () => {
    authServiceMock.forgotPassword.mockResolvedValueOnce({ message: 'ok' })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.forgotPassword({ correo: 'admin@bioactiva.pe' })
    })

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('admin@bioactiva.pe')
    expect(result.current.success).toBe('Correo de recuperación enviado correctamente.')
  })

  it('returns a fallback result when token validation fails', async () => {
    authServiceMock.validateToken.mockRejectedValueOnce({ message: 'invalid' })

    const { result } = renderHook(() => useAuth())

    const response = await act(async () => result.current.validateToken('bad-token'))

    expect(response).toEqual({ valid: false })
    expect(result.current.error).toBe('invalid')
  })
})
