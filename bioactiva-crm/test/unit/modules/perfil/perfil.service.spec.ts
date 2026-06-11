jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: false,
}))

const getMock = jest.fn()
const patchMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: getMock,
    patch: patchMock,
  },
}))

import { perfilService } from '@/services/modules/perfil.service'
import { RolUsuario, EstadoUsuario } from '@/types/enums'

const RAW_PROFILE = {
  id: 1,
  nombres: 'Admin',
  apellidos: 'User',
  correo: 'admin@bioactiva.pe',
  rol: 'ADMINISTRADOR',
  estado: 'ACTIVO',
  fechaRegistro: '2025-01-01T08:00:00Z',
}

describe('perfil/perfil.service (Mantis #333)', () => {
  beforeEach(() => {
    getMock.mockReset()
    patchMock.mockReset()
  })

  describe('getProfile', () => {
    it('GETs /profile and maps the UserResponseDto', async () => {
      getMock.mockResolvedValueOnce({ data: RAW_PROFILE })

      const result = await perfilService.getProfile()

      expect(getMock).toHaveBeenCalledWith('/profile')
      expect(result.rol).toBe(RolUsuario.Administrador)
      expect(result.estado).toBe(EstadoUsuario.Activo)
      expect(result.created_at).toBe('2025-01-01T08:00:00Z')
    })
  })

  describe('updateProfile', () => {
    it('PATCHes /profile with only nombres/apellidos', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...RAW_PROFILE, nombres: 'Nuevo', apellidos: 'Nombre' } })

      const result = await perfilService.updateProfile({ nombres: 'Nuevo', apellidos: 'Nombre' })

      expect(patchMock).toHaveBeenCalledWith('/profile', { nombres: 'Nuevo', apellidos: 'Nombre' })
      expect(result.nombres).toBe('Nuevo')
      expect(result.apellidos).toBe('Nombre')
    })
  })

  describe('changePassword', () => {
    it('PATCHes /profile/password with current and new password', async () => {
      patchMock.mockResolvedValueOnce({ data: undefined })

      await perfilService.changePassword({ currentPassword: 'Old1!', newPassword: 'NewPass12!' })

      expect(patchMock).toHaveBeenCalledWith('/profile/password', {
        currentPassword: 'Old1!',
        newPassword: 'NewPass12!',
      })
    })
  })
})
