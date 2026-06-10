import { Sector, TamanoEmpresa, TipoEmpresa } from '@/types/enums'
import {
  Organizacion,
  OrganizacionFormData,
  SunatRucResult,
  SunatNombreResult,
} from '@/types/organizacion.types'

/**
 * Mappers entre el modelo de dominio del frontend (snake_case, con enums en
 * español) y los DTOs del backend NestJS (camelCase, enums en MAYUSCULAS_SNAKE).
 *
 * Documentación del contrato: `Documentación de endpoints por módulo > Módulo
 * organizations`. Si el backend ajusta valores de enum (ej. EnterpriseType,
 * Sector, Size), modificar únicamente este archivo.
 */

// ---------------------------------------------------------------------------
// Tipos del backend
// ---------------------------------------------------------------------------

export interface OrganizacionDtoOut {
  id: string
  codigoCliente: string
  nombre: string
  nombreComercial: string
  subArea: string | null
  ruc: string | null
  tipo: string
  linkedin: string | null
  ubicacion: string | null
  sector: string | null
  tamano: string
  actividadEconomica: string | null
  alianzasEstrategicas: string | null
  idContactoActivo: number | null
  idAuthor: number
  createdAt: string
  updatedAt: string
}

export interface OrganizacionCreateDto {
  codigoCliente: string
  nombre: string
  nombreComercial: string
  tipo: string
  tamano: string
  idAuthor: number
  // Campos opcionales: el backend valida con @MinLength(1). Solo enviar si hay
  // contenido real; nunca null ni "".
  subArea?: string
  ruc?: string
  linkedin?: string
  ubicacion?: string
  sector?: string
  actividadEconomica?: string
  alianzasEstrategicas?: string
  idContactoActivo?: number
}

export type OrganizacionUpdateDto = Partial<Omit<OrganizacionCreateDto, 'idAuthor'>>

export interface ContactoResumidoDto {
  id:        number
  nombres:   string
  apellidos: string
  vocativo?: string
  cargo?:    string | null
  correo:    string
  telefono?: string | null
}

export interface OrganizacionConRelacionesDto extends OrganizacionDtoOut {
  contactos?:      ContactoResumidoDto[]
  totalContactos?: number
}

export interface SunatRucDto {
  ruc: string
  razonSocial: string
  nombreComercial?: string
  tipo?: string
  ubicacion?: string
  actividadEconomica?: string
  tamano?: string
  sector?: string
}

// ---------------------------------------------------------------------------
// Enums dominio <-> backend
// ---------------------------------------------------------------------------

/**
 * Enum EnterpriseType del backend (confirmado por el endpoint POST /organizations):
 * ACADEMIA | EMPRESA_INTERNACIONAL | EMPRESA_NACIONAL | GOBIERNO_NACIONAL
 * | INDEPENDIENTE | ONG | ORGANISMO_INTERNACIONAL
 *
 * El frontend solo modela 4 tipos según el Documento de Análisis y Diseño v1.6
 * (Privada/Publica/ONG/Mixta). El mapeo es aproximado mientras se cierra la
 * lista cerrada con el equipo backend.
 */
const TIPO_DOMAIN_TO_BACKEND: Record<TipoEmpresa, string> = {
  [TipoEmpresa.Privada]: 'EMPRESA_NACIONAL',
  [TipoEmpresa.Publica]: 'GOBIERNO_NACIONAL',
  [TipoEmpresa.ONG]: 'ONG',
  [TipoEmpresa.Mixta]: 'ORGANISMO_INTERNACIONAL',
}

const TIPO_BACKEND_TO_DOMAIN: Record<string, TipoEmpresa> = {
  ACADEMIA: TipoEmpresa.Publica,
  EMPRESA_INTERNACIONAL: TipoEmpresa.Privada,
  EMPRESA_NACIONAL: TipoEmpresa.Privada,
  GOBIERNO_NACIONAL: TipoEmpresa.Publica,
  INDEPENDIENTE: TipoEmpresa.Privada,
  ONG: TipoEmpresa.ONG,
  ORGANISMO_INTERNACIONAL: TipoEmpresa.Mixta,
}

