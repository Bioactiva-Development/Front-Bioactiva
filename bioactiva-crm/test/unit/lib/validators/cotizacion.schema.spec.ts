import { cotizacionSchema } from '@/lib/validators/cotizacion.schema'
import { TipoMoneda } from '@/types/enums'

describe('validators/cotizacion.schema', () => {
  it('accepts valid cotizacion data', () => {
    const result = cotizacionSchema.parse({
      id_lead: 2,
      id_remitente: 1,
      fecha_cot: '2026-06-02',
      dirigido: 'Valeria Torres',
      nombre_servicio: 'Deducción I+D+i',
      monto: 6500,
      tipo: TipoMoneda.Soles,
    })
    expect(result.dirigido).toBe('Valeria Torres')
    expect(result.monto).toBe(6500)
    expect(result.tipo).toBe(TipoMoneda.Soles)
  })

  it('accepts all optional fields', () => {
    const result = cotizacionSchema.parse({
      id_lead: 2,
      id_remitente: 1,
      fecha_cot: '2026-06-02',
      dirigido: 'Valeria Torres',
      nombre_servicio: 'Deducción I+D+i',
      monto: 6500,
      tipo: TipoMoneda.Soles,
      cliente: 'Banco de Crédito',
      producto: 'Ley 30309',
      observacion: 'Cotización inicial',
      link_propuesta: 'https://drive.google.com/doc',
    })
    expect(result.cliente).toBe('Banco de Crédito')
    expect(result.observacion).toBe('Cotización inicial')
  })

  it('accepts empty optional strings', () => {
    const result = cotizacionSchema.parse({
      id_lead: 2,
      id_remitente: 1,
      fecha_cot: '2026-06-02',
      dirigido: 'Valeria Torres',
      nombre_servicio: 'Deducción I+D+i',
      monto: 0,
      tipo: TipoMoneda.Soles,
      cliente: '',
      producto: '',
      observacion: '',
      link_propuesta: '',
    })
    expect(result.monto).toBe(0)
    expect(result.cliente).toBe('')
  })

  it('rejects monto < 0', () => {
    expect(() =>
      cotizacionSchema.parse({
        id_lead: 2,
        id_remitente: 1,
        fecha_cot: '2026-06-02',
        dirigido: 'Valeria Torres',
        nombre_servicio: 'Deducción I+D+i',
        monto: -100,
        tipo: TipoMoneda.Soles,
      })
    ).toThrow('El monto debe ser mayor o igual a 0')
  })

  it('rejects empty dirigido', () => {
    expect(() =>
      cotizacionSchema.parse({
        id_lead: 2,
        id_remitente: 1,
        fecha_cot: '2026-06-02',
        dirigido: '',
        nombre_servicio: 'Deducción I+D+i',
        monto: 6500,
        tipo: TipoMoneda.Soles,
      })
    ).toThrow('El campo dirigido es obligatorio')
  })

  it('rejects empty nombre_servicio', () => {
    expect(() =>
      cotizacionSchema.parse({
        id_lead: 2,
        id_remitente: 1,
        fecha_cot: '2026-06-02',
        dirigido: 'Valeria Torres',
        nombre_servicio: '',
        monto: 6500,
        tipo: TipoMoneda.Soles,
      })
    ).toThrow('El nombre del servicio es obligatorio')
  })

  it('rejects id_lead = 0', () => {
    expect(() =>
      cotizacionSchema.parse({
        id_lead: 0,
        id_remitente: 1,
        fecha_cot: '2026-06-02',
        dirigido: 'Valeria Torres',
        nombre_servicio: 'Deducción I+D+i',
        monto: 6500,
        tipo: TipoMoneda.Soles,
      })
    ).toThrow('El lead es obligatorio')
  })

  it('rejects missing id_remitente', () => {
    expect(() =>
      cotizacionSchema.parse({
        id_lead: 2,
        fecha_cot: '2026-06-02',
        dirigido: 'Valeria Torres',
        nombre_servicio: 'Deducción I+D+i',
        monto: 6500,
        tipo: TipoMoneda.Soles,
      })
    ).toThrow()
  })

  it('accepts both TipoMoneda values', () => {
    const pen = cotizacionSchema.parse({
      id_lead: 2, id_remitente: 1, fecha_cot: '2026-06-02',
      dirigido: 'Test', nombre_servicio: 'Srv', monto: 100, tipo: TipoMoneda.Soles,
    })
    expect(pen.tipo).toBe(TipoMoneda.Soles)

    const usd = cotizacionSchema.parse({
      id_lead: 2, id_remitente: 1, fecha_cot: '2026-06-02',
      dirigido: 'Test', nombre_servicio: 'Srv', monto: 100, tipo: TipoMoneda.Dolares,
    })
    expect(usd.tipo).toBe(TipoMoneda.Dolares)
  })

  it('rejects strings exceeding max length', () => {
    expect(() =>
      cotizacionSchema.parse({
        id_lead: 2, id_remitente: 1, fecha_cot: '2026-06-02',
        dirigido: 'X'.repeat(91),
        nombre_servicio: 'Srv', monto: 100, tipo: TipoMoneda.Soles,
      })
    ).toThrow('Máximo 90 caracteres')

    expect(() =>
      cotizacionSchema.parse({
        id_lead: 2, id_remitente: 1, fecha_cot: '2026-06-02',
        dirigido: 'Test', nombre_servicio: 'X'.repeat(151), monto: 100, tipo: TipoMoneda.Soles,
      })
    ).toThrow('Máximo 150 caracteres')
  })
})
