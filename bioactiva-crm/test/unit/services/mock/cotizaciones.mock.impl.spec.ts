import {
  mockGetCotizaciones,
  mockGetCotizacion,
  mockCreateCotizacion,
  mockUpdateCotizacion,
  mockEnviarCotizacion,
  mockAceptarCotizacion,
  mockRechazarCotizacion,
  mockDeleteCotizacion,
  mockGetKpis,
} from '@/services/mock/cotizaciones.mock'
import { EstadoCot } from '@/types/enums'

describe('mocks/cotizaciones.mock (implementation)', () => {
  describe('mockGetCotizaciones', () => {
    it('returns paginated cotizaciones', async () => {
      const result = await mockGetCotizaciones()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('filters by estado', async () => {
      const result = await mockGetCotizaciones({ estado: EstadoCot.Pendiente } as any)
      expect(result.data.every((c: any) => c.estado === EstadoCot.Pendiente)).toBe(true)
    })
  })

  describe('mockGetCotizacion', () => {
    it('returns cotizacion by id', async () => {
      const result = await mockGetCotizacion(1)
      expect(result.id).toBe(1)
    })

    it('throws 404 for unknown id', async () => {
      await expect(mockGetCotizacion(999)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('mockCreateCotizacion', () => {
    it('creates cotizacion with Pendiente state', async () => {
      const result = await mockCreateCotizacion({ nombreServicio: 'Test' } as any)
      expect(result.estado).toBe(EstadoCot.Pendiente)
    })
  })

  describe('mockUpdateCotizacion', () => {
    it('updates cotizacion fields', async () => {
      const result = await mockUpdateCotizacion(1, { monto: '20000' } as any)
      expect(result.monto).toBe('20000')
    })
  })

  describe('mockEnviarCotizacion', () => {
    it('sends cotizacion', async () => {
      const result = await mockEnviarCotizacion(1)
      expect(result.estado).toBe(EstadoCot.Enviada)
    })
  })

  describe('mockAceptarCotizacion', () => {
    it('accepts cotizacion', async () => {
      const result = await mockAceptarCotizacion(2)
      expect(result.estado).toBe(EstadoCot.Aceptada)
    })
  })

  describe('mockRechazarCotizacion', () => {
    it('rejects cotizacion', async () => {
      const result = await mockRechazarCotizacion(3)
      expect(result.estado).toBe(EstadoCot.Rechazada)
    })
  })

  describe('mockDeleteCotizacion', () => {
    it('deletes cotizacion', async () => {
      await expect(mockDeleteCotizacion(1)).resolves.toBeUndefined()
    })
  })

  describe('mockGetKpis', () => {
    it('returns KPI data without pending count', async () => {
      const result = await mockGetKpis()
      expect(result).toHaveProperty('enviadas')
      expect(result).toHaveProperty('aceptadas')
      expect(result).toHaveProperty('rechazadas')
      expect(result).toHaveProperty('totalActivo')
    })
  })
})
