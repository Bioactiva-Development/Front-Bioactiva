export type CategoriaPantilla =
  | 'Email'
  | 'Reunion'
  | 'Llamada'
  | 'Otro'

export type UsoPlantilla =
  | 'Ambos'
  | 'Solo Recordatorio'
  | 'Solo Seguimiento'

export interface Plantilla {
  id: number
  nombre: string
  asunto: string
  cuerpo: string
  categoria: CategoriaPantilla
  uso: UsoPlantilla
  activo: boolean
  en_uso:boolean    
  autor?: string
  created_at: string
  updated_at: string
}

export interface PlantillaFiltros {
  search?: string
  categoria?: CategoriaPantilla
  activo?: boolean
}

export const VARIABLES_PLANTILLA = [
  { key: '{{nombre_contacto}}',    descripcion: 'Nombre del contacto del lead' },
  { key: '{{nombre_organizacion}}', descripcion: 'Nombre de la organización' },
  { key: '{{servicio_interes}}',   descripcion: 'Servicio de interés del lead' },
  { key: '{{nombre_encargado}}',   descripcion: 'Nombre del encargado del lead' },
  { key: '{{fecha_actividad}}',    descripcion: 'Fecha de la actividad programada' },
  { key: '{{estado_lead}}',        descripcion: 'Estado actual del lead' },
]