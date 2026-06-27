import { act, renderHook, waitFor } from '@testing-library/react'

const mockGetUsuarios = jest.fn()
const mockEditar = jest.fn()
const mockCambiarPassword = jest.fn()
const mockCambiarRol = jest.fn()
const mockDeshabilitar = jest.fn()
const mockHabilitar = jest.fn()

jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: {
    getUsuarios: mockGetUsuarios,
    editar: mockEditar,
    cambiarPassword: mockCambiarPassword,
    cambiarRol: mockCambiarRol,
    deshabilitar: mockDeshabilitar,
    habilitar: mockHabilitar,
  },
}))

import { useUsuarios } from '@/hooks/usuarios/useUsuarios'

describe('usuarios/useUsuarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('cargar', () => {
    it('loads users list', async () => {
      const mockResponse = {
        usuarios: [{ id: 1, nombres: 'Admin' }],
        total: 1,
        activos: 1,
      }
      mockGetUsuarios.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useUsuarios())
      expect(result.current.usuarios).toEqual([])
      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        await result.current.cargar()
      })

      expect(result.current.usuarios).toEqual(mockResponse.usuarios)
      expect(result.current.total).toBe(1)
      expect(result.current.activos).toBe(1)
      expect(result.current.isLoading).toBe(false)
    })

    it('handles error when loading users', async () => {
      mockGetUsuarios.mockRejectedValueOnce(new Error('Error de red'))

      const { result } = renderHook(() => useUsuarios())

      await act(async () => {
        await result.current.cargar()
      })

      expect(result.current.error).toBe('Error de red')
      expect(result.current.isLoading).toBe(false)
    })

    it('uses fallback message for non-Error errors', async () => {
      mockGetUsuarios.mockRejectedValueOnce('raw string')

      const { result } = renderHook(() => useUsuarios())

      await act(async () => {
        await result.current.cargar()
      })

      expect(result.current.error).toBe('Error al cargar usuarios.')
    })
  })

  describe('cambiarRol', () => {
    it('changes role and reloads list', async () => {
      mockCambiarRol.mockResolvedValueOnce(undefined)
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [{ id: 1, rol: 'TRABAJADOR' }], total: 1, activos: 1 })

      const { result } = renderHook(() => useUsuarios())

      let success: boolean
      await act(async () => {
        success = await result.current.cambiarRol(1, 'TRABAJADOR' as any)
      })

      expect(success!).toBe(true)
      expect(mockCambiarRol).toHaveBeenCalledWith(1, 'TRABAJADOR')
      expect(result.current.successMessage).toBe('Rol actualizado correctamente.')
    })

    it('handles cambiarRol error', async () => {
      mockCambiarRol.mockRejectedValueOnce({ message: 'Error al cambiar rol' })

      const { result } = renderHook(() => useUsuarios())

      let success: boolean
      await act(async () => {
        success = await result.current.cambiarRol(1, 'TRABAJADOR' as any)
      })

      expect(success!).toBe(false)
      expect(result.current.error).toBe('Error al cambiar rol')
    })
  })

  describe('editar', () => {
    it('edits user and reloads list', async () => {
      mockGetUsuarios.mockResolvedValueOnce({
        usuarios: [{ id: 1, nombres: 'Updated' }],
        total: 1,
        activos: 1,
      })
      mockEditar.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useUsuarios())

      let success: boolean
      await act(async () => {
        success = await result.current.editar({ id: 1, nombres: 'Updated' })
      })

      expect(success!).toBe(true)
      expect(mockEditar).toHaveBeenCalledWith({ id: 1, nombres: 'Updated' })
      expect(result.current.successMessage).toBe('Usuario actualizado correctamente.')
    })

    it('handles edit error', async () => {
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [], total: 0, activos: 0 })
      mockEditar.mockRejectedValueOnce({ message: 'Error al editar' })

      const { result } = renderHook(() => useUsuarios())

      let success: boolean
      await act(async () => {
        success = await result.current.editar({ id: 1 })
      })

      expect(success!).toBe(false)
      expect(result.current.error).toBe('Error al editar')
    })
  })

  describe('cambiarPassword', () => {
    it('changes password successfully', async () => {
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [], total: 0, activos: 0 })
      mockCambiarPassword.mockResolvedValueOnce({ message: 'Contraseña actualizada' })

      const { result } = renderHook(() => useUsuarios())

      let success: boolean
      await act(async () => {
        success = await result.current.cambiarPassword({ id: 1, password: 'newPass123' })
      })

      expect(success!).toBe(true)
      expect(result.current.successMessage).toBe('Contraseña actualizada')
    })

    it('handles password change error', async () => {
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [], total: 0, activos: 0 })
      mockCambiarPassword.mockRejectedValueOnce('raw error')

      const { result } = renderHook(() => useUsuarios())

      let success: boolean
      await act(async () => {
        success = await result.current.cambiarPassword({ id: 1, password: 'x' })
      })

      expect(success!).toBe(false)
      expect(result.current.error).toBe('Error al cambiar contraseña.')
    })
  })

  describe('deshabilitar', () => {
    it('disables user and reloads', async () => {
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [], total: 0, activos: 0 })
      mockDeshabilitar.mockResolvedValueOnce({ ok: true })
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [{ id: 1, estado: 'inactivo' }], total: 1, activos: 0 })

      const { result } = renderHook(() => useUsuarios())

      await act(async () => {
        await result.current.deshabilitar(1)
      })

      expect(mockDeshabilitar).toHaveBeenCalledWith(1)
      expect(result.current.successMessage).toBe('Usuario deshabilitado.')
    })
  })

  describe('habilitar', () => {
    it('enables user and reloads', async () => {
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [], total: 0, activos: 0 })
      mockHabilitar.mockResolvedValueOnce({ ok: true })
      mockGetUsuarios.mockResolvedValueOnce({ usuarios: [{ id: 1, estado: 'activo' }], total: 1, activos: 1 })

      const { result } = renderHook(() => useUsuarios())

      await act(async () => {
        await result.current.habilitar(1)
      })

      expect(mockHabilitar).toHaveBeenCalledWith(1)
      expect(result.current.successMessage).toBe('Usuario habilitado.')
    })
  })

  describe('clearMessages', () => {
    it('clears error and success messages', () => {
      const { result } = renderHook(() => useUsuarios())

      act(() => {
        result.current.clearMessages()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.successMessage).toBeNull()
    })
  })
})
