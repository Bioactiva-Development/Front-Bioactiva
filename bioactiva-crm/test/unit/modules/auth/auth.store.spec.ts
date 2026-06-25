import { useAuthStore } from '@/store/auth.store'
import { TOKEN_KEY, USER_KEY } from '@/lib/constants/config'
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
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,
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

    expect(useAuthStore.getState().accessToken).toBe('token-123')
    expect(useAuthStore.getState().usuario).toEqual(usuario)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(localStorage.getItem('bioactiva_token')).toBe('token-123')
    expect(localStorage.getItem('bioactiva_user')).toBe(JSON.stringify(usuario))
  })

  it('clears session data from store and localStorage', () => {
    localStorage.setItem('bioactiva_token', 'token-123')
    localStorage.setItem('bioactiva_user', '{}')

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().accessToken).toBeNull()
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

  it('detects Administrador role correctly', () => {
    useAuthStore.setState({
      usuario: {
        id: 2,
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
      },
    })

    expect(useAuthStore.getState().isAdministrador()).toBe(true)
    expect(useAuthStore.getState().isWorker()).toBe(false)
  })

  it('updates token with updateToken', () => {
    useAuthStore.getState().setSession('old-token', {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      rol: RolUsuario.Administrador,
      estado: EstadoUsuario.Activo,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    })

    useAuthStore.getState().updateToken('new-token')

    expect(useAuthStore.getState().accessToken).toBe('new-token')
    expect(localStorage.getItem('bioactiva_token')).toBe('new-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('updates usuario with setUsuario', () => {
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
    const updated = { ...usuario, nombres: 'Carlos Updated' }
    useAuthStore.getState().setUsuario(updated)
    expect(useAuthStore.getState().usuario?.nombres).toBe('Carlos Updated')
    expect(localStorage.getItem('bioactiva_user')).toBe(JSON.stringify(updated))
  })

  it('sets loading state with setLoading', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)

    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('returns false for role helpers when usuario is null', () => {
    expect(useAuthStore.getState().isAdministrador()).toBe(false)
    expect(useAuthStore.getState().isWorker()).toBe(false)
  })

  it('tracks hydration state via _hasHydrated and _setHasHydrated', () => {
    expect(useAuthStore.getState()._hasHydrated).toBe(false)
    useAuthStore.getState()._setHasHydrated(true)
    expect(useAuthStore.getState()._hasHydrated).toBe(true)
  })

  it('sets tokenExpiresAt when expiresIn is provided to setSession', () => {
    const before = Date.now()
    useAuthStore.getState().setSession('token-123', {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      rol: RolUsuario.Administrador,
      estado: EstadoUsuario.Activo,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    }, 3600)

    expect(useAuthStore.getState().tokenExpiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000)
  })

  it('does not set tokenExpiresAt when expiresIn is not provided', () => {
    useAuthStore.getState().setSession('token-123', {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      rol: RolUsuario.Administrador,
      estado: EstadoUsuario.Activo,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    })

    expect(useAuthStore.getState().tokenExpiresAt).toBeNull()
  })

  it('updates tokenExpiresAt when updateToken receives expiresIn', () => {
    useAuthStore.getState().setSession('token-123', {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      correo: 'admin@bioactiva.pe',
      rol: RolUsuario.Administrador,
      estado: EstadoUsuario.Activo,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    })
    useAuthStore.getState().updateToken('new-token', 1800)

    expect(useAuthStore.getState().accessToken).toBe('new-token')
    expect(useAuthStore.getState().tokenExpiresAt).toBeGreaterThan(Date.now())
  })
})