const TAMANO_DOMAIN_TO_BACKEND: Record<TamanoEmpresa, string> = {
  [TamanoEmpresa.Micro]: 'MICRO',
  [TamanoEmpresa.Pequena]: 'PEQUENO',
  [TamanoEmpresa.Mediana]: 'MEDIANO',
  [TamanoEmpresa.Grande]: 'GRANDE',
}

const TAMANO_BACKEND_TO_DOMAIN: Record<string, TamanoEmpresa> = {
  MICRO: TamanoEmpresa.Micro,
  PEQUENO: TamanoEmpresa.Pequena,
  MEDIANO: TamanoEmpresa.Mediana,
  GRANDE: TamanoEmpresa.Grande,
}

// Los valores del enum `Sector` coinciden 1:1 con los del backend, por lo que
// el mapeo es identidad. Se generan dinámicamente para cubrir toda la lista.
const SECTOR_DOMAIN_TO_BACKEND = Object.fromEntries(
  Object.values(Sector).map((s) => [s, s]),
) as Record<Sector, string>

const SECTOR_BACKEND_TO_DOMAIN = Object.fromEntries(
  Object.values(Sector).map((s) => [s, s]),
) as Record<string, Sector>

const safeMap = <K extends string, V>(table: Record<string, V>, key: K, fallback: V): V =>
  table[key] ?? fallback

// ---------------------------------------------------------------------------
// Mappers DTO <-> dominio
// ---------------------------------------------------------------------------

export const fromOrganizacionDto = (dto: OrganizacionDtoOut): Organizacion => ({
  id: dto.id,
  codigo_cliente: dto.codigoCliente,
  nombre: dto.nombre,
  nombre_comercial: dto.nombreComercial,
  sub_area: dto.subArea ?? undefined,
  ruc: dto.ruc ?? undefined,
  tipo: safeMap(TIPO_BACKEND_TO_DOMAIN, dto.tipo, TipoEmpresa.Privada),
  linkedin: dto.linkedin ?? undefined,
  ubicacion: dto.ubicacion ?? undefined,
  sector: dto.sector
    ? safeMap(SECTOR_BACKEND_TO_DOMAIN, dto.sector, Sector.OTROS)
    : Sector.OTROS,
  tamano: safeMap(TAMANO_BACKEND_TO_DOMAIN, dto.tamano, TamanoEmpresa.Micro),
  actividad_economica: dto.actividadEconomica ?? undefined,
  alianzas_estrategicas: dto.alianzasEstrategicas ?? undefined,
  id_contacto_activo: dto.idContactoActivo ?? undefined,
  id_author: dto.idAuthor,
  created_at: dto.createdAt,
  updated_at: dto.updatedAt,
})

/**
 * El backend valida campos opcionales con `@MinLength(1)`, por lo que `null` o
 * `""` provocan 400. La estrategia es **omitir** la propiedad del payload
 * cuando el usuario no la completó, en vez de enviar `null`.
 */
const trimOrUndefined = (v?: string | null): string | undefined => {
  if (v == null) return undefined
  const t = v.trim()
  return t.length > 0 ? t : undefined
}

