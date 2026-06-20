import { ActivityAlert } from '@/types/lead.types'

// Mapeo visual del semáforo de actividades del lead (backend: activityAlert).
// Escala de color pedida por negocio (de tranquilo a urgente):
//   SIN_ACTIVIDADES → verde · PENDIENTE → amarillo · EN_RIESGO → naranja · POR_VENCER → rojo.
// Las clases se escriben literales para que Tailwind las detecte (no construir dinámicamente).
export interface SemaforoUI {
  label: string
  pill: string    // fondo + texto del badge
  dot: string     // color del punto
  accent: string  // color del borde izquierdo de la tarjeta
  pulse: boolean  // anima el punto en el estado más urgente
}

export const SEMAFORO_UI: Record<ActivityAlert, SemaforoUI> = {
  SIN_ACTIVIDADES: {
    label: 'Sin actividades',
    pill: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    accent: 'border-l-emerald-500',
    pulse: false,
  },
  PENDIENTE: {
    label: 'Pendiente',
    pill: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-400',
    accent: 'border-l-yellow-400',
    pulse: false,
  },
  EN_RIESGO: {
    label: 'En riesgo',
    pill: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    accent: 'border-l-orange-500',
    pulse: false,
  },
  POR_VENCER: {
    label: 'Por vencer',
    pill: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    accent: 'border-l-red-500',
    pulse: true,
  },
}
