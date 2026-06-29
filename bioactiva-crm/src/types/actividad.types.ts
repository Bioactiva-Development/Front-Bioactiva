import { TipoActividad, EstadoActividad } from './enums'

export interface Actividad {
  id:                    number
  id_lead:               number
  id_responsable:        number
  nombre_actividad:      string
  fecha_inicio:          string
  fecha_fin:             string
  tipo:                  TipoActividad
  estado:                EstadoActividad
  notas?:                string
  outlook_event_id?:     string
  outlook_imported:      boolean
  teamsMeetingUrl?:      string
  seguimiento_automatico: boolean
  id_author:             number
  created_at:            string
  updated_at:            string
  responsable_nombre?:   string
  lead_servicio_interes?: string
  lead_estado?:          string
}

export interface ComentarioActividad {
  id:           number
  id_actividad: number
  texto:        string
  autor:        string
  created_at:   string
}

export interface ActividadFormData {
  id_lead:          number
  nombre_actividad: string
  fecha_inicio:     string
  fecha_fin:        string
  tipo:             TipoActividad
  estado?:          EstadoActividad
  notas?:           string
}

export interface ActividadFiltros {
  id_lead?:        number
  estado?:         EstadoActividad
  tipo?:           TipoActividad
  id_responsable?: number
  page?:           number
  limit?:          number
}