export const toCreateOrganizacionDto = (
  data: OrganizacionFormData,
  idAuthor: number
): OrganizacionCreateDto => {
  const dto: OrganizacionCreateDto = {
    codigoCliente: data.codigo_cliente ?? '',
    nombre: data.nombre,
    nombreComercial: data.nombre_comercial?.trim() || data.nombre,
    tipo: TIPO_DOMAIN_TO_BACKEND[data.tipo],
    tamano: TAMANO_DOMAIN_TO_BACKEND[data.tamano],
    idAuthor,
  }

  // Campos opcionales: solo se incluyen si tienen contenido real.
  const subArea = trimOrUndefined(data.sub_area)
  if (subArea !== undefined) dto.subArea = subArea
  const ruc = trimOrUndefined(data.ruc)
  if (ruc !== undefined) dto.ruc = ruc
  const linkedin = trimOrUndefined(data.linkedin)
  if (linkedin !== undefined) dto.linkedin = linkedin
  const ubicacion = trimOrUndefined(data.ubicacion)
  if (ubicacion !== undefined) dto.ubicacion = ubicacion
  if (data.sector !== undefined)
    dto.sector = SECTOR_DOMAIN_TO_BACKEND[data.sector]
  const actEcon = trimOrUndefined(data.actividad_economica)
  if (actEcon !== undefined) dto.actividadEconomica = actEcon
  const alianzas = trimOrUndefined(data.alianzas_estrategicas)
  if (alianzas !== undefined) dto.alianzasEstrategicas = alianzas
  if (data.id_contacto_activo !== undefined && data.id_contacto_activo !== null)
    dto.idContactoActivo = data.id_contacto_activo

  return dto
}

export const toUpdateOrganizacionDto = (
  data: Partial<OrganizacionFormData>
): OrganizacionUpdateDto => {
  const dto: OrganizacionUpdateDto = {}
  if (data.codigo_cliente !== undefined) dto.codigoCliente = data.codigo_cliente
  if (data.nombre !== undefined) dto.nombre = data.nombre
  if (data.nombre_comercial !== undefined) dto.nombreComercial = data.nombre_comercial
  if (data.tipo !== undefined) dto.tipo = TIPO_DOMAIN_TO_BACKEND[data.tipo]
  if (data.tamano !== undefined) dto.tamano = TAMANO_DOMAIN_TO_BACKEND[data.tamano]

  // Opcionales: solo enviar si tienen contenido real.
  const subArea = trimOrUndefined(data.sub_area)
  if (subArea !== undefined) dto.subArea = subArea
  const ruc = trimOrUndefined(data.ruc)
  if (ruc !== undefined) dto.ruc = ruc
  const linkedin = trimOrUndefined(data.linkedin)
  if (linkedin !== undefined) dto.linkedin = linkedin
  const ubicacion = trimOrUndefined(data.ubicacion)
  if (ubicacion !== undefined) dto.ubicacion = ubicacion
  if (data.sector !== undefined) dto.sector = SECTOR_DOMAIN_TO_BACKEND[data.sector]
  const actEcon = trimOrUndefined(data.actividad_economica)
  if (actEcon !== undefined) dto.actividadEconomica = actEcon
  const alianzas = trimOrUndefined(data.alianzas_estrategicas)
  if (alianzas !== undefined) dto.alianzasEstrategicas = alianzas
  if (data.id_contacto_activo !== undefined && data.id_contacto_activo !== null)
    dto.idContactoActivo = data.id_contacto_activo

  return dto
}

// ---------------------------------------------------------------------------
// SUNAT
// ---------------------------------------------------------------------------

export const fromSunatRucDto = (dto: SunatRucDto): SunatRucResult => ({
  ruc: dto.ruc,
  nombre: dto.razonSocial,
  nombreCompleto: dto.nombreComercial ?? dto.razonSocial,
  tipo: dto.tipo
    ? safeMap(TIPO_BACKEND_TO_DOMAIN, dto.tipo, TipoEmpresa.Privada)
    : undefined,
  ubicacion: dto.ubicacion,
  estado: undefined,
  condicion: undefined,
  actividades: dto.actividadEconomica,
  tamano: dto.tamano
    ? safeMap(TAMANO_BACKEND_TO_DOMAIN, dto.tamano, TamanoEmpresa.Micro)
    : undefined,
  sector: dto.sector
    ? safeMap(SECTOR_BACKEND_TO_DOMAIN, dto.sector, Sector.OTROS)
    : undefined,
})

export const fromSunatNombreDto = (dto: SunatRucDto): SunatNombreResult => ({
  ruc: dto.ruc,
  nombre: dto.razonSocial,
  ubicacion: dto.ubicacion,
  estado: undefined,
})
