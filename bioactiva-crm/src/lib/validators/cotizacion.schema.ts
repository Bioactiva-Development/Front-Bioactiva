import { z } from 'zod'
import { TipoMoneda } from '@/types/enums'

// `estado` no se incluye: el backend siempre crea en PENDIENTE.
// `nombre_remitente` no se incluye: el backend lo captura de idRemitente.
export const cotizacionSchema = z.object({
  id_lead: z
    .number({ error: 'El lead es obligatorio' })
    .min(1, 'El lead es obligatorio'),

  id_remitente: z
    .number({ error: 'El remitente es obligatorio' })
    .min(1, 'El remitente es obligatorio'),

  fecha_cot: z
    .string()
    .min(1, 'La fecha es obligatoria'),

  dirigido: z
    .string()
    .min(1, 'El campo dirigido es obligatorio')
    .max(90, 'Máximo 90 caracteres'),

  cliente: z
    .string()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('')),

  producto: z
    .string()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('')),

  nombre_servicio: z
    .string()
    .min(1, 'El nombre del servicio es obligatorio')
    .max(150, 'Máximo 150 caracteres'),

  monto: z
    .number({ error: 'El monto es obligatorio' })
    .min(0, 'El monto debe ser mayor o igual a 0'),

  tipo: z.enum(TipoMoneda, {
    error: 'La moneda es obligatoria',
  }),

  observacion: z
    .string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),

  link_propuesta: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
})

export type CotizacionFormValues = z.infer<typeof cotizacionSchema>
