import {
  mockGetCentro,
  mockGetNotificaciones,
  mockMarcarLeida,
  mockMarcarTodasLeidas,
  mockCancelarProgramada,
  mockCancelarPendientesPorActividad,
  mockCreateRecordatorio,
  mockCreateSeguimiento,
} from '@/services/mock/notificaciones.mock'
import { EstadoNotif } from '@/types/enums'

describe('mocks/notificaciones.mock (implementation)', () => {
  describe('mockGetCentro', () => {
    it('returns centro with vencidas and programadas', async () => {
      const result = await mockGetCentro()
      expect(result).toHaveProperty('vencidas')
      expect(result).toHaveProperty('programadas')
      expect(result).toHaveProperty('sinLeer')
      expect(result.vencidas.length).toBeGreaterThan(0)
    })
  })

  describe('mockGetNotificaciones', () => {
    it('returns list of notificaciones', async () => {
      const result = await mockGetNotificaciones()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('mockMarcarLeida', () => {
    it('marks notification as read', async () => {
      const result = await mockMarcarLeida(1)
      expect(result.estado).toBe(EstadoNotif.Leida)
    })
  })

  describe('mockMarcarTodasLeidas', () => {
    it('marks all as read', async () => {
      await expect(mockMarcarTodasLeidas()).resolves.toBeUndefined()
    })
  })

  describe('mockCancelarProgramada', () => {
    it('throws for non-existent programada', async () => {
      await expect(mockCancelarProgramada(1)).rejects.toThrow('Notificación programada no encontrada')
    })
  })

  describe('mockCancelarPendientesPorActividad', () => {
    it('cancels pending by activity', async () => {
      await expect(mockCancelarPendientesPorActividad(1)).resolves.toBeUndefined()
    })
  })

  describe('mockCreateRecordatorio', () => {
    it('creates recordatorio', async () => {
      const result = await mockCreateRecordatorio({ leadId: 1 } as any)
      expect(result).toHaveProperty('id')
    })
  })

  describe('mockCreateSeguimiento', () => {
    it('creates seguimiento', async () => {
      const result = await mockCreateSeguimiento({ leadId: 1 } as any)
      expect(result).toHaveProperty('id')
    })
  })
})
