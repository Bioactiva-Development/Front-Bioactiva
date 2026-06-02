/**
 * @jest-environment jsdom
 */

import {
  isValidFileType,
  formatFileSize,
  generateCSV,
  downloadCSV,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/utils/csv.utils'

describe('csv.utils', () => {
  describe('MAX_FILE_SIZE_BYTES', () => {
    it('is 10 MB', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024)
    })
  })

  describe('isValidFileType', () => {
    function createFile(name: string): File {
      return new File([''], name)
    }

    it('accepts .xlsx files', () => {
      expect(isValidFileType(createFile('data.xlsx'))).toBe(true)
    })

    it('accepts .xls files', () => {
      expect(isValidFileType(createFile('data.xls'))).toBe(true)
    })

    it('accepts .csv files', () => {
      expect(isValidFileType(createFile('data.csv'))).toBe(true)
    })

    it('rejects .txt files', () => {
      expect(isValidFileType(createFile('data.txt'))).toBe(false)
    })

    it('rejects files with no extension', () => {
      expect(isValidFileType(createFile('data'))).toBe(false)
    })

    it('is case-insensitive', () => {
      expect(isValidFileType(createFile('data.XLSX'))).toBe(true)
      expect(isValidFileType(createFile('data.CSV'))).toBe(true)
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(1_024)).toBe('1.0 KB')
      expect(formatFileSize(1_500)).toBe('1.5 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(1_024 * 1_024)).toBe('1.0 MB')
      expect(formatFileSize(2_500_000)).toBe('2.4 MB')
    })
  })

  describe('generateCSV', () => {
    it('generates CSV with header and rows', () => {
      const data = [
        { nombre: 'Altomayo', ruc: '20601258529', sector: 'AGROALIMENTARIA' },
        { nombre: 'Cacao de Aroma', ruc: '20524967627', sector: 'AGROALIMENTARIA' },
      ]
      const columnas = ['nombre', 'ruc', 'sector']

      const result = generateCSV(data, columnas)

      expect(result).toBe(
        'nombre,ruc,sector\nAltomayo,20601258529,AGROALIMENTARIA\nCacao de Aroma,20524967627,AGROALIMENTARIA'
      )
    })

    it('escapes cells containing commas', () => {
      const data = [{ nombre: 'Altomayo S.A., Peru', ruc: '20601258529' }]
      const columnas = ['nombre', 'ruc']

      const result = generateCSV(data, columnas)

      expect(result).toBe('nombre,ruc\n"Altomayo S.A., Peru",20601258529')
    })

    it('escapes cells containing double quotes', () => {
      const data = [{ nombre: 'Altomayo "S.A."', ruc: '20601258529' }]
      const columnas = ['nombre', 'ruc']

      const result = generateCSV(data, columnas)

      expect(result).toBe('nombre,ruc\n"Altomayo ""S.A.""",20601258529')
    })

    it('escapes cells containing newlines', () => {
      const data = [{ nombre: 'Altomayo\nS.A.', ruc: '20601258529' }]
      const columnas = ['nombre', 'ruc']

      const result = generateCSV(data, columnas)

      expect(result).toContain('"Altomayo\nS.A."')
    })

    it('escapes cells containing semicolons', () => {
      const data = [{ nombre: 'Altomayo;S.A.', ruc: '20601258529' }]
      const columnas = ['nombre', 'ruc']

      const result = generateCSV(data, columnas)

      expect(result).toContain('"Altomayo;S.A."')
    })

    it('handles null values as empty strings', () => {
      const data = [{ nombre: 'Altomayo', ruc: null }]
      const columnas = ['nombre', 'ruc']

      const result = generateCSV(data, columnas)

      expect(result).toBe('nombre,ruc\nAltomayo,')
    })

    it('handles numeric values', () => {
      const data = [{ nombre: 'Altomayo', ventas: 1_500_000 }]
      const columnas = ['nombre', 'ventas']

      const result = generateCSV(data, columnas)

      expect(result).toBe('nombre,ventas\nAltomayo,1500000')
    })

    it('handles empty data', () => {
      const result = generateCSV([], ['nombre', 'ruc'])

      expect(result).toBe('nombre,ruc')
    })
  })

  describe('downloadCSV', () => {
    let link: HTMLAnchorElement

    const originalCreateObjectURL = (globalThis.URL as { createObjectURL?: (blob: Blob) => string }).createObjectURL

    beforeAll(() => {
      if (typeof URL.createObjectURL !== 'function') {
        ;(URL as unknown as Record<string, unknown>).createObjectURL = () => 'blob:mock'
      }
      if (typeof URL.revokeObjectURL !== 'function') {
        ;(URL as unknown as Record<string, unknown>).revokeObjectURL = () => {}
      }
    })

    afterAll(() => {
      if (originalCreateObjectURL) {
        ;(URL as unknown as Record<string, unknown>).createObjectURL = originalCreateObjectURL
      }
    })

    beforeEach(() => {
      link = document.createElement('a')
      jest.spyOn(link, 'click').mockImplementation()
      jest.spyOn(document, 'createElement').mockReturnValue(link)
      jest.spyOn(document.body, 'appendChild').mockImplementation()
      jest.spyOn(document.body, 'removeChild').mockImplementation()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('creates a download link and clicks it', () => {
      downloadCSV('test.csv', 'a,b\n1,2')

      expect(link.download).toBe('test.csv')
      expect(link.href).toContain('blob:')
      expect(document.body.appendChild).toHaveBeenCalledWith(link)
      expect(link.click).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalledWith(link)
    })

    it('includes UTF-8 BOM in the blob', () => {
      const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL' as never)
      downloadCSV('test.csv', 'content')

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/csv;charset=utf-8;')
      expect(blob.size).toBeGreaterThan('content'.length)
      createObjectURLSpy.mockRestore()
    })
  })
})
