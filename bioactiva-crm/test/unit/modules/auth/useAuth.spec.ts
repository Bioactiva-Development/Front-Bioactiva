import { act, renderHook, waitFor } from '@testing-library/react'

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
import { ROUTES } from '@/lib/constants/routes'
import { COOKIE_TOKEN, COOKIE_ROL } from '@/lib/constants/config'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

const usuarioAdmin = {
  id: 1,
  nombres: 'Carlos',
  apellidos: 'Ramírez',
  correo: 'admin@bioactiva.pe',
  rol: RolUsuario.Administrador,
  estado: EstadoUsuario.Activo,
  created_at: '2025-01-01T08:00:00Z',
  updated_at: '2025-01-01T08:00:00Z',
}

describe('security/useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: null,
      accessToken: null,
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
    localStorage.clear()
    document.cookie = `${COOKIE_TOKEN}=; path=/; max-age=0`
    document.cookie = `${COOKIE_ROL}=; path=/; max-age=0`
  })

  it('logs in and stores the session', async () => {
    authServiceMock.login.mockResolvedValueOnce({
      accessToken: 'token-123',
      usuario: usuarioAdmin,
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
    }, undefined)
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('surfaces forgot password success message', async () => {
    authServiceMock.forgotPassword.mockResolvedValueOnce({ message: 'ok' })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.forgotPassword({ correo: 'admin@bioactiva.pe' })
    })

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('admin@bioactiva.pe', undefined)
    expect(result.current.success).toBe(
      'Si el correo está registrado, te enviamos un enlace de recuperación. Revisa tu bandeja y spam.'
    )
  })

  it('returns a fallback result when token validation fails', async () => {
    authServiceMock.validateToken.mockRejectedValueOnce({ message: 'invalid' })

    const { result } = renderHook(() => useAuth())

    const response = await act(async () => result.current.validateToken('bad-token'))

    expect(response).toEqual({ valid: false, message: 'invalid' })
  })

  it('returns valid result when token validation succeeds', async () => {
    authServiceMock.validateToken.mockResolvedValueOnce({
      valid: true,
      correo: 'ad***@bioactiva.pe',
    })

    const { result } = renderHook(() => useAuth())

    const response = await act(async () => result.current.validateToken('good-token'))

    expect(response).toEqual({ valid: true, correo: 'ad***@bioactiva.pe' })
  })

  it('logs out, clears session and redirects to login', async () => {
    useAuthStore.getState().setSession('token-123', usuarioAdmin)
    document.cookie = `${COOKIE_TOKEN}=token-123; path=/`
    document.cookie = `${COOKIE_ROL}=Administrador; path=/`

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.logout()
    })

    expect(authServiceMock.logout).toHaveBeenCalled()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().usuario).toBeNull()
    expect(pushMock).toHaveBeenCalledWith(ROUTES.auth.login)
  })

  it('resets password successfully and shows success message', async () => {
    authServiceMock.resetPassword.mockResolvedValueOnce({ ok: true })
    jest.useFakeTimers()

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.resetPassword('valid-token', {
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      })
    })

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith('valid-token', 'NewPass123!', 'NewPass123!')
    expect(result.current.success).toBe('Contraseña restablecida correctamente. Ya puede iniciar sesión.')

    act(() => { jest.advanceTimersByTime(2000) })
    expect(pushMock).toHaveBeenCalledWith(ROUTES.auth.login)

    jest.useRealTimers()
  })

  it('handles reset password error', async () => {
    authServiceMock.resetPassword.mockRejectedValueOnce({ message: 'Token inválido' })
    jest.useFakeTimers()

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.resetPassword('bad-token', {
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      })
    })

    expect(result.current.error).toBe('Token inválido')

    jest.useRealTimers()
  })

  it('exposes auth state from store', () => {
    useAuthStore.setState({
      usuario: usuarioAdmin,
      accessToken: 'token-123',
      isAuthenticated: true,
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.usuario).toEqual(usuarioAdmin)
    expect(result.current.isAdministrador()).toBe(true)
  })

  it('handles login failure', async () => {
    authServiceMock.login.mockRejectedValueOnce({ message: 'Correo o contraseña incorrectos' })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({
        correo: 'wrong@bioactiva.pe',
        password: 'bad-password',
      })
    })

    expect(result.current.error).toBe('Correo o contraseña incorrectos')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('handles forgot password failure', async () => {
    authServiceMock.forgotPassword.mockRejectedValueOnce({ message: 'Error de red' })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.forgotPassword({ correo: 'admin@bioactiva.pe' })
    })

    expect(result.current.error).toBe('Error de red')
  })

  it('maps a 401 on forgot password to a captcha verification message', async () => {
    authServiceMock.forgotPassword.mockRejectedValueOnce({ status: 401, message: 'Unauthorized' })

    const { result } = renderHook(() => useAuth())

    const enviado = await act(async () =>
      result.current.forgotPassword({ correo: 'admin@bioactiva.pe' })
    )

    expect(enviado).toBe(false)
    expect(result.current.error).toBe('Verificación fallida, reintenta el captcha.')
  })

  it('handles login error that is an Error instance', async () => {
    authServiceMock.login.mockRejectedValueOnce(new Error('Network failure'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({
        correo: 'admin@bioactiva.pe',
        password: 'Secret123!',
      })
    })

    expect(result.current.error).toBe('Network failure')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('uses fallback message when login error is a primitive', async () => {
    authServiceMock.login.mockRejectedValueOnce('raw string error')

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({
        correo: 'admin@bioactiva.pe',
        password: 'Secret123!',
      })
    })

    expect(result.current.error).toBe('Error al iniciar sesión. Intente nuevamente.')
  })
})