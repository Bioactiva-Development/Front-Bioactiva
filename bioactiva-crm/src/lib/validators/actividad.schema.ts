import { z } from 'zod'
import { EstadoActividad, TipoActividad } from '@/types/enums'

export const actividadSchema = z
  .object({
    id_lead: z
      .number({ error: 'El lead es obligatorio' }),

    // Mantis — el responsable lo asigna el backend (encargado del lead);
    // el form ya no lo captura ni lo envia.

    nombre_actividad: z
      .string()
      .min(1, 'El nombre de la actividad es obligatorio')
      .max(90, 'Máximo 90 caracteres'),

    tipo: z.enum(TipoActividad, {
      error: 'El tipo de actividad es obligatorio',
    }),

    estado: z.enum(EstadoActividad, {
      error: 'El estado es obligatorio',
    }),

    fecha_inicio: z
      .string()
      .min(1, 'La fecha es obligatoria'),

    fecha_fin: z
      .string()
      .min(1, 'La fecha es obligatoria'),

    notas: z
      .string()
      .max(1000, 'Máximo 1000 caracteres')
      .optional()
      .or(z.literal('')),
  })

  .refine(
    (data) => {
      if (!data.fecha_inicio || !data.fecha_fin) return true
      return new Date(data.fecha_fin) >= new Date(data.fecha_inicio)
    },
    {
      message: 'La fecha es obligatoria',
      path:    ['fecha_fin'],
    }
  )

export type ActividadFormValues = z.infer<typeof actividadSchema>
