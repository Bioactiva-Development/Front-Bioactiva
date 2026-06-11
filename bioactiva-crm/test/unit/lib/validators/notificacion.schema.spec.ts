import { recordatorioSchema, seguimientoSchema } from '@/lib/validators/notificacion.schema'

describe('validators/notificacion.schema', () => {
  describe('recordatorioSchema', () => {
    it('accepts valid recordatorio data', () => {
      const result = recordatorioSchema.parse({
        id_lead: 10,
        id_actividad: 5,
        id_plantilla: 2,
        fecha_envio: '2026-06-15',
        hora_envio: '10:00',
        asunto: 'Recordatorio de seguimiento',
        cuerpo: 'Estimado, recordatorio para la actividad pendiente.',
      })
      expect(result.id_lead).toBe(10)
      expect(result.asunto).toBe('Recordatorio de seguimiento')
    })

    it('rejects missing lead', () => {
      expect(() =>
        recordatorioSchema.parse({
          id_actividad: 5,
          id_plantilla: 2,
          fecha_envio: '2026-06-15',
          hora_envio: '10:00',
          asunto: 'Test',
          cuerpo: 'Test body',
        })
      ).toThrow()
    })

    it('rejects id_plantilla = 0', () => {
      expect(() =>
        recordatorioSchema.parse({
          id_lead: 10,
          id_actividad: 5,
          id_plantilla: 0,
          fecha_envio: '2026-06-15',
          hora_envio: '10:00',
          asunto: 'Test',
          cuerpo: 'Test body',
        })
      ).toThrow()
    })

    it('rejects empty asunto', () => {
      expect(() =>
        recordatorioSchema.parse({
          id_lead: 10,
          id_actividad: 5,
          id_plantilla: 2,
          fecha_envio: '2026-06-15',
          hora_envio: '10:00',
          asunto: '',
          cuerpo: 'Test body',
        })
      ).toThrow('El asunto es obligatorio')
    })

    it('rejects empty cuerpo', () => {
      expect(() =>
        recordatorioSchema.parse({
          id_lead: 10,
          id_actividad: 5,
          id_plantilla: 2,
          fecha_envio: '2026-06-15',
          hora_envio: '10:00',
          asunto: 'Test',
          cuerpo: '',
        })
      ).toThrow('El cuerpo es obligatorio')
    })

    it('rejects asunto exceeding 255 characters', () => {
      expect(() =>
        recordatorioSchema.parse({
          id_lead: 10,
          id_actividad: 5,
          id_plantilla: 2,
          fecha_envio: '2026-06-15',
          hora_envio: '10:00',
          asunto: 'X'.repeat(256),
          cuerpo: 'Test body',
        })
      ).toThrow('Máximo 255 caracteres')
    })
  })

  describe('seguimientoSchema', () => {
    const validData = {
      id_lead: 10,
      id_actividad: 5,
      id_plantilla_interno: 2,
      fecha_envio_interno: '2026-06-15',
      hora_envio_interno: '10:00',
      asunto_interno: 'Recordatorio interno',
      cuerpo_interno: 'Cuerpo interno',
      id_plantilla_externo: 3,
      fecha_envio_externo: '2026-06-15',
      hora_envio_externo: '11:00',
      asunto_externo: 'Correo al cliente',
      cuerpo_externo: 'Cuerpo externo',
      correo_cliente: 'cliente@example.com',
    }

    it('accepts valid seguimiento data', () => {
      const result = seguimientoSchema.parse(validData)
      expect(result.id_lead).toBe(10)
      expect(result.correo_cliente).toBe('cliente@example.com')
    })

    it('rejects invalid email in correo_cliente', () => {
      expect(() =>
        seguimientoSchema.parse({
          ...validData,
          correo_cliente: 'invalid-email',
        })
      ).toThrow('Correo del cliente inválido')
    })

    it('rejects empty correo_cliente', () => {
      expect(() =>
        seguimientoSchema.parse({
          ...validData,
          correo_cliente: '',
        })
      ).toThrow('El correo del cliente es obligatorio')
    })

    it('rejects fecha_envio_externo before fecha_envio_interno via refine', () => {
      expect(() =>
        seguimientoSchema.parse({
          ...validData,
          fecha_envio_interno: '2026-06-15',
          hora_envio_interno: '11:00',
          fecha_envio_externo: '2026-06-15',
          hora_envio_externo: '10:00',
        })
      ).toThrow('El correo al cliente debe programarse después del recordatorio interno')
    })

    it('accepts same day with interno before externo', () => {
      const result = seguimientoSchema.parse({
        ...validData,
        fecha_envio_interno: '2026-06-15',
        hora_envio_interno: '09:00',
        fecha_envio_externo: '2026-06-15',
        hora_envio_externo: '10:00',
      })
      expect(result.hora_envio_interno).toBe('09:00')
    })
  })
})
