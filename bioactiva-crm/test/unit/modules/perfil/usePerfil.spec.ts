import { act, renderHook, waitFor } from '@testing-library/react'

const mockSetUsuario = jest.fn()
const mockGetEstado = jest.fn()
const mockGetMicrosoftAuthUrl = jest.fn()
const mockDisconnectMicrosoft = jest.fn()
const mockGetProfile = jest.fn()
const mockUpdateProfile = jest.fn()
const mockChangePassword = jest.fn()

const MOCK_USUARIO = {
  id: 1, nombres: 'Admin', apellidos: '', correo: 'admin@bioactiva.pe',
  rol: 'Administrador', estado: 'Activo', created_at: '', updated_at: '',
}

jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector?: (s: Record<string, unknown>) => unknown) =>
      typeof selector === 'function'
        ? selector({ usuario: MOCK_USUARIO, setUsuario: mockSetUsuario })
        : { usuario: MOCK_USUARIO, setUsuario: mockSetUsuario },
    { getState: () => ({ usuario: { id: 1 } }), setState: jest.fn() }
  ),
}))

jest.mock('@/services/modules/perfil.service', () => ({
  perfilService: {
    getProfile: () => mockGetProfile(),
    updateProfile: (data: unknown) => mockUpdateProfile(data),
    changePassword: (data: unknown) => mockChangePassword(data),
  },
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
    mockGetProfile.mockResolvedValue(MOCK_USUARIO)
    mockUpdateProfile.mockImplementation(async ({ nombres, apellidos }: { nombres: string; apellidos: string }) => ({
      ...MOCK_USUARIO, nombres, apellidos,
    }))
    mockChangePassword.mockResolvedValue(undefined)
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

  describe('actualizarPerfil', () => {
    it('sends nombres and apellidos separately via PATCH /profile', async () => {
      const { result } = renderHook(() => usePerfil())

      let success: boolean
      await act(async () => {
        success = await result.current.actualizarPerfil('Admin', 'User')
      })

      expect(success!).toBe(true)
      expect(mockUpdateProfile).toHaveBeenCalledWith({ nombres: 'Admin', apellidos: 'User' })
      expect(mockSetUsuario).toHaveBeenCalledWith(
        expect.objectContaining({ nombres: 'Admin', apellidos: 'User' }),
      )
      expect(result.current.successPerfil).toBe('Perfil actualizado correctamente.')
    })

    it('omits empty apellidos from the payload', async () => {
      const { result } = renderHook(() => usePerfil())

      await act(async () => {
        await result.current.actualizarPerfil('Admin', '')
      })

      expect(mockUpdateProfile).toHaveBeenCalledWith({ nombres: 'Admin' })
    })

    it('surfaces the backend message on failure', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('Ningún campo enviado'))

      const { result } = renderHook(() => usePerfil())

      let success: boolean
      await act(async () => {
        success = await result.current.actualizarPerfil('Admin', 'User')
      })

      expect(success!).toBe(false)
      expect(result.current.errorPerfil).toBe('Ningún campo enviado')
    })
  })

  describe('cambiarPassword', () => {
    it('sends current and new password to PATCH /profile/password', async () => {
      const { result } = renderHook(() => usePerfil())

      let success: boolean
      await act(async () => {
        success = await result.current.cambiarPassword('OldPass1!', 'NewPass12!')
      })

      expect(success!).toBe(true)
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass12!',
      })
      expect(result.current.successPassword).toBe('Contraseña actualizada correctamente.')
      expect(result.current.isLoadingPassword).toBe(false)
    })

    it('shows the backend error when the current password is wrong', async () => {
      mockChangePassword.mockRejectedValueOnce(new Error('La contraseña actual es incorrecta'))

      const { result } = renderHook(() => usePerfil())

      let success: boolean
      await act(async () => {
        success = await result.current.cambiarPassword('bad', 'NewPass12!')
      })

      expect(success!).toBe(false)
      expect(result.current.errorPassword).toBe('La contraseña actual es incorrecta')
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
      mockGetMicrosoftAuthUrl.mockResolvedValueOnce({ url: 'https://login.microsoftonline.com/auth' })

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
