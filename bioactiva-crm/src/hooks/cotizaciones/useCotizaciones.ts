import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { CotizacionFiltros, CotizacionFormData } from '@/types/cotizacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

export function useCotizaciones(filtros?: CotizacionFiltros) {
  return useQuery({
    queryKey:        QUERY_KEYS.cotizaciones.list(filtros),
    queryFn:         () => cotizacionesService.getAll(filtros),
    staleTime:       1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

export function useCotizacion(id: number) {
  return useQuery({
    queryKey:  QUERY_KEYS.cotizaciones.detail(id),
    queryFn:   () => cotizacionesService.getById(id),
    enabled:   !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCotizacionKpis() {
  return useQuery({
    queryKey:  ['cotizaciones', 'kpis'],
    queryFn:   () => cotizacionesService.getKpis(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCotizacionesPorLead(leadId: number) {
  return useQuery({
    queryKey:  QUERY_KEYS.cotizaciones.byLead(leadId),
    queryFn:   () => cotizacionesService.getByLead(leadId),
    enabled:   !!leadId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCrearCotizacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CotizacionFormData) => cotizacionesService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'list'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cotizaciones.byLead(variables.id_lead) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.detail(variables.id_lead) })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useActualizarCotizacion(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CotizacionFormData>) =>
      cotizacionesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'list'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cotizaciones.detail(id) })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

function useCotizacionEstadoMutation(
  mutationFn: (id: number) => Promise<unknown>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (_data, cotizacionId) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'lead'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cotizaciones.detail(cotizacionId) })
      queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'column'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useEnviarCotizacion() {
  return useCotizacionEstadoMutation((id) => cotizacionesService.enviar(id))
}

export function useAceptarCotizacion() {
  return useCotizacionEstadoMutation((id) => cotizacionesService.aceptar(id))
}

export function useRechazarCotizacion() {
  return useCotizacionEstadoMutation((id) => cotizacionesService.rechazar(id))
}
