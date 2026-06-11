import { actividadSchema } from '@/lib/validators/actividad.schema'
import { EstadoActividad, TipoActividad } from '@/types/enums'

describe('validators/actividad.schema', () => {
  it('accepts valid actividad data', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      id_responsable: 3,
      nombre_actividad: 'Discovery call',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
      fecha_inicio: '2026-06-10T14:00',
      fecha_fin: '2026-06-10T15:00',
    })
    expect(result.nombre_actividad).toBe('Discovery call')
    expect(result.tipo).toBe(TipoActividad.Llamada)
  })

  it('accepts optional notas', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      id_responsable: 3,
      nombre_actividad: 'Follow-up',
      tipo: TipoActividad.Email,
      estado: EstadoActividad.Completada,
      fecha_inicio: '2026-06-11T10:00',
      fecha_fin: '2026-06-11T11:00',
      notas: 'Cliente confirmó interés',
    })
    expect(result.notas).toBe('Cliente confirmó interés')
  })

  it('accepts empty notas', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      id_responsable: 3,
      nombre_actividad: 'Call',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
      fecha_inicio: '2026-06-10T14:00',
      fecha_fin: '2026-06-10T15:00',
      notas: '',
    })
    expect(result.notas).toBe('')
  })

  it('rejects missing lead', () => {
    expect(() =>
      actividadSchema.parse({
        id_responsable: 3,
        nombre_actividad: 'Test',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
      })
    ).toThrow()
  })

  it('rejects empty nombre_actividad', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: '',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
      })
    ).toThrow('El nombre de la actividad es obligatorio')
  })

  it('rejects nombre_actividad exceeding 90 characters', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: 'X'.repeat(91),
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
      })
    ).toThrow('Máximo 90 caracteres')
  })

  it('rejects notas exceeding 1000 characters', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: 'Call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
        notas: 'X'.repeat(1001),
      })
    ).toThrow('Máximo 1000 caracteres')
  })

  it('rejects id_responsable = 0', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        id_responsable: 0,
        nombre_actividad: 'Call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
      })
    ).toThrow('El responsable es obligatorio')
  })

  it('rejects fecha_fin before fecha_inicio via refine', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: 'Call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T15:00',
        fecha_fin: '2026-06-10T14:00',
      })
    ).toThrow('La fecha es obligatoria')
  })

  it('accepts all TipoActividad enum values', () => {
    for (const tipo of Object.values(TipoActividad)) {
      const result = actividadSchema.parse({
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: 'Test',
        tipo,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
      })
      expect(result.tipo).toBe(tipo)
    }
  })

  it('accepts all EstadoActividad enum values', () => {
    for (const estado of Object.values(EstadoActividad)) {
      const result = actividadSchema.parse({
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: 'Test',
        tipo: TipoActividad.Llamada,
        estado,
        fecha_inicio: '2026-06-10T14:00',
        fecha_fin: '2026-06-10T15:00',
      })
      expect(result.estado).toBe(estado)
    }
  })
})
