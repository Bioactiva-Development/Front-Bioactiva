import { actividadSchema } from '@/lib/validators/actividad.schema'
import { EstadoActividad, TipoActividad } from '@/types/enums'

const d = (offsetDays: number, hour = 14) => {
  const dt = new Date(Date.now() + offsetDays * 86_400_000)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString().slice(0, 16)
}

describe('validators/actividad.schema', () => {
  it('accepts valid actividad data', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      nombre_actividad: 'Discovery call',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
      fecha_inicio: d(1, 14),
      fecha_fin: d(1, 15),
    })
    expect(result.nombre_actividad).toBe('Discovery call')
    expect(result.tipo).toBe(TipoActividad.Llamada)
  })

  it('accepts optional notas', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      nombre_actividad: 'Follow-up',
      tipo: TipoActividad.Email,
      estado: EstadoActividad.Completada,
      fecha_inicio: d(2, 10),
      fecha_fin: d(2, 11),
      notas: 'Cliente confirmó interés',
    })
    expect(result.notas).toBe('Cliente confirmó interés')
  })

  it('accepts empty notas', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      nombre_actividad: 'Call',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
      fecha_inicio: d(1, 14),
      fecha_fin: d(1, 15),
      notas: '',
    })
    expect(result.notas).toBe('')
  })

  it('rejects missing lead', () => {
    expect(() =>
      actividadSchema.parse({
        nombre_actividad: 'Test',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: d(1, 14),
        fecha_fin: d(1, 15),
      })
    ).toThrow()
  })

  it('rejects empty nombre_actividad', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: '',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: d(1, 14),
        fecha_fin: d(1, 15),
      })
    ).toThrow('El nombre de la actividad es obligatorio')
  })

  it('rejects nombre_actividad exceeding 90 characters', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: 'X'.repeat(91),
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: d(1, 14),
        fecha_fin: d(1, 15),
      })
    ).toThrow('Máximo 90 caracteres')
  })

  it('rejects notas exceeding 1000 characters', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: 'Call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: d(1, 14),
        fecha_fin: d(1, 15),
        notas: 'X'.repeat(1001),
      })
    ).toThrow('Máximo 1000 caracteres')
  })

  it('ignores id_responsable (field removed in schema)', () => {
    const result = actividadSchema.parse({
      id_lead: 10,
      nombre_actividad: 'Call',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
      fecha_inicio: d(1, 14),
      fecha_fin: d(1, 15),
      id_responsable: 0,
    })
    expect(result).not.toHaveProperty('id_responsable')
  })

  it('rejects fecha_fin before fecha_inicio via refine', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: 'Call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: d(1, 15),
        fecha_fin: d(1, 14),
      })
    ).toThrow('La fecha de fin debe ser igual o posterior a la fecha de inicio')
  })

  it('rejects fecha_inicio in the past', () => {
    expect(() =>
      actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: 'Call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2020-01-01T10:00',
        fecha_fin: '2020-01-01T11:00',
      })
    ).toThrow('La fecha de inicio no puede ser en el pasado')
  })

  it('accepts all TipoActividad enum values', () => {
    for (const tipo of Object.values(TipoActividad)) {
      const result = actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: 'Test',
        tipo,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: d(1, 14),
        fecha_fin: d(1, 15),
      })
      expect(result.tipo).toBe(tipo)
    }
  })

  it('accepts all EstadoActividad enum values', () => {
    for (const estado of Object.values(EstadoActividad)) {
      const result = actividadSchema.parse({
        id_lead: 10,
        nombre_actividad: 'Test',
        tipo: TipoActividad.Llamada,
        estado,
        fecha_inicio: d(1, 14),
        fecha_fin: d(1, 15),
      })
      expect(result.estado).toBe(estado)
    }
  })
})
