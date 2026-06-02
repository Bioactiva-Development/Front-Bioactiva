jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: true,
}))

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}))

const mockGetContactos = jest.fn()
const mockGetContacto = jest.fn()
const mockCreateContacto = jest.fn()
const mockUpdateContacto = jest.fn()

jest.mock('@/services/mock/contactos.mock', () => ({
  mockGetContactos,
  mockGetContacto,
  mockCreateContacto,
  mockUpdateContacto,
}))

import { contactosService } from '@/services/modules/contactos.service'
import { Vocativo } from '@/types/enums'

describe('contactos/contactos.service (mock mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates getAll to mockGetContactos', async () => {
    const mockResponse = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    }
    mockGetContactos.mockResolvedValueOnce(mockResponse)

    const result = await contactosService.getAll({ search: 'Ricardo' })

    expect(mockGetContactos).toHaveBeenCalledWith({ search: 'Ricardo' })
    expect(result).toEqual(mockResponse)
  })

  it('delegates getById to mockGetContacto', async () => {
    const mockContacto = {
      id: 1,
      nombres: 'Ricardo',
      apellidos: 'Perales',
      correo: 'rperales@test.com',
      idOrganizacion: 'org-001',
      idAuthor: 1,
      estado_correo: 'VIGENTE',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }
    mockGetContacto.mockResolvedValueOnce(mockContacto)

    const result = await contactosService.getById(1)

    expect(mockGetContacto).toHaveBeenCalledWith(1)
    expect(result).toEqual(mockContacto)
  })

  it('delegates create to mockCreateContacto', async () => {
    const formData = {
      nombres: 'Nuevo Contacto',
      correo: 'nuevo@test.com',
      idOrganizacion: 'org-002',
    }
    const mockCreated = {
      id: 100,
      nombres: 'Nuevo Contacto',
      apellidos: null,
      correo: 'nuevo@test.com',
      idOrganizacion: 'org-002',
      idAuthor: 1,
      estado_correo: 'VIGENTE',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    }
    mockCreateContacto.mockResolvedValueOnce(mockCreated)

    const result = await contactosService.create(formData)

    expect(mockCreateContacto).toHaveBeenCalledWith(formData)
    expect(result.id).toBe(100)
  })

  it('delegates update to mockUpdateContacto', async () => {
    const updateData = { nombres: 'Nombre Actualizado' }
    const mockUpdated = {
      id: 1,
      nombres: 'Nombre Actualizado',
      apellidos: 'Perales',
      correo: 'rperales@test.com',
      idOrganizacion: 'org-001',
      idAuthor: 1,
      estado_correo: 'VIGENTE',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    }
    mockUpdateContacto.mockResolvedValueOnce(mockUpdated)

    const result = await contactosService.update(1, updateData)

    expect(mockUpdateContacto).toHaveBeenCalledWith(1, updateData)
    expect(result.nombres).toBe('Nombre Actualizado')
  })

  it('delegates getByOrganizacion to mockGetContactos with filter', async () => {
    const mockContactos = [
      {
        id: 1,
        nombres: 'Ricardo',
        apellidos: 'Perales',
        correo: 'rperales@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        estado_correo: 'VIGENTE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]
    mockGetContactos.mockResolvedValueOnce({ data: mockContactos, total: 1, page: 1, limit: 10 })

    const result = await contactosService.getByOrganizacion('org-001')

    expect(mockGetContactos).toHaveBeenCalledWith({ idOrganizacion: 'org-001' })
    expect(result).toEqual(mockContactos)
  })
})
