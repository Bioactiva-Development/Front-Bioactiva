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
 *
 * TODO(coord-backend): confirmar los valores exactos de los enums `EnterpriseType`,
 * `Sector` y `Size` cuando el equipo backend publique la lista cerrada.
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
}

export type OrganizacionUpdateDto = Partial<Omit<OrganizacionCreateDto, 'idAuthor'>>

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

const TIPO_DOMAIN_TO_BACKEND: Record<TipoEmpresa, string> = {
  [TipoEmpresa.Privada]: 'EMPRESA_PRIVADA',
  [TipoEmpresa.Publica]: 'EMPRESA_PUBLICA',
  [TipoEmpresa.ONG]: 'ONG',
  [TipoEmpresa.Mixta]: 'EMPRESA_MIXTA',
}

const TIPO_BACKEND_TO_DOMAIN: Record<string, TipoEmpresa> = {
  EMPRESA_PRIVADA: TipoEmpresa.Privada,
  EMPRESA_PUBLICA: TipoEmpresa.Publica,
  ONG: TipoEmpresa.ONG,
  EMPRESA_MIXTA: TipoEmpresa.Mixta,
  EMPRESA_NACIONAL: TipoEmpresa.Privada, // valor visto en la doc; mapeo provisional
  INDEPENDIENTE: TipoEmpresa.Privada,
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

const SECTOR_DOMAIN_TO_BACKEND: Record<Sector, string> = {
  [Sector.Agroindustria]: 'AGROINDUSTRIA',
  [Sector.Manufactura]: 'MANUFACTURA',
  [Sector.Tecnologia]: 'TECNOLOGIA',
  [Sector.Salud]: 'SALUD',
  [Sector.Educacion]: 'EDUCACION',
  [Sector.OtroSector]: 'OTROS',
}

const SECTOR_BACKEND_TO_DOMAIN: Record<string, Sector> = {
  AGROINDUSTRIA: Sector.Agroindustria,
  MANUFACTURA: Sector.Manufactura,
  TECNOLOGIA: Sector.Tecnologia,
  SALUD: Sector.Salud,
  EDUCACION: Sector.Educacion,
  OTROS: Sector.OtroSector,
  OTRO: Sector.OtroSector,
}

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
    ? safeMap(SECTOR_BACKEND_TO_DOMAIN, dto.sector, Sector.OtroSector)
    : Sector.OtroSector,
  tamano: safeMap(TAMANO_BACKEND_TO_DOMAIN, dto.tamano, TamanoEmpresa.Micro),
  actividad_economica: dto.actividadEconomica ?? undefined,
  alianzas_estrategicas: dto.alianzasEstrategicas ?? undefined,
  id_contacto_activo: dto.idContactoActivo ?? undefined,
  id_author: dto.idAuthor,
  created_at: dto.createdAt,
  updated_at: dto.updatedAt,
})

export const toCreateOrganizacionDto = (
  data: OrganizacionFormData,
  idAuthor: number
): OrganizacionCreateDto => ({
  codigoCliente: data.codigo_cliente ?? '',
  nombre: data.nombre,
  nombreComercial: data.nombre_comercial ?? data.nombre,
  subArea: data.sub_area ?? null,
  ruc: data.ruc && data.ruc.length > 0 ? data.ruc : null,
  tipo: TIPO_DOMAIN_TO_BACKEND[data.tipo],
  linkedin: data.linkedin ?? null,
  ubicacion: data.ubicacion ?? null,
  sector: data.sector ? SECTOR_DOMAIN_TO_BACKEND[data.sector] : null,
  tamano: TAMANO_DOMAIN_TO_BACKEND[data.tamano],
  actividadEconomica: data.actividad_economica ?? null,
  alianzasEstrategicas: data.alianzas_estrategicas ?? null,
  idContactoActivo: data.id_contacto_activo ?? null,
  idAuthor,
})

export const toUpdateOrganizacionDto = (
  data: Partial<OrganizacionFormData>
): OrganizacionUpdateDto => {
  const dto: OrganizacionUpdateDto = {}
  if (data.codigo_cliente !== undefined) dto.codigoCliente = data.codigo_cliente
  if (data.nombre !== undefined) dto.nombre = data.nombre
  if (data.nombre_comercial !== undefined) dto.nombreComercial = data.nombre_comercial
  if (data.sub_area !== undefined) dto.subArea = data.sub_area || null
  if (data.ruc !== undefined) dto.ruc = data.ruc && data.ruc.length > 0 ? data.ruc : null
  if (data.tipo !== undefined) dto.tipo = TIPO_DOMAIN_TO_BACKEND[data.tipo]
  if (data.linkedin !== undefined) dto.linkedin = data.linkedin || null
  if (data.ubicacion !== undefined) dto.ubicacion = data.ubicacion || null
  if (data.sector !== undefined) dto.sector = SECTOR_DOMAIN_TO_BACKEND[data.sector]
  if (data.tamano !== undefined) dto.tamano = TAMANO_DOMAIN_TO_BACKEND[data.tamano]
  if (data.actividad_economica !== undefined)
    dto.actividadEconomica = data.actividad_economica || null
  if (data.alianzas_estrategicas !== undefined)
    dto.alianzasEstrategicas = data.alianzas_estrategicas || null
  if (data.id_contacto_activo !== undefined)
    dto.idContactoActivo = data.id_contacto_activo ?? null
  return dto
}

// ---------------------------------------------------------------------------
// SUNAT
// ---------------------------------------------------------------------------

export const fromSunatRucDto = (dto: SunatRucDto): SunatRucResult => ({
  ruc: dto.ruc,
  nombre: dto.razonSocial,
  nombreCompleto: dto.nombreComercial ?? dto.razonSocial,
  ubicacion: dto.ubicacion,
  estado: undefined,
  condicion: undefined,
  actividades: dto.actividadEconomica,
})

export const fromSunatNombreDto = (dto: SunatRucDto): SunatNombreResult => ({
  ruc: dto.ruc,
  nombre: dto.razonSocial,
  ubicacion: dto.ubicacion,
  estado: undefined,
})
