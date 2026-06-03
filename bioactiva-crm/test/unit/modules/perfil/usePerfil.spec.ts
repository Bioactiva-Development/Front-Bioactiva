import { act, renderHook, waitFor } from '@testing-library/react'

const mockSetSession = jest.fn()
const mockGetEstado = jest.fn()
const mockGetMicrosoftAuthUrl = jest.fn()
const mockDisconnectMicrosoft = jest.fn()

jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector?: (s: Record<string, unknown>) => unknown) =>
      typeof selector === 'function'
        ? selector({
            usuario: { id: 1, nombres: 'Admin', apellidos: '', correo: 'admin@bioactiva.pe', rol: 'Administrador', estado: 'Activo' },
            accessToken: 'mock-token',
            setSession: mockSetSession,
          })
        : {
            usuario: { id: 1, nombres: 'Admin', apellidos: '', correo: 'admin@bioactiva.pe', rol: 'Administrador', estado: 'Activo' },
            accessToken: 'mock-token',
            setSession: mockSetSession,
          },
    { getState: () => ({ usuario: { id: 1 } }), setState: jest.fn() }
  ),
}))

jest.mock('@/services/modules/integraciones.service', () => ({
  integracionesService: {
    getEstado: mockGetEstado,
    getMicrosoftAuthUrl: mockGetMicrosoftAuthUrl,
    disconnectMicrosoft: mockDisconnectMicrosoft,
  },
}))

import { usePerfil } from '@/hooks/perfil/usePerfil'

const defaultIntegraciones = {
  teams: { tipo: 'microsoft_teams' as const, conectado: false },
  outlook: { tipo: 'microsoft_outlook' as const, conectado: false },
}

describe('perfil/usePerfil', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetEstado.mockResolvedValue(defaultIntegraciones)
  })

  it('loads integraciones on mount', async () => {
    const { result } = renderHook(() => usePerfil())

    await waitFor(() => {
      expect(result.current.integraciones).toEqual(defaultIntegraciones)
    })
    expect(mockGetEstado).toHaveBeenCalled()
  })

  it('falls back to default integraciones on error', async () => {
    mockGetEstado.mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => usePerfil())

    await waitFor(() => {
      expect(result.current.integraciones).toEqual({
        teams: { tipo: 'microsoft_teams', conectado: false },
        outlook: { tipo: 'microsoft_outlook', conectado: false },
      })
    })
  })

  describe('actualizarNombre', () => {
    it('updates name and sets success message', async () => {
      jest.useFakeTimers()

      const { result } = renderHook(() => usePerfil())

      let success: boolean
      await act(async () => {
        success = await result.current.actualizarNombre('Admin User')
      })

      expect(success!).toBe(true)
      expect(mockSetSession).toHaveBeenCalledWith(
        'mock-token',
        expect.objectContaining({ nombres: 'Admin', apellidos: 'User' }),
      )
      expect(result.current.successPerfil).toBe('Perfil actualizado correctamente.')

      act(() => { jest.advanceTimersByTime(3000) })
      expect(result.current.successPerfil).toBeNull()

      jest.useRealTimers()
    })
  })

  describe('cambiarPassword', () => {
    it('sets success message after delay', async () => {
      jest.useFakeTimers()

      const { result } = renderHook(() => usePerfil())

      let success: boolean | undefined
      let promise: Promise<boolean | undefined>

      act(() => {
        promise = result.current.cambiarPassword('NewPass1!')
      })

      act(() => { jest.advanceTimersByTime(600) })

      await act(async () => {
        success = await promise!
      })

      expect(success!).toBe(true)
      expect(result.current.successPassword).toBe('Contraseña actualizada correctamente.')
      expect(result.current.isLoadingPassword).toBe(false)

      jest.useRealTimers()
    })
  })

  describe('conectarMicrosoft', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    it('redirects to Microsoft auth URL', async () => {
      mockGetMicrosoftAuthUrl.mockResolvedValueOnce({ authUrl: 'https://login.microsoftonline.com/auth' })

      const { result } = renderHook(() => usePerfil())

      await act(async () => {
        await result.current.conectarMicrosoft()
      })

      expect(mockGetMicrosoftAuthUrl).toHaveBeenCalled()
    })

    it('sets error message on failure', async () => {
      jest.useFakeTimers()
      mockGetMicrosoftAuthUrl.mockRejectedValueOnce({ message: 'Error de conexión' })

      const { result } = renderHook(() => usePerfil())

      await act(async () => {
        await result.current.conectarMicrosoft()
      })

      expect(result.current.integracionInfo).toBe('Error de conexión')

      act(() => { jest.advanceTimersByTime(5000) })
      expect(result.current.integracionInfo).toBeNull()

      jest.useRealTimers()
    })
  })

  describe('desconectarMicrosoft', () => {
    it('updates integraciones state after disconnect', async () => {
      mockDisconnectMicrosoft.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => usePerfil())

      await waitFor(() => {
        expect(result.current.integraciones).toEqual(defaultIntegraciones)
      })

      await act(async () => {
        await result.current.desconectarMicrosoft()
      })

      expect(result.current.integraciones!.teams.conectado).toBe(false)
      expect(result.current.integraciones!.outlook.conectado).toBe(false)
    })

    it('sets error on disconnect failure', async () => {
      jest.useFakeTimers()
      mockDisconnectMicrosoft.mockRejectedValueOnce(new Error('Error al desconectar.'))

      const { result } = renderHook(() => usePerfil())

      await waitFor(() => {
        expect(result.current.integraciones).toEqual(defaultIntegraciones)
      })

      await act(async () => {
        await result.current.desconectarMicrosoft()
      })

      expect(result.current.integracionInfo).toBe('Error al desconectar.')
    })
  })
})
