import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { Lead, LeadFiltros, LeadFormData } from '@/types/lead.types'
import { EstadoCot, LeadState } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'
import {
  getCotizacionToOfferLead,
  getCotizacionToResolveLeadClosure,
  getCotizacionStateFromLeadState,
  validateLeadStateTransition,
} from '@/lib/utils/lead-flow.utils'

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

async function syncLeadAndCotizacionState(lead: Lead, estado: LeadState) {
  const cotizaciones = await cotizacionesService.getByLead(lead.id)
  const guard = validateLeadStateTransition(lead.estado, estado, cotizaciones)

  if (!guard.allowed) {
    throw new Error(guard.reason ?? 'No se puede actualizar el estado del lead.')
  }

  if (estado === LeadState.Ofertado) {
    const cotizacion = getCotizacionToOfferLead(cotizaciones)
    if (!cotizacion) throw new Error('No hay una cotización asociada para ofertar el lead.')

    if (cotizacion.estado === EstadoCot.Pendiente) {
      await cotizacionesService.enviar(cotizacion.id)
      return leadsService.getById(lead.id)
    }

    return leadsService.updateEstado(lead.id, estado)
  }

  if (estado === LeadState.CierreVenta || estado === LeadState.CierreSinVenta) {
    const cotizacion = getCotizacionToResolveLeadClosure(estado, cotizaciones)
    if (!cotizacion) throw new Error('No hay una cotización asociada para cerrar el lead.')

    const targetCotState = getCotizacionStateFromLeadState(estado)

    if (cotizacion.estado === targetCotState) {
      return leadsService.updateEstado(lead.id, estado)
    }

    if (estado === LeadState.CierreVenta) {
      await cotizacionesService.aceptar(cotizacion.id)
    } else {
      await cotizacionesService.rechazar(cotizacion.id)
    }

    return leadsService.getById(lead.id)
  }

  return leadsService.updateEstado(lead.id, estado)
}

export function useCrearLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      return leadsService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useActualizarLead(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<LeadFormData>) => {
      return leadsService.update(id, data)
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
      return syncLeadAndCotizacionState(lead, estado)
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
