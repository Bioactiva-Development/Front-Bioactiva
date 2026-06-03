jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: false,
}))

const getMock = jest.fn()
const postMock = jest.fn()
const putMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: putMock,
    patch: patchMock,
    delete: deleteMock,
  },
}))

import { usuariosService } from '@/services/modules/usuarios.service'
import { RolUsuario, EstadoUsuario, EstadoToken } from '@/types/enums'

describe('usuarios/usuarios.service (API mode)', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    putMock.mockReset()
    patchMock.mockReset()
    deleteMock.mockReset()
  })

  describe('getUsuarios', () => {
    const rawUser = {
      id: 1,
      nombres: 'Admin',
      apellidos: '',
      correo: 'admin@bioactiva.pe',
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
      ultimo_acceso: 'Hace 11 min',
      fechaRegistro: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    }

    it('fetches and normalizes users from flat array response', async () => {
      getMock.mockResolvedValueOnce({ data: [rawUser] })

      const result = await usuariosService.getUsuarios()

      expect(getMock).toHaveBeenCalledWith('/users', { params: {} })
      expect(result.usuarios).toHaveLength(1)
      expect(result.usuarios[0].rol).toBe(RolUsuario.Administrador)
      expect(result.usuarios[0].estado).toBe(EstadoUsuario.Activo)
      expect(result.usuarios[0].ultimo_acceso).toBe('Hace 11 min')
    })

    it('handles { data: [...], meta: { total } } response shape', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [rawUser], meta: { total: 1 } },
      })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('handles { usuarios: [...] } response shape', async () => {
      getMock.mockResolvedValueOnce({
        data: { usuarios: [rawUser] },
      })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios).toHaveLength(1)
    })

    it('builds query params from filters', async () => {
      getMock.mockResolvedValueOnce({ data: [] })

      await usuariosService.getUsuarios({
        search: 'admin',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        page: 1,
        limit: 10,
      })

      expect(getMock).toHaveBeenCalledWith('/users', {
        params: { search: 'admin', role: 'ADMINISTRADOR', estado: 'ACTIVO', page: 1, limit: 10 },
      })
    })

    it('maps numeric role 0 → Administrador', async () => {
      getMock.mockResolvedValueOnce({ data: [{ ...rawUser, rol: 0 }] })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios[0].rol).toBe(RolUsuario.Administrador)
    })

    it('maps numeric role 1 → Trabajador', async () => {
      getMock.mockResolvedValueOnce({ data: [{ ...rawUser, rol: 1 }] })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios[0].rol).toBe(RolUsuario.Trabajador)
    })

    it('maps numeric estado 1 → Activo', async () => {
      getMock.mockResolvedValueOnce({ data: [{ ...rawUser, estado: 1 }] })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios[0].estado).toBe(EstadoUsuario.Activo)
    })

    it('maps numeric estado 2 → Inactivo', async () => {
      getMock.mockResolvedValueOnce({ data: [{ ...rawUser, estado: 2 }] })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios[0].estado).toBe(EstadoUsuario.Inactivo)
    })

    it('counts active users', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { ...rawUser, id: 1, estado: 'ACTIVO' },
          { ...rawUser, id: 2, estado: 'SUSPENDIDO' },
          { ...rawUser, id: 3, estado: 'ACTIVO' },
        ],
      })

      const result = await usuariosService.getUsuarios()

      expect(result.activos).toBe(2)
    })

    it('maps SUSPENDIDO to Inactivo and INACTIVO to Inactivo', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { ...rawUser, id: 1, estado: 'SUSPENDIDO' },
          { ...rawUser, id: 2, estado: 'INACTIVO' },
        ],
      })

      const result = await usuariosService.getUsuarios()

      expect(result.usuarios[0].estado).toBe(EstadoUsuario.Inactivo)
      expect(result.usuarios[1].estado).toBe(EstadoUsuario.Inactivo)
    })
  })

  describe('editar', () => {
    it('PUTs to correct endpoint', async () => {
      putMock.mockResolvedValueOnce({ data: { id: 1 } })

      const result = await usuariosService.editar({
        id: 1,
        nombre_completo: 'Admin User',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
      })

      expect(putMock).toHaveBeenCalledWith('/users/1', {
        id: 1,
        nombre_completo: 'Admin User',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
      })
      expect(result.id).toBe(1)
    })
  })

  describe('cambiarPassword', () => {
    it('PATCHes to correct endpoint', async () => {
      patchMock.mockResolvedValueOnce({ data: { message: 'Contraseña actualizada correctamente.' } })

      const result = await usuariosService.cambiarPassword({ id: 1, password: 'newPass1!' })

      expect(patchMock).toHaveBeenCalledWith('/users/1/password', { password: 'newPass1!' })
      expect(result.message).toBe('Contraseña actualizada correctamente.')
    })
  })

  describe('deshabilitar', () => {
    it('PATCHes to disable endpoint and returns void', async () => {
      patchMock.mockResolvedValueOnce({ data: undefined })

      await usuariosService.deshabilitar(1)

      expect(patchMock).toHaveBeenCalledWith('/users/1/disable')
    })
  })

  describe('habilitar', () => {
    it('PATCHes to enable endpoint and returns void', async () => {
      patchMock.mockResolvedValueOnce({ data: undefined })

      await usuariosService.habilitar(1)

      expect(patchMock).toHaveBeenCalledWith('/users/1/enable')
    })
  })

  describe('listInvitaciones', () => {
    const rawInvitacion = {
      id: 1,
      correo: 'nuevo@bioactiva.pe',
      rol: 2,
      estado: 0,
      expired_at: '2025-06-03T00:00:00Z',
      consumed_at: null,
      created_at: '2025-05-27T00:00:00Z',
    }

    it('fetches and normalizes invitations from flat array', async () => {
      getMock.mockResolvedValueOnce({ data: [rawInvitacion] })

      const result = await usuariosService.listInvitaciones()

      expect(getMock).toHaveBeenCalledWith('/invitations', { params: undefined })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].rol).toBe(RolUsuario.Trabajador)
      expect(result.data[0].estado).toBe(EstadoToken.Pendiente)
    })

    it('handles { data: [...], total, page, limit } response', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [rawInvitacion], total: 1, page: 1, limit: 10 },
      })

      const result = await usuariosService.listInvitaciones()

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
    })

    it('passes params to the endpoint', async () => {
      getMock.mockResolvedValueOnce({ data: [] })

      await usuariosService.listInvitaciones({ page: 2, limit: 5, term: 'nuevo', estado: 0 })

      expect(getMock).toHaveBeenCalledWith('/invitations', {
        params: { page: 2, limit: 5, term: 'nuevo', estado: 0 },
      })
    })

    it('maps estado 0→Pendiente, 1→Consumido, 2→Expirado', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { ...rawInvitacion, id: 1, estado: 0 },
          { ...rawInvitacion, id: 2, estado: 1 },
          { ...rawInvitacion, id: 3, estado: 2 },
        ],
      })

      const result = await usuariosService.listInvitaciones()

      expect(result.data[0].estado).toBe(EstadoToken.Pendiente)
      expect(result.data[1].estado).toBe(EstadoToken.Consumido)
      expect(result.data[2].estado).toBe(EstadoToken.Expirado)
    })

    it('falls back to expired_at when expires_at is missing', async () => {
      getMock.mockResolvedValueOnce({ data: [{ ...rawInvitacion, expires_at: undefined }] })

      const result = await usuariosService.listInvitaciones()

      expect(result.data[0].expires_at).toBe('2025-06-03T00:00:00Z')
    })
  })

  describe('createInvitacion', () => {
    it('POSTs to correct endpoint and maps response', async () => {
      postMock.mockResolvedValueOnce({
        data: { id: 99, correo: 'nuevo@bioactiva.pe', rol: 2, estado: 0, expired_at: '', consumed_at: null, created_at: '' },
      })

      const result = await usuariosService.createInvitacion('nuevo@bioactiva.pe', 2)

      expect(postMock).toHaveBeenCalledWith('/invitations', { correo: 'nuevo@bioactiva.pe', rol: 2 })
      expect(result.correo).toBe('nuevo@bioactiva.pe')
      expect(result.rol).toBe(RolUsuario.Trabajador)
      expect(result.estado).toBe(EstadoToken.Pendiente)
    })
  })

  describe('revokeInvitacion', () => {
    it('DELETEs to correct endpoint and maps response', async () => {
      deleteMock.mockResolvedValueOnce({
        data: { id: 1, correo: '', rol: 2, estado: 2, consumed_at: null, created_at: '' },
      })

      const result = await usuariosService.revokeInvitacion(1)

      expect(deleteMock).toHaveBeenCalledWith('/invitations/1')
      expect(result.estado).toBe(EstadoToken.Expirado)
    })
  })

  describe('getInvitacionInfo', () => {
    it('GETs to correct endpoint', async () => {
      getMock.mockResolvedValueOnce({
        data: { correo: 'n***1@bioactiva.pe', expired: false, accepted: false },
      })

      const result = await usuariosService.getInvitacionInfo('some-token')

      expect(getMock).toHaveBeenCalledWith('/invitations/info/some-token')
      expect(result.expired).toBe(false)
    })
  })

  describe('acceptInvitacion', () => {
    it('POSTs to correct endpoint', async () => {
      postMock.mockResolvedValueOnce({ data: { accessToken: 'jwt-abc', accessTokenExpiresIn: 900 } })

      const result = await usuariosService.acceptInvitacion({
        token: 't',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
        nombres: 'Juan',
        apellidos: 'Pérez',
      })

      expect(postMock).toHaveBeenCalledWith('/invitations/accept', {
        token: 't',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
        nombres: 'Juan',
        apellidos: 'Pérez',
      })
      expect(result.accessToken).toBe('jwt-abc')
    })
  })
})
