import { EstadoCot, TipoMoneda } from './enums'

export interface Cotizacion {
  id:               number
  codigo?:          string        // generado en frontend como fallback
  id_lead:          number
  id_remitente:     number
  fecha_cot:        string
  dirigido:         string
  cliente?:         string | null
  producto?:        string | null
  nombre_remitente: string        // snapshot capturado al crear
  remitente_nombre?: string       // nombre actual vía JOIN
  nombre_servicio:  string
  monto:            number        // parseado desde el string decimal del backend
  tipo:             TipoMoneda
  estado:           EstadoCot
  observacion?:     string | null
  link_propuesta?:  string | null
  id_author:        number
  created_at:       string
  updated_at:       string
  // JOIN fields
  lead_servicio_interes?: string
  lead_estado?:           string
  lead_codigo?:           string   // disponible en mock; no viene del backend real
  contacto_nombre?:       string
  organizacion_nombre?:   string   // no viene del backend real; disponible en mock
  periodo?:               string   // calculado en frontend
}

// estado y nombre_remitente no se incluyen:
//  - estado: el backend siempre crea en PENDIENTE y usa /send /accept /reject
//  - nombre_remitente: el backend lo captura automáticamente de idRemitente
export interface CotizacionFormData {
  id_lead:         number
  id_remitente:    number
  fecha_cot:       string
  dirigido:        string
  cliente?:        string
  producto?:       string
  nombre_servicio: string
  monto:           number
  tipo:            TipoMoneda
  observacion?:    string
  link_propuesta?: string
}

export interface CotizacionFiltros {
  id_lead?:      number
  estado?:       EstadoCot
  id_remitente?: number
  fecha_desde?:  string
  fecha_hasta?:  string
  search?:       string   // búsqueda local en mock; confirmar con backend
  page?:         number
  limit?:        number
}

export interface CotizacionesResponse {
  data:  Cotizacion[]
  total: number
  page:  number
  limit: number
}

export interface CotizacionKpis {
  totalActivo: number
  aceptadas:   number
  enviadas:    number
  conversion:  number
}
