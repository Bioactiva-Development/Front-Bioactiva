import {
  sortActivitiesDesc,
  getBlockingPendingActivity,
  hasOverdueActivity,
  isLeadClosed,
  isLeadStaleWithoutProgress,
  getLeadAlertLabel,
} from '@/lib/utils/activity-flow.utils'
import { EstadoActividad, LeadState } from '@/types/enums'
import { Actividad } from '@/types/actividad.types'
import { Lead } from '@/types/lead.types'

const makeActividad = (overrides: Partial<Actividad> = {}): Actividad => ({
  id: 1,
  id_lead: 10,
  id_responsable: 3,
  nombre_actividad: 'Call',
  fecha_inicio: '2026-06-10T14:00:00.000Z',
  fecha_fin: '2026-06-10T15:00:00.000Z',
  tipo: 'Llamada' as Actividad['tipo'],
  estado: EstadoActividad.Pendiente,
  notas: undefined,
  created_at: '2026-06-10T13:00:00.000Z',
  updated_at: '2026-06-10T13:30:00.000Z',
  ...overrides,
})

const makeLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 1,
  codigo: 'LEAD-2026-001',
  id_org: 'org-001',
  id_encargado: 3,
  estado: LeadState.Prospecto,
  servicio_interes: 'Ley 30309',
  created_at: '2026-06-01T10:00:00.000Z',
  updated_at: '2026-06-01T10:00:00.000Z',
  ...overrides,
})

