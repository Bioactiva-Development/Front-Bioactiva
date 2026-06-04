import { z } from 'zod'
import { TipoActividad } from '@/types/enums'

// `estado` no se incluye: el backend siempre crea actividades con PENDIENTE.
export const actividadSchema = z
  .object({
    id_lead: z
      .number({ error: 'El lead es obligatorio' }),

    id_responsable: z
      .number({ error: 'El responsable es obligatorio' })
      .min(1, 'El responsable es obligatorio'),

    nombre_actividad: z
      .string()
      .min(1, 'El nombre de la actividad es obligatorio')
      .max(90, 'Máximo 90 caracteres'),

    tipo: z.nativeEnum(TipoActividad, {
      error: 'El tipo de actividad es obligatorio',
    }),

    fecha_inicio: z
      .string()
      .min(1, 'La fecha de inicio es obligatoria'),

    fecha_fin: z
      .string()
      .min(1, 'La fecha de fin es obligatoria'),

    notas: z
      .string()
      .max(1000, 'Máximo 1000 caracteres')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.fecha_inicio || !data.fecha_fin) return true
      // El backend exige fechaInicio estrictamente antes de fechaFin
      return new Date(data.fecha_fin) > new Date(data.fecha_inicio)
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path:    ['fecha_fin'],
    }
  )

export type ActividadFormValues = z.infer<typeof actividadSchema>
