import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { Lead, LeadFiltros, LeadFormData } from '@/types/lead.types'
import { EstadoCot, LeadState, TipoMoneda } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'
import {
  getCotizacionStateFromLeadState,
  getPrimaryCotizacion,
  validateLeadStateTransition,
} from '@/lib/utils/lead-flow.utils'
import { Cotizacion, CotizacionFormData } from '@/types/cotizacion.types'

export function usePipeline(filtros?: LeadFiltros) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.pipeline(filtros),
    queryFn:  () => leadsService.getPipeline(filtros),
    staleTime: 1000 * 60 * 2,
  })
}

export function useLeads(filtros?: LeadFiltros) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.list(filtros),
    queryFn:  () => leadsService.getAll(filtros),
    staleTime: 1000 * 60 * 2,
  })
}

export function useLead(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.detail(id),
    queryFn:  () => leadsService.getById(id),
    enabled:  !!id,
  })
}

function buildDefaultCotizacion(lead: Lead): CotizacionFormData {
  const now = new Date().toISOString()

  return {
    id_lead:          lead.id,
    id_remitente:     lead.id_encargado,
    fecha_cot:        now,
    dirigido:         lead.contacto_nombre ?? 'Contacto por definir',
    cliente:          lead.organizacion_nombre ?? 'Organización por definir',
    producto:         lead.servicio_interes,
    nombre_remitente: lead.encargado_nombre ?? 'Responsable asignado',
    nombre_servicio:  lead.servicio_interes,
    monto:            0,
    tipo:             TipoMoneda.Soles,
    estado:           EstadoCot.Pendiente,
    observacion:      'Cotización generada automáticamente al avanzar el lead en el pipeline.',
  }
}

function canMoveCotizacionToState(
  cotizacion: Cotizacion,
  targetState: EstadoCot
) {
  if (cotizacion.estado === targetState) return true
  if (targetState === EstadoCot.Pendiente) return false

  if (cotizacion.estado === EstadoCot.Pendiente) return true
  if (
    cotizacion.estado === EstadoCot.Enviada &&
    (targetState === EstadoCot.Aceptada || targetState === EstadoCot.Rechazada)
  ) {
    return true
  }

  return false
}

async function ensurePrimaryCotizacionInState(
  lead: Lead,
  cotizaciones: Cotizacion[],
  targetState: EstadoCot
) {
  const primaryCotizacion = getPrimaryCotizacion(cotizaciones)

  if (!primaryCotizacion) {
    return cotizacionesService.create({
      ...buildDefaultCotizacion(lead),
      estado: targetState,
    })
  }

  if (primaryCotizacion.estado === targetState) {
    return primaryCotizacion
  }

  if (canMoveCotizacionToState(primaryCotizacion, targetState)) {
    return cotizacionesService.update(primaryCotizacion.id, {
      estado: targetState,
    })
  }

  await cotizacionesService.delete(primaryCotizacion.id)

  return cotizacionesService.create({
    ...buildDefaultCotizacion(lead),
    estado: targetState,
    observacion:
      'Nueva cotización generada automáticamente para mantener coherencia con el pipeline.',
  })
}

async function syncPrimaryCotizacionWithLead(lead: Lead) {
  const cotizacionState = getCotizacionStateFromLeadState(lead.estado)
  if (!cotizacionState) return

  const cotizaciones = await cotizacionesService.getByLead(lead.id)

  await ensurePrimaryCotizacionInState(lead, cotizaciones, cotizacionState)
}

async function syncLeadAndCotizacionState(lead: Lead, estado: LeadState) {
  const targetCotState = getCotizacionStateFromLeadState(estado)

  if (targetCotState) {
    const cotizaciones = await cotizacionesService.getByLead(lead.id)
    await ensurePrimaryCotizacionInState(lead, cotizaciones, targetCotState)
  }

  const updatedLead = await leadsService.updateEstado(lead.id, estado)

  return updatedLead
}

export function useCrearLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const lead = await leadsService.create(data)
      await syncPrimaryCotizacionWithLead(lead)
      return lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
    },
  })
}

export function useActualizarLead(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<LeadFormData>) => {
      const lead = await leadsService.update(id, data)
      await syncPrimaryCotizacionWithLead(lead)
      return lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useActualizarEstadoLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: LeadState }) => {
      const lead = await leadsService.getById(id)
      return syncLeadAndCotizacionState(lead, estado)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useEliminarLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useMoverLeadPipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ lead, estado }: { lead: Lead; estado: LeadState }) => {
      const cotizaciones = await cotizacionesService.getByLead(lead.id)
      const guard = validateLeadStateTransition(estado, cotizaciones)

      if (!guard.allowed) {
        throw new Error(guard.reason ?? 'No se puede mover el lead a ese estado.')
      }

      const targetCotState = getCotizacionStateFromLeadState(estado)

      if (targetCotState) {
        await ensurePrimaryCotizacionInState(lead, cotizaciones, targetCotState)
      }

      await leadsService.updateEstado(lead.id, estado)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}
