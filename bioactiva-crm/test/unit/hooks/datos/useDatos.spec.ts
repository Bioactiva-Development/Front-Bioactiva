import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: true,
}))

const mockPreviewImport = jest.fn()
const mockConfirmarImport = jest.fn()
const mockExportar = jest.fn()
const mockContarExportacion = jest.fn()

jest.mock('@/services/modules/datos.service', () => ({
  datosService: {
    previewImport: mockPreviewImport,
    confirmarImport: mockConfirmarImport,
    exportar: mockExportar,
    contarExportacion: mockContarExportacion,
  },
}))

const mockGenerateCSV = jest.fn(() => 'csv-content')
const mockDownloadCSV = jest.fn()
jest.mock('@/lib/utils/csv.utils', () => ({
  generateCSV: mockGenerateCSV,
  downloadCSV: mockDownloadCSV,
}))

import { useDatos } from '@/hooks/datos/useDatos'

describe('datos/useDatos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('previewImport', () => {
    it('previews file import successfully', async () => {
      const mockPreview = { columnas: ['nombre'], filas: [], total: 0 }
      mockPreviewImport.mockResolvedValueOnce(mockPreview)

      const { result } = renderHook(() => useDatos())

      let previewResult: any
      await act(async () => {
        previewResult = await result.current.previewImport(new File([], 'test.csv'), 'contactos')
      })

      expect(previewResult).toEqual(mockPreview)
      expect(result.current.preview).toEqual(mockPreview)
      expect(mockPreviewImport).toHaveBeenCalled()
    })

    it('handles preview error', async () => {
      mockPreviewImport.mockRejectedValueOnce(new Error('Archivo inválido'))

      const { result } = renderHook(() => useDatos())

      let previewResult: any
      await act(async () => {
        previewResult = await result.current.previewImport(new File([], 'bad.csv'), 'contactos')
      })

      expect(previewResult).toBeNull()
      expect(result.current.error).toBe('Archivo inválido')
    })

    it('uses fallback message when error is not an Error instance', async () => {
      mockPreviewImport.mockRejectedValueOnce('raw string')

      const { result } = renderHook(() => useDatos())

      await act(async () => {
        await result.current.previewImport(new File([], 'bad.csv'), 'contactos')
      })

      expect(result.current.error).toBe('Error al procesar el archivo.')
    })

    it('sets loading state', async () => {
      mockPreviewImport.mockImplementationOnce(() => new Promise(() => {}))

      const { result } = renderHook(() => useDatos())

      act(() => {
        result.current.previewImport(new File([], 'test.csv'), 'contactos')
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('confirmarImport', () => {
    it('confirms import successfully', async () => {
      const mockResult = { importados: 10, errores: 0, erroresDetalle: [] }
      mockConfirmarImport.mockResolvedValueOnce(mockResult)

      const { result } = renderHook(() => useDatos())

      let confirmResult: any
      await act(async () => {
        confirmResult = await result.current.confirmarImport({
          entidad: 'contactos',
          registros: [],
          omitirConflictos: false,
        })
      })

      expect(confirmResult).toEqual(mockResult)
      expect(result.current.resultadoImport).toEqual(mockResult)
    })

    it('handles confirm error', async () => {
      mockConfirmarImport.mockRejectedValueOnce('error')

      const { result } = renderHook(() => useDatos())

      await act(async () => {
        await result.current.confirmarImport({} as any)
      })

      expect(result.current.error).toBe('Error al confirmar la importación.')
    })
  })

  describe('exportar', () => {
    it('exports data and downloads CSV', async () => {
      const mockExportResult = {
        data: [{ nombre: 'Test' }],
        columnas: ['nombre'],
        total: 1,
        filename: 'export.csv',
      }
      mockExportar.mockResolvedValueOnce(mockExportResult)
      mockGenerateCSV.mockReturnValueOnce('csv-data')

      const { result } = renderHook(() => useDatos())

      let success: boolean
      await act(async () => {
        success = await result.current.exportar({ entidad: 'contactos' })
      })

      expect(success!).toBe(true)
      expect(mockGenerateCSV).toHaveBeenCalledWith(mockExportResult.data, mockExportResult.columnas)
      expect(mockDownloadCSV).toHaveBeenCalledWith('export.csv', 'csv-data')
    })

    it('returns false and sets error when export has 0 results', async () => {
      mockExportar.mockResolvedValueOnce({ data: [], columnas: [], total: 0, filename: '' })

      const { result } = renderHook(() => useDatos())

      let success: boolean
      await act(async () => {
        success = await result.current.exportar({ entidad: 'contactos' })
      })

      expect(success!).toBe(false)
      expect(result.current.error).toBe('No hay registros que coincidan con los filtros seleccionados.')
    })

    it('handles export error', async () => {
      mockExportar.mockRejectedValueOnce(new Error('Error de exportación'))

      const { result } = renderHook(() => useDatos())

      let success: boolean
      await act(async () => {
        success = await result.current.exportar({ entidad: 'contactos' })
      })

      expect(success!).toBe(false)
      expect(result.current.error).toBe('Error de exportación')
    })
  })

  describe('actualizarConteo', () => {
    it('updates count from service', async () => {
      mockContarExportacion.mockResolvedValueOnce({ total: 50 })

      const { result } = renderHook(() => useDatos())

      await act(async () => {
        await result.current.actualizarConteo({ entidad: 'leads' })
      })

      expect(result.current.conteo).toEqual({ total: 50 })
    })

    it('sets conteo to null on error', async () => {
      mockContarExportacion.mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useDatos())

      await act(async () => {
        await result.current.actualizarConteo({ entidad: 'leads' })
      })

      expect(result.current.conteo).toBeNull()
    })
  })

  describe('clearError', () => {
    it('clears error state', async () => {
      const { result } = renderHook(() => useDatos())

      act(() => { result.current.clearError() })

      expect(result.current.error).toBeNull()
    })
  })

  describe('resetImport', () => {
    it('resets import state and error', async () => {
      const { result } = renderHook(() => useDatos())

      act(() => { result.current.resetImport() })

      expect(result.current.preview).toBeNull()
      expect(result.current.resultadoImport).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})
