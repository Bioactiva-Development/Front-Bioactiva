import { RolUsuario, EstadoUsuario } from '@/types/enums'
import { UsuarioRaw, UserResponseDto } from '@/types/auth.types'
import { mapRole, mapEstado, mapUsuarioRaw, mapPerfilUsuario, usuarioFromAccessToken } from '@/lib/utils/auth.mappers'

jest.mock('@/lib/utils/jwt.utils', () => ({
  decodeJwt: jest.fn(),
  subToNumber: jest.fn(),
}))

import { decodeJwt, subToNumber } from '@/lib/utils/jwt.utils'

describe('security/auth.mappers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('mapRole', () => {
    it('maps 0 to Administrador', () => {
      expect(mapRole(0)).toBe(RolUsuario.Administrador)
    })

    it('maps 1 to Trabajador', () => {
      expect(mapRole(1)).toBe(RolUsuario.Trabajador)
    })

    it('maps any other number to Trabajador', () => {
      expect(mapRole(42)).toBe(RolUsuario.Trabajador)
      expect(mapRole(-1)).toBe(RolUsuario.Trabajador)
    })
  })

  describe('mapEstado', () => {
    it('maps 1 to Activo', () => {
      expect(mapEstado(1)).toBe(EstadoUsuario.Activo)
    })

    it('maps 2 to Inactivo', () => {
      expect(mapEstado(2)).toBe(EstadoUsuario.Inactivo)
    })

    it('maps 0 to Pendiente', () => {
      expect(mapEstado(0)).toBe(EstadoUsuario.Pendiente)
    })

    it('maps any other number to Pendiente', () => {
      expect(mapEstado(99)).toBe(EstadoUsuario.Pendiente)
      expect(mapEstado(-5)).toBe(EstadoUsuario.Pendiente)
    })
  })

  describe('mapUsuarioRaw', () => {
    it('maps a raw backend user to Usuario', () => {
      const raw: UsuarioRaw = {
        id: 1,
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        correo: 'carlos@bioactiva.pe',
        password: 'hashed-secret',
        role: 0,
        estado: 1,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
      }

      const result = mapUsuarioRaw(raw)

      expect(result).toEqual({
        id: 1,
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        correo: 'carlos@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
      })
    })

    it('maps a Trabajador Inactivo user correctly', () => {
      const raw: UsuarioRaw = {
        id: 2,
        nombres: 'Maria',
        apellidos: 'Torres',
        correo: 'maria@bioactiva.pe',
        password: 'hashed',
        role: 1,
        estado: 2,
        created_at: '2025-02-01T08:00:00Z',
        updated_at: '2025-02-01T08:00:00Z',
      }

      const result = mapUsuarioRaw(raw)

      expect(result.rol).toBe(RolUsuario.Trabajador)
      expect(result.estado).toBe(EstadoUsuario.Inactivo)
    })
  })

  describe('mapPerfilUsuario', () => {
    it('maps a UserResponseDto with string rol/estado (Mantis #333)', () => {
      const raw: UserResponseDto = {
        id: 7,
        nombres: 'Ana',
        apellidos: 'Lopez',
        correo: 'ana@bioactiva.pe',
        rol: 'ADMINISTRADOR',
        estado: 'ACTIVO',
        fechaRegistro: '2025-03-01T08:00:00Z',
      }

      expect(mapPerfilUsuario(raw)).toEqual({
        id: 7,
        nombres: 'Ana',
        apellidos: 'Lopez',
        correo: 'ana@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-03-01T08:00:00Z',
        updated_at: '2025-03-01T08:00:00Z',
      })
    })

    it('maps TRABAJADOR / PENDIENTE correctly', () => {
      const result = mapPerfilUsuario({
        id: 8, nombres: 'Beto', apellidos: 'Diaz', correo: 'beto@bioactiva.pe',
        rol: 'TRABAJADOR', estado: 'PENDIENTE', fechaRegistro: '2025-04-01T08:00:00Z',
      })

      expect(result.rol).toBe(RolUsuario.Trabajador)
      expect(result.estado).toBe(EstadoUsuario.Pendiente)
    })
  })

  describe('usuarioFromAccessToken', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-06-01T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('builds Usuario from a valid JWT payload', () => {
      ;(decodeJwt as jest.Mock).mockReturnValue({
        sub: 5,
        nombres: 'Pedro',
        apellidos: 'Garcia',
        correo: 'pedro@bioactiva.pe',
        role: 1,
        estado: 1,
      })
      ;(subToNumber as jest.Mock).mockReturnValue(5)

      const result = usuarioFromAccessToken('some-token', 'fallback@bioactiva.pe')

      expect(result).toEqual({
        id: 5,
        nombres: 'Pedro',
        apellidos: 'Garcia',
        correo: 'pedro@bioactiva.pe',
        rol: RolUsuario.Trabajador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-06-01T12:00:00.000Z',
        updated_at: '2025-06-01T12:00:00.000Z',
      })
    })

    it('falls back to defaults when JWT payload is null', () => {
      ;(decodeJwt as jest.Mock).mockReturnValue(null)
      ;(subToNumber as jest.Mock).mockReturnValue(NaN)

      const result = usuarioFromAccessToken('bad-token', 'fallback@bioactiva.pe')

      expect(result.id).toBe(0)
      expect(result.nombres).toBe('Usuario')
      expect(result.apellidos).toBe('')
      expect(result.correo).toBe('fallback@bioactiva.pe')
      expect(result.rol).toBe(RolUsuario.Trabajador)
      expect(result.estado).toBe(EstadoUsuario.Activo)
    })

    it('uses fallbackCorreo when JWT has no correo', () => {
      ;(decodeJwt as jest.Mock).mockReturnValue({
        sub: 10, role: 0,
      })
      ;(subToNumber as jest.Mock).mockReturnValue(10)

      const result = usuarioFromAccessToken('some-token', 'admin@bioactiva.pe')

      expect(result.correo).toBe('admin@bioactiva.pe')
    })
  })
})
