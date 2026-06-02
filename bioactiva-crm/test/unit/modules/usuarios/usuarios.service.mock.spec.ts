jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: true,
}))

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockGetUsuarios = jest.fn()
const mockEditarUsuario = jest.fn()
const mockCambiarPassword = jest.fn()
const mockDeshabilitarUsuario = jest.fn()
const mockHabilitarUsuario = jest.fn()
const mockListInvitaciones = jest.fn()
const mockCreateInvitacion = jest.fn()
const mockRevokeInvitacion = jest.fn()
const mockGetInvitacionInfo = jest.fn()
const mockAcceptInvitacion = jest.fn()

jest.mock('@/services/mock/usuarios.mock', () => ({
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
}))

import { usuariosService } from '@/services/modules/usuarios.service'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

describe('usuarios/usuarios.service (mock mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates getUsuarios to mockGetUsuarios', async () => {
    const mockResponse = {
      usuarios: [],
      total: 0,
      activos: 0,
    }
    mockGetUsuarios.mockResolvedValueOnce(mockResponse)

    const result = await usuariosService.getUsuarios({ rol: RolUsuario.Administrador })

    expect(mockGetUsuarios).toHaveBeenCalledWith({ rol: RolUsuario.Administrador })
    expect(result).toEqual(mockResponse)
  })

  it('delegates editar to mockEditarUsuario', async () => {
    const data = { id: 1, nombre_completo: 'Admin User', correo: 'admin@bioactiva.pe', rol: RolUsuario.Administrador }
    mockEditarUsuario.mockResolvedValueOnce({ id: 1, nombres: 'Admin', apellidos: 'User', correo: 'admin@bioactiva.pe', rol: RolUsuario.Administrador, estado: EstadoUsuario.Activo, created_at: '', updated_at: '' })

    const result = await usuariosService.editar(data)

    expect(mockEditarUsuario).toHaveBeenCalledWith(data)
    expect(result.rol).toBe(RolUsuario.Administrador)
  })

  it('delegates cambiarPassword to mockCambiarPassword', async () => {
    mockCambiarPassword.mockResolvedValueOnce({ message: 'Ok' })

    const result = await usuariosService.cambiarPassword({ id: 1, password: 'newPass1!' })

    expect(mockCambiarPassword).toHaveBeenCalledWith({ id: 1, password: 'newPass1!' })
    expect(result).toEqual({ message: 'Ok' })
  })

  it('delegates deshabilitar to mockDeshabilitarUsuario', async () => {
    mockDeshabilitarUsuario.mockResolvedValueOnce({ id: 1, nombres: '', apellidos: '', correo: '', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Inactivo, created_at: '', updated_at: '' })

    const result = await usuariosService.deshabilitar(1)

    expect(mockDeshabilitarUsuario).toHaveBeenCalledWith(1)
    expect(result.estado).toBe(EstadoUsuario.Inactivo)
  })

  it('delegates habilitar to mockHabilitarUsuario', async () => {
    mockHabilitarUsuario.mockResolvedValueOnce({ id: 1, nombres: '', apellidos: '', correo: '', rol: RolUsuario.Trabajador, estado: EstadoUsuario.Activo, created_at: '', updated_at: '' })

    const result = await usuariosService.habilitar(1)

    expect(mockHabilitarUsuario).toHaveBeenCalledWith(1)
    expect(result.estado).toBe(EstadoUsuario.Activo)
  })

  it('delegates listInvitaciones to mockListInvitaciones', async () => {
    mockListInvitaciones.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 10 })

    const result = await usuariosService.listInvitaciones({ page: 1 })

    expect(mockListInvitaciones).toHaveBeenCalledWith({ page: 1 })
    expect(result.total).toBe(0)
  })

  it('delegates createInvitacion to mockCreateInvitacion', async () => {
    mockCreateInvitacion.mockResolvedValueOnce({ id: 99, correo: 'nuevo@bioactiva.pe', rol: RolUsuario.Trabajador, estado: 'Pendiente', expires_at: '', consumed_at: null, created_at: '' })

    const result = await usuariosService.createInvitacion('nuevo@bioactiva.pe', 2)

    expect(mockCreateInvitacion).toHaveBeenCalledWith('nuevo@bioactiva.pe', 2)
    expect(result.correo).toBe('nuevo@bioactiva.pe')
  })

  it('delegates revokeInvitacion to mockRevokeInvitacion', async () => {
    mockRevokeInvitacion.mockResolvedValueOnce({ id: 1, correo: '', rol: RolUsuario.Trabajador, estado: 'Expirado', expires_at: '', consumed_at: null, created_at: '' })

    const result = await usuariosService.revokeInvitacion(1)

    expect(mockRevokeInvitacion).toHaveBeenCalledWith(1)
    expect(result.estado).toBe('Expirado')
  })

  it('delegates getInvitacionInfo to mockGetInvitacionInfo', async () => {
    mockGetInvitacionInfo.mockResolvedValueOnce({ correo: 'n***1@bioactiva.pe', expired: false, accepted: false })

    const result = await usuariosService.getInvitacionInfo('some-token')

    expect(mockGetInvitacionInfo).toHaveBeenCalledWith('some-token')
    expect(result.expired).toBe(false)
  })

  it('delegates acceptInvitacion to mockAcceptInvitacion', async () => {
    mockAcceptInvitacion.mockResolvedValueOnce({ message: 'Cuenta activada correctamente.' })

    const result = await usuariosService.acceptInvitacion({ token: 't', password: 'P1!', confirmPassword: 'P1!', nombres: 'Juan', apellidos: 'Pérez' })

    expect(mockAcceptInvitacion).toHaveBeenCalledWith()
    expect(result.message).toBe('Cuenta activada correctamente.')
  })
})
