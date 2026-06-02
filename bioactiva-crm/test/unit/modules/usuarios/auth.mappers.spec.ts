import { mapRole, mapEstado, mapUsuarioRaw } from '@/lib/utils/auth.mappers'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

describe('usuarios/auth.mappers', () => {
  describe('mapRole', () => {
    it('maps 0 to Administrador', () => {
      expect(mapRole(0)).toBe(RolUsuario.Administrador)
    })

    it('maps 1 to Trabajador', () => {
      expect(mapRole(1)).toBe(RolUsuario.Trabajador)
    })

    it('maps any other number to Trabajador', () => {
      expect(mapRole(2)).toBe(RolUsuario.Trabajador)
      expect(mapRole(-1)).toBe(RolUsuario.Trabajador)
      expect(mapRole(99)).toBe(RolUsuario.Trabajador)
    })
  })

  describe('mapEstado', () => {
    it('maps 1 to Activo', () => {
      expect(mapEstado(1)).toBe(EstadoUsuario.Activo)
    })

    it('maps 2 to Inactivo', () => {
      expect(mapEstado(2)).toBe(EstadoUsuario.Inactivo)
    })

    it('maps anything else to Pendiente', () => {
      expect(mapEstado(0)).toBe(EstadoUsuario.Pendiente)
      expect(mapEstado(3)).toBe(EstadoUsuario.Pendiente)
      expect(mapEstado(-1)).toBe(EstadoUsuario.Pendiente)
    })
  })

  describe('mapUsuarioRaw', () => {
    it('maps raw user to domain user', () => {
      const result = mapUsuarioRaw({
        id: 1,
        nombres: 'Admin',
        apellidos: 'User',
        correo: 'admin@bioactiva.pe',
        password: 'hashed',
        role: 0,
        estado: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      })

      expect(result).toEqual({
        id: 1,
        nombres: 'Admin',
        apellidos: 'User',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      })
    })

    it('maps role and estado correctly', () => {
      const result = mapUsuarioRaw({
        id: 2,
        nombres: 'Worker',
        apellidos: '',
        correo: 'worker@bioactiva.pe',
        password: 'h',
        role: 1,
        estado: 2,
        created_at: '',
        updated_at: '',
      })

      expect(result.rol).toBe(RolUsuario.Trabajador)
      expect(result.estado).toBe(EstadoUsuario.Inactivo)
    })
  })
})
