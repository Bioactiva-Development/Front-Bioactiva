import {
  mockGetUsuarios,
  mockEditarUsuario,
  mockCambiarPassword,
  mockDeshabilitarUsuario,
  mockHabilitarUsuario,
  mockListInvitaciones,
  mockCreateInvitacion,
  mockRevokeInvitacion,
  mockGetInvitacionInfo,
  mockAcceptInvitacion,
} from '@/services/mock/usuarios.mock'
import { RolUsuario, EstadoUsuario, EstadoToken } from '@/types/enums'

describe('usuarios/usuarios.mock (implementation)', () => {
  describe('mockGetUsuarios', () => {
    it('returns all users', () => {
      const result = mockGetUsuarios()

      expect(result.usuarios.length).toBeGreaterThan(0)
      expect(result.activos).toBeGreaterThan(0)
    })

    it('filters by search term', () => {
      const result = mockGetUsuarios({ search: 'Karien' })

      expect(result.usuarios.every(u => u.nombres.includes('Karien'))).toBe(true)
    })

    it('filters by rol', () => {
      const result = mockGetUsuarios({ rol: RolUsuario.Administrador })

      expect(result.usuarios.every(u => u.rol === RolUsuario.Administrador)).toBe(true)
    })

    it('filters by estado', () => {
      const result = mockGetUsuarios({ estado: EstadoUsuario.Activo })

      expect(result.usuarios.every(u => u.estado === EstadoUsuario.Activo)).toBe(true)
    })
  })

  describe('mockEditarUsuario', () => {
    it('edits an existing user', () => {
      const result = mockEditarUsuario({
        id: 1,
        nombre_completo: 'Admin Actualizado',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
      })

      expect(result.nombres).toBe('Admin')
      expect(result.apellidos).toBe('Actualizado')
    })

    it('throws for unknown user', () => {
      expect(() =>
        mockEditarUsuario({
          id: 999,
          nombre_completo: 'Ghost',
          correo: 'ghost@test.com',
          rol: RolUsuario.Trabajador,
        }),
      ).toThrow('Usuario no encontrado')
    })
  })

  describe('mockCambiarPassword', () => {
    it('returns success message', () => {
      const result = mockCambiarPassword({ id: 1, password: 'newPass1!' })
      expect(result.message).toContain('actualizada')
    })
  })

  describe('mockDeshabilitarUsuario', () => {
    it('disables an existing user', () => {
      const result = mockDeshabilitarUsuario(1)

      expect(result.estado).toBe(EstadoUsuario.Inactivo)
    })

    it('throws for unknown user', () => {
      expect(() => mockDeshabilitarUsuario(999)).toThrow('Usuario no encontrado')
    })
  })

  describe('mockHabilitarUsuario', () => {
    it('enables an existing user', () => {
      const result = mockHabilitarUsuario(3)

      expect(result.estado).toBe(EstadoUsuario.Activo)
    })

    it('throws for unknown user', () => {
      expect(() => mockHabilitarUsuario(999)).toThrow('Usuario no encontrado')
    })
  })

  describe('mockListInvitaciones', () => {
    it('returns all invitations', async () => {
      const result = await mockListInvitaciones()

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.total).toBeGreaterThan(0)
    })

    it('filters by term', async () => {
      const result = await mockListInvitaciones({ term: 'nuevo' })

      expect(result.data.every(i => i.correo.includes('nuevo'))).toBe(true)
    })

    it('filters by estado 0 (Pendiente)', async () => {
      const result = await mockListInvitaciones({ estado: 0 })

      expect(result.data.every(i => i.estado === EstadoToken.Pendiente)).toBe(true)
    })

    it('returns all when estado filter is unknown', async () => {
      const result = await mockListInvitaciones({ estado: 999 })

      expect(result.data.length).toBeGreaterThan(0)
    })
  })

  describe('mockCreateInvitacion', () => {
    it('creates a new invitation', async () => {
      const result = await mockCreateInvitacion('otro@bioactiva.pe', 2)

      expect(result.correo).toBe('otro@bioactiva.pe')
      expect(result.rol).toBe(RolUsuario.Trabajador)
      expect(result.estado).toBe(EstadoToken.Pendiente)
    })

    it('creates admin invitation with rol 1', async () => {
      const result = await mockCreateInvitacion('admin2@bioactiva.pe', 1)

      expect(result.rol).toBe(RolUsuario.Administrador)
    })

    it('fallbacks to Trabajador when rol is unknown', async () => {
      const result = await mockCreateInvitacion('rol-desconocido@bioactiva.pe', 999)

      expect(result.rol).toBe(RolUsuario.Trabajador)
    })

    it('throws for duplicate pending invitation', async () => {
      await expect(
        mockCreateInvitacion('nuevo1@bioactiva.pe', 2),
      ).rejects.toMatchObject({ status: 400 })
    })
  })

  describe('mockRevokeInvitacion', () => {
    it('revokes an existing invitation', async () => {
      const result = await mockRevokeInvitacion(1)

      expect(result.estado).toBe(EstadoToken.Expirado)
    })

    it('throws for unknown invitation', async () => {
      await expect(mockRevokeInvitacion(999)).rejects.toMatchObject({ status: 400 })
    })
  })

  describe('mockGetInvitacionInfo', () => {
    it('returns info for valid token', async () => {
      const result = await mockGetInvitacionInfo('mock-invitation-token-valido')

      expect(result.expired).toBe(false)
      expect(result.accepted).toBe(false)
    })

    it('throws for invalid token', async () => {
      await expect(
        mockGetInvitacionInfo('token-invalido'),
      ).rejects.toMatchObject({ status: 400 })
    })
  })

  describe('mockAcceptInvitacion', () => {
    it('returns access token', async () => {
      const result = await mockAcceptInvitacion()

      expect(result.accessToken).toBeDefined()
      expect(result.accessTokenExpiresIn).toBe(900)
    })
  })
})
