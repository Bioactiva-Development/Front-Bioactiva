jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock },
}))

import { datosService } from '@/services/modules/datos.service'

describe('datos/datos.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('previewImport', () => {
    it('posts file and returns preview result', async () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' })
      postMock.mockResolvedValueOnce({
        data: { columnas: ['nombre', 'correo'], filas: [{ nombre: 'Test', correo: 'test@test.com' }], total: 1 },
      })

      const result = await datosService.previewImport(mockFile, 'contactos')
      expect(postMock).toHaveBeenCalledWith(
        '/api/datos/importar/preview',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      expect(result.total).toBe(1)
    })
  })

  describe('confirmarImport', () => {
    it('posts confirm import and returns result', async () => {
      postMock.mockResolvedValueOnce({
        data: { importados: 10, errores: 0, erroresDetalle: [] },
      })

      const result = await datosService.confirmarImport({
        entidad: 'contactos',
        mapeo: { nombre: 'nombres', correo: 'correo' },
        filas: [],
      })
      expect(postMock).toHaveBeenCalledWith('/api/datos/importar', {
        entidad: 'contactos',
        mapeo: { nombre: 'nombres', correo: 'correo' },
        filas: [],
      })
      expect(result.importados).toBe(10)
    })
  })

  describe('exportar', () => {
    it('fetches export data', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [{ id: 1, nombre: 'Test' }], total: 1 },
      })

      const result = await datosService.exportar({
        entidad: 'contactos',
      })
      expect(getMock).toHaveBeenCalledWith('/api/datos/exportar', {
        params: { entidad: 'contactos' },
      })
      expect(result.data).toHaveLength(1)
    })
  })

  describe('contarExportacion', () => {
    it('throws COUNT_NOT_SUPPORTED', async () => {
      await expect(datosService.contarExportacion({
        entidad: 'leads',
      })).rejects.toThrow('COUNT_NOT_SUPPORTED')
    })
  })
})
