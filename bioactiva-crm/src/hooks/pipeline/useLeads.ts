import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { Lead, LeadFiltros, LeadFormData } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'
import {
  getCotizacionStateFromLeadClosure,
  getCotizacionToResolveLeadClosure,
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

export function useCrearLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LeadFormData) => leadsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useActualizarLead(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<LeadFormData>) =>
      leadsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useActualizarEstadoLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: LeadState }) =>
      leadsService.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
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
      const targetCotState = getCotizacionStateFromLeadClosure(estado)

      if (targetCotState) {
        const cotizacion = getCotizacionToResolveLeadClosure(
          estado,
          cotizaciones
        )

        if (!cotizacion) {
          const reason = estado === LeadState.CierreVenta
            ? 'Para cerrar con venta debe existir una cotización enviada o pendiente que pueda aceptarse.'
            : 'Para cerrar sin venta debe existir una cotización enviada o pendiente que pueda rechazarse.'
          throw new Error(reason)
        }

        if (cotizacion.estado !== targetCotState) {
          await cotizacionesService.update(cotizacion.id, {
            estado: targetCotState,
          })
          return
        }
      } else {
        const guard = validateLeadStateTransition(estado, cotizaciones)
        if (!guard.allowed) {
          throw new Error(guard.reason ?? 'No se puede mover el lead a ese estado.')
        }
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
