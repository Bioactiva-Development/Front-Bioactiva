jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: false,
}))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
  },
}))

import { contactosService } from '@/services/modules/contactos.service'
import { Vocativo } from '@/types/enums'

describe('contactos/contactos.service (API mode)', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
  })

  describe('getAll', () => {
    const rawArray = [
      {
        id: 1,
        nombres: 'Ricardo',
        apellidos: 'Perales Tuesta',
        vocativo: 'SR',
        cargo: 'Gerente de Proyectos',
        correo: 'rperales@altomayo.com.pe',
        correo2: null,
        telefono: '997 654 321',
        comentarios: null,
        idOrganizacion: 'org-001',
        idAuthor: 1,
        estado_correo: 'VIGENTE',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-01-01T08:00:00Z',
        organizacionNombre: 'Altomayo',
      },
      {
        id: 2,
        nombres: 'Lucía',
        apellidos: 'Huanca Ríos',
        vocativo: 'SRA',
        cargo: null,
        correo: 'lhuanca@altomayo.com.pe',
        correo2: null,
        telefono: null,
        comentarios: null,
        idOrganizacion: 'org-001',
        idAuthor: 1,
        estado_correo: 'VIGENTE',
        createdAt: '2025-01-02T08:00:00Z',
        updatedAt: '2025-01-02T08:00:00Z',
        organizacionNombre: 'Altomayo',
      },
    ]

    it('fetches all contacts and normalizes them', async () => {
      getMock.mockResolvedValueOnce({ data: rawArray })

      const result = await contactosService.getAll()

      expect(getMock).toHaveBeenCalledWith('/contacts', { params: undefined })
      expect(result.data).toHaveLength(2)
      expect(result.data[0].id).toBe(1)
      expect(result.data[0].nombres).toBe('Ricardo')
      expect(result.data[0].organizacion_nombre).toBe('Altomayo')
      expect(result.data[0].vocativo).toBe(Vocativo.SR)
    })

    it('passes filters as params', async () => {
      getMock.mockResolvedValueOnce({ data: rawArray })

      await contactosService.getAll({ search: 'Ricardo', page: 1, limit: 10 })

      expect(getMock).toHaveBeenCalledWith('/contacts', {
        params: { search: 'Ricardo', page: 1, limit: 10 },
      })
    })

    it('returns empty array when API returns empty', async () => {
      getMock.mockResolvedValueOnce({ data: [] })

      const result = await contactosService.getAll()

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('getById', () => {
    const raw = {
      id: 1,
      nombres: 'Ricardo',
      apellidos: 'Perales Tuesta',
      vocativo: 'SR',
      cargo: 'Gerente de Proyectos',
      correo: 'rperales@altomayo.com.pe',
      correo2: null,
      telefono: '997 654 321',
      comentarios: null,
      idOrganizacion: 'org-001',
      idAuthor: 1,
      estado_correo: 'VIGENTE',
      createdAt: '2025-01-01T08:00:00Z',
      updatedAt: '2025-01-01T08:00:00Z',
    }

    it('fetches contact by id', async () => {
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(getMock).toHaveBeenCalledWith('/contacts/1')
      expect(result.nombres).toBe('Ricardo')
      expect(result.vocativo).toBe(Vocativo.SR)
    })

    it('throws when contact not found', async () => {
      getMock.mockRejectedValueOnce({ status: 404, message: 'Contacto no encontrado.' })

      await expect(contactosService.getById(999)).rejects.toMatchObject({
        status: 404,
      })
    })
  })

  describe('create', () => {
    it('posts create payload and returns normalized contact', async () => {
      const createdRaw = {
        id: 100,
        nombres: 'Nuevo',
        apellidos: 'Contacto',
        vocativo: null,
        cargo: null,
        correo: 'nuevo@test.com',
        correo2: null,
        telefono: null,
        comentarios: null,
        idOrganizacion: 'org-002',
        idAuthor: 1,
        estado_correo: 'VIGENTE',
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-06-01T08:00:00Z',
      }
      postMock.mockResolvedValueOnce({ data: createdRaw })

      const result = await contactosService.create({
        nombres: 'Nuevo',
        correo: 'nuevo@test.com',
        idOrganizacion: 'org-002',
      })

      expect(postMock).toHaveBeenCalledWith('/contacts', {
        nombres: 'Nuevo',
        correo: 'nuevo@test.com',
        idOrganizacion: 'org-002',
      })
      expect(result.id).toBe(100)
      expect(result.estado_correo).toBe('VIGENTE')
    })

    it('throws on duplicate email', async () => {
      postMock.mockRejectedValueOnce({ status: 409, message: 'El contacto ya se encuentra registrado.' })

      await expect(
        contactosService.create({
          nombres: 'Duplicado',
          correo: 'existente@test.com',
          idOrganizacion: 'org-001',
        })
      ).rejects.toMatchObject({ status: 409 })
    })
  })

  describe('update', () => {
    it('patches contact and returns updated data', async () => {
      const updatedRaw = {
        id: 1,
        nombres: 'Ricardo Updated',
        apellidos: 'Perales Tuesta',
        vocativo: 'SR',
        cargo: 'Gerente de Proyectos',
        correo: 'rperales@altomayo.com.pe',
        correo2: null,
        telefono: '997 654 321',
        comentarios: null,
        idOrganizacion: 'org-001',
        idAuthor: 1,
        estado_correo: 'VIGENTE',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-06-01T08:00:00Z',
      }
      patchMock.mockResolvedValueOnce({ data: updatedRaw })

      const result = await contactosService.update(1, { nombres: 'Ricardo Updated' })

      expect(patchMock).toHaveBeenCalledWith('/contacts/1', { nombres: 'Ricardo Updated' })
      expect(result.nombres).toBe('Ricardo Updated')
    })
  })

  describe('getByOrganizacion', () => {
    it('fetches contacts filtered by organization', async () => {
      const rawArray = [
        {
          id: 1,
          nombres: 'Ricardo',
          apellidos: 'Perales',
          correo: 'rperales@altomayo.com.pe',
          idOrganizacion: 'org-001',
          idAuthor: 1,
          estado_correo: 'VIGENTE',
          createdAt: '2025-01-01T08:00:00Z',
          updatedAt: '2025-01-01T08:00:00Z',
        },
      ]
      getMock.mockResolvedValueOnce({ data: rawArray })

      const result = await contactosService.getByOrganizacion('org-001')

      expect(getMock).toHaveBeenCalledWith('/contacts/organization/org-001')
      expect(result).toHaveLength(1)
      expect(result[0].idOrganizacion).toBe('org-001')
    })
  })

  describe('normalizeContacto (via service methods)', () => {
    it('handles null optional fields', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        createdAt: '2025-01-01T00:00:00Z',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.apellidos).toBeNull()
      expect(result.telefono).toBeNull()
      expect(result.correo2).toBeNull()
      expect(result.cargo).toBeNull()
      expect(result.comentarios).toBeNull()
    })

    it('defaults estado_correo to VIGENTE when missing', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        createdAt: '2025-01-01T00:00:00Z',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.estado_correo).toBe('VIGENTE')
    })

    it('maps organizacionNombre to organizacion_nombre', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        createdAt: '2025-01-01T00:00:00Z',
        organizacionNombre: 'Altomayo',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.organizacion_nombre).toBe('Altomayo')
    })

    it('falls back to organizacion_nombre if organizacionNombre is not provided', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        createdAt: '2025-01-01T00:00:00Z',
        organizacion_nombre: 'DirectFallback',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.organizacion_nombre).toBe('DirectFallback')
    })

    it('falls back to createdAt when updatedAt is missing', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        createdAt: '2025-01-01T00:00:00Z',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.updatedAt).toBe('2025-01-01T00:00:00Z')
    })

    it('handles vocativo as Vocativo enum', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        apellidos: null,
        vocativo: 'SR',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        estado_correo: 'VIGENTE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.vocativo).toBe(Vocativo.SR)
    })

    it('preserves estado_correo when provided', async () => {
      const raw = {
        id: 1,
        nombres: 'Test',
        correo: 'test@test.com',
        idOrganizacion: 'org-001',
        idAuthor: 1,
        estado_correo: 'VENCIDO',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      getMock.mockResolvedValueOnce({ data: raw })

      const result = await contactosService.getById(1)

      expect(result.estado_correo).toBe('VENCIDO')
    })
  })
})
