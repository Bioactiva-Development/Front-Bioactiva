import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { Lead, LeadFiltros, LeadFormData } from '@/types/lead.types'
import { EstadoCot, LeadState, TipoMoneda } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'
import {
  getCotizacionStateFromLeadState,
  getCotizacionToResolveLeadClosure,
  getPrimaryCotizacion,
  validateLeadStateTransition,
} from '@/lib/utils/lead-flow.utils'
import { CotizacionFormData } from '@/types/cotizacion.types'

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
    observacion:      'Cotización inicial generada automáticamente al crear el lead.',
  }
}

export function useCrearLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const lead = await leadsService.create({
        ...data,
        estado: LeadState.Prospecto,
      })
      await cotizacionesService.create(buildDefaultCotizacion(lead))
      return lead
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
      const targetCotState = getCotizacionStateFromLeadState(estado)

      if (targetCotState) {
        const cotizacion = estado === LeadState.Prospecto ||
          estado === LeadState.Ofertado
          ? getPrimaryCotizacion(cotizaciones)
          : getCotizacionToResolveLeadClosure(estado, cotizaciones)

        if (!cotizacion) {
          if (estado === LeadState.Prospecto || estado === LeadState.Ofertado) {
            await cotizacionesService.create({
              ...buildDefaultCotizacion(lead),
              estado: targetCotState,
            })
            await leadsService.updateEstado(lead.id, estado)
            return
          }

          const reason =
            estado === LeadState.CierreVenta
              ? 'Para cerrar con venta debe existir una cotización enviada o pendiente que pueda aceptarse.'
              : 'Para cerrar sin venta debe existir una cotización enviada o pendiente que pueda rechazarse.'
          throw new Error(reason)
        }

        if (cotizacion.estado !== targetCotState) {
          await cotizacionesService.update(cotizacion.id, {
            estado: targetCotState,
          })
        }

        await leadsService.updateEstado(lead.id, estado)

        return
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