describe('activity-flow.utils', () => {
  describe('sortActivitiesDesc', () => {
    it('sorts activities by fecha_inicio descending', () => {
      const a1 = makeActividad({ id: 1, fecha_inicio: '2026-06-10T14:00:00.000Z' })
      const a2 = makeActividad({ id: 2, fecha_inicio: '2026-06-11T14:00:00.000Z' })
      const a3 = makeActividad({ id: 3, fecha_inicio: '2026-06-09T14:00:00.000Z' })

      const sorted = sortActivitiesDesc([a1, a2, a3])
      expect(sorted[0].id).toBe(2)
      expect(sorted[1].id).toBe(1)
      expect(sorted[2].id).toBe(3)
    })

    it('falls back to created_at when fecha_inicio is undefined', () => {
      const a1 = makeActividad({ id: 1, fecha_inicio: undefined as unknown as string, created_at: '2026-06-10T14:00:00.000Z' })
      const a2 = makeActividad({ id: 2, fecha_inicio: undefined as unknown as string, created_at: '2026-06-11T14:00:00.000Z' })

      const sorted = sortActivitiesDesc([a1, a2])
      expect(sorted[0].id).toBe(2)
    })

    it('does not mutate the original array', () => {
      const arr = [
        makeActividad({ id: 1, fecha_inicio: '2026-06-10T14:00:00.000Z' }),
        makeActividad({ id: 2, fecha_inicio: '2026-06-11T14:00:00.000Z' }),
      ]
      const copy = [...arr]
      sortActivitiesDesc(arr)
      expect(arr).toEqual(copy)
    })
  })

  describe('getBlockingPendingActivity', () => {
    it('returns the most recent pending activity', () => {
      const completed = makeActividad({ id: 1, estado: EstadoActividad.Completada, fecha_inicio: '2026-06-10T14:00:00.000Z' })
      const pending = makeActividad({ id: 2, estado: EstadoActividad.Pendiente, fecha_inicio: '2026-06-11T14:00:00.000Z' })

      const result = getBlockingPendingActivity([completed, pending])
      expect(result).not.toBeNull()
      expect(result!.id).toBe(2)
    })

    it('returns null when no pending activity exists', () => {
      const completed = makeActividad({ id: 1, estado: EstadoActividad.Completada })
      const cancelled = makeActividad({ id: 2, estado: EstadoActividad.Cancelada })

      const result = getBlockingPendingActivity([completed, cancelled])
      expect(result).toBeNull()
    })

    it('returns null when activities array is empty', () => {
      expect(getBlockingPendingActivity([])).toBeNull()
    })
  })

  describe('hasOverdueActivity', () => {
    it('returns true when a pending activity is past its fecha_fin', () => {
      const overdue = makeActividad({
        estado: EstadoActividad.Pendiente,
        fecha_fin: '2026-06-01T15:00:00.000Z',
      })
      const now = new Date('2026-06-10T12:00:00.000Z')
      expect(hasOverdueActivity([overdue], now)).toBe(true)
    })

    it('returns false when pending activity is in the future', () => {
      const future = makeActividad({
        estado: EstadoActividad.Pendiente,
        fecha_fin: '2026-06-20T15:00:00.000Z',
      })
      const now = new Date('2026-06-10T12:00:00.000Z')
      expect(hasOverdueActivity([future], now)).toBe(false)
    })

    it('returns false when all activities are completed', () => {
      const completed = makeActividad({
        estado: EstadoActividad.Completada,
        fecha_fin: '2026-06-01T15:00:00.000Z',
      })
      const now = new Date('2026-06-10T12:00:00.000Z')
      expect(hasOverdueActivity([completed], now)).toBe(false)
    })

    it('returns false for empty array', () => {
      expect(hasOverdueActivity([], new Date('2026-06-10T12:00:00.000Z'))).toBe(false)
    })
  })

  describe('isLeadClosed', () => {
    it('returns true for CierreVenta', () => {
      expect(isLeadClosed(makeLead({ estado: LeadState.CierreVenta }))).toBe(true)
    })

    it('returns true for CierreSinVenta', () => {
      expect(isLeadClosed(makeLead({ estado: LeadState.CierreSinVenta }))).toBe(true)
    })

    it('returns false for Prospecto', () => {
      expect(isLeadClosed(makeLead({ estado: LeadState.Prospecto }))).toBe(false)
    })

    it('returns false for Ofertado', () => {
      expect(isLeadClosed(makeLead({ estado: LeadState.Ofertado }))).toBe(false)
    })
  })

  describe('isLeadStaleWithoutProgress', () => {
    const oldDate = '2026-05-01T10:00:00.000Z'
    const recentDate = '2026-06-09T10:00:00.000Z'
    const now = new Date('2026-06-10T12:00:00.000Z')

    it('returns true when lead has no progress for 30+ days', () => {
      const lead = makeLead({ estado: LeadState.Prospecto, updated_at: oldDate })
      expect(isLeadStaleWithoutProgress(lead, now)).toBe(true)
    })

    it('returns false when lead has recent progress', () => {
      const lead = makeLead({ estado: LeadState.Prospecto, updated_at: recentDate })
      expect(isLeadStaleWithoutProgress(lead, now)).toBe(false)
    })

    it('returns false for closed leads regardless of staleness', () => {
      const lead = makeLead({ estado: LeadState.CierreVenta, updated_at: oldDate })
      expect(isLeadStaleWithoutProgress(lead, now)).toBe(false)
    })
  })

  describe('getLeadAlertLabel', () => {
    const now = new Date('2026-06-10T12:00:00.000Z')

    it('returns overdue label when there is an overdue activity', () => {
      const lead = makeLead({ updated_at: '2026-06-09T10:00:00.000Z' })
      const overdueActivity = makeActividad({
        estado: EstadoActividad.Pendiente,
        fecha_fin: '2026-06-01T15:00:00.000Z',
      })
      expect(getLeadAlertLabel(lead, [overdueActivity], now)).toBe('Actividad vencida')
    })

    it('returns stale label when no overdue activity but stale', () => {
      const lead = makeLead({
        estado: LeadState.Prospecto,
        updated_at: '2026-05-01T10:00:00.000Z',
      })
      const futureActivity = makeActividad({
        estado: EstadoActividad.Pendiente,
        fecha_fin: '2026-06-20T15:00:00.000Z',
      })
      expect(getLeadAlertLabel(lead, [futureActivity], now)).toBe('+30 días sin avance')
    })

    it('returns null when lead is recent and has no overdue activities', () => {
      const lead = makeLead({
        estado: LeadState.Prospecto,
        updated_at: '2026-06-09T10:00:00.000Z',
      })
      const futureActivity = makeActividad({
        estado: EstadoActividad.Pendiente,
        fecha_fin: '2026-06-20T15:00:00.000Z',
      })
      expect(getLeadAlertLabel(lead, [futureActivity], now)).toBeNull()
    })

    it('overdue takes precedence over stale', () => {
      const lead = makeLead({
        estado: LeadState.Prospecto,
        updated_at: '2026-05-01T10:00:00.000Z',
      })
      const overdueActivity = makeActividad({
        estado: EstadoActividad.Pendiente,
        fecha_fin: '2026-06-01T15:00:00.000Z',
      })
      expect(getLeadAlertLabel(lead, [overdueActivity], now)).toBe('Actividad vencida')
    })
  })
})
