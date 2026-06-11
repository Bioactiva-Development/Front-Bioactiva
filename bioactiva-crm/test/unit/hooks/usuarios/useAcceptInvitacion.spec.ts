import { act, renderHook, waitFor } from '@testing-library/react'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const mockGetInvitacionInfo = jest.fn()
const mockAcceptInvitacion = jest.fn()
const mockGetMe = jest.fn()

jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: {
    getInvitacionInfo: mockGetInvitacionInfo,
    acceptInvitacion: mockAcceptInvitacion,
  },
}))

jest.mock('@/services/modules/auth.service', () => ({
  authService: { getMe: mockGetMe },
}))

const mockSetSession = jest.fn()
jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    () => ({}),
    { getState: () => ({ setSession: mockSetSession }) },
  ),
}))

jest.mock('@/lib/utils/auth.mappers', () => ({
  usuarioFromAccessToken: () => ({ id: 99, rol: 'Administrador' }),
}))

jest.mock('@/lib/constants/config', () => ({
  TOKEN_KEY: 'bioactiva_token',
  COOKIE_TOKEN: 'bioactiva_token',
  COOKIE_ROL: 'bioactiva_rol',
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { auth: { login: '/login' }, dashboard: '/dashboard' },
}))

import { useAcceptInvitacion } from '@/hooks/usuarios/useAcceptInvitacion'

describe('usuarios/useAcceptInvitacion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getInfo', () => {
    it('fetches invitation info by token', async () => {
      const mockInfo = { correo: 'user@test.com', nombre: 'User' }
      mockGetInvitacionInfo.mockResolvedValueOnce(mockInfo)

      const { result } = renderHook(() => useAcceptInvitacion())

      let info: any
      await act(async () => {
        info = await result.current.getInfo('valid-token')
      })

      expect(info).toEqual(mockInfo)
      expect(mockGetInvitacionInfo).toHaveBeenCalledWith('valid-token')
    })

    it('handles error when fetching info', async () => {
      mockGetInvitacionInfo.mockRejectedValueOnce({ message: 'Enlace inválido' })

      const { result } = renderHook(() => useAcceptInvitacion())

      let info: any
      await act(async () => {
        info = await result.current.getInfo('bad-token')
      })

      expect(info).toBeNull()
      expect(result.current.error).toBe('Enlace inválido')
    })

    it('uses fallback message when error has no message', async () => {
      mockGetInvitacionInfo.mockRejectedValueOnce('string error')

      const { result } = renderHook(() => useAcceptInvitacion())

      await act(async () => {
        await result.current.getInfo('bad-token')
      })

      expect(result.current.error).toBe('No se pudo validar el enlace de invitación.')
    })
  })

  describe('accept', () => {
    it('accepts invitation, stores session and redirects', async () => {
      mockAcceptInvitacion.mockResolvedValueOnce({ accessToken: 'new-token' })
      mockGetMe.mockResolvedValueOnce({ id: 1, rol: 'Administrador', nombres: 'Carlos' })

      const { result } = renderHook(() => useAcceptInvitacion())

      await act(async () => {
        await result.current.accept('token-123', {
          nombres: 'Carlos',
          apellidos: 'Ramírez',
          password: 'Secret123!',
          confirmarPassword: 'Secret123!',
        })
      })

      expect(mockAcceptInvitacion).toHaveBeenCalledWith({
        token: 'token-123',
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        password: 'Secret123!',
        confirmarPassword: 'Secret123!',
      })
      expect(localStorage.getItem('bioactiva_token')).toBe('new-token')
      expect(mockSetSession).toHaveBeenCalledWith('new-token', { id: 1, rol: 'Administrador', nombres: 'Carlos' })
      expect(result.current.success).toBe('Cuenta activada correctamente. Redirigiendo al dashboard...')
    })

    it('falls back to usuarioFromAccessToken when getMe fails', async () => {
      mockAcceptInvitacion.mockResolvedValueOnce({ accessToken: 'new-token' })
      mockGetMe.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAcceptInvitacion())

      await act(async () => {
        await result.current.accept('token-123', {
          nombres: 'Test',
          apellidos: 'User',
          password: 'Secret123!',
          confirmarPassword: 'Secret123!',
        })
      })

      expect(mockSetSession).toHaveBeenCalledWith('new-token', { id: 99, rol: 'Administrador' })
    })

    it('handles accept error', async () => {
      mockAcceptInvitacion.mockRejectedValueOnce({ message: 'Token expirado' })

      const { result } = renderHook(() => useAcceptInvitacion())

      await act(async () => {
        await result.current.accept('bad-token', {} as any)
      })

      expect(result.current.error).toBe('Token expirado')
    })

    it('redirects to dashboard after accepting', async () => {
      mockAcceptInvitacion.mockResolvedValueOnce({ accessToken: 'new-token' })
      mockGetMe.mockResolvedValueOnce({ id: 1, rol: 'Admin' })

      const { result } = renderHook(() => useAcceptInvitacion())

      await act(async () => {
        await result.current.accept('token-123', {
          nombres: 'Carlos',
          apellidos: 'Ramírez',
          password: 'Secret123!',
          confirmarPassword: 'Secret123!',
        })
      })

      expect(pushMock).not.toHaveBeenCalled()
      act(() => { jest.advanceTimersByTime(1500) })
      expect(pushMock).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('resetMessages', () => {
    it('clears error and success messages', async () => {
      const { result } = renderHook(() => useAcceptInvitacion())

      act(() => {
        result.current.resetMessages()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.success).toBeNull()
    })
  })
})
