import { useAuthStore } from '@/store/auth.store'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

/**
 * AuthStore
 * ---------
 * Responsable de:
 * - persistir la sesión autenticada
 * - limpiar credenciales y usuario activo
 * - resolver helpers por rol de usuario
 */
// STATUS: Implementación parcial (persistencia y helpers de sesión).

describe('security/auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
    localStorage.clear()
  })

  it('persists session data in localStorage and store state', () => {
    const usuario = {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      rol: RolUsuario.Administrador,
      estado: EstadoUsuario.Activo,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    }

    useAuthStore.getState().setSession('token-123', usuario)

    expect(useAuthStore.getState().token).toBe('token-123')
    expect(useAuthStore.getState().usuario).toEqual(usuario)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(localStorage.getItem('bioactiva_token')).toBe('token-123')
    expect(localStorage.getItem('bioactiva_user')).toBe(JSON.stringify(usuario))
  })

  it('clears session data from store and localStorage', () => {
    localStorage.setItem('bioactiva_token', 'token-123')
    localStorage.setItem('bioactiva_user', '{}')

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().usuario).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(localStorage.getItem('bioactiva_token')).toBeNull()
    expect(localStorage.getItem('bioactiva_user')).toBeNull()
  })

  it('detects role helpers correctly', () => {
    useAuthStore.setState({
      usuario: {
        id: 1,
        nombres: 'Maria',
        apellidos: 'Torres',
        correo: 'maria@bioactiva.pe',
        rol: RolUsuario.Trabajador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
      },
    })

    expect(useAuthStore.getState().isAdministrador()).toBe(false)
    expect(useAuthStore.getState().isWorker()).toBe(true)
  })
})
