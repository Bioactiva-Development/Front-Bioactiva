import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { CotizacionFiltros, CotizacionFormData } from '@/types/cotizacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

export function useCotizaciones(filtros?: CotizacionFiltros) {
  return useQuery({
    queryKey: QUERY_KEYS.cotizaciones.list(filtros),
    queryFn:  () => cotizacionesService.getAll(filtros),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCotizacion(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.cotizaciones.detail(id),
    queryFn:  () => cotizacionesService.getById(id),
    enabled:  !!id,
  })
}

export function useCotizacionKpis() {
  return useQuery({
    queryKey: ['cotizaciones', 'kpis'],
    queryFn:  () => cotizacionesService.getKpis(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCotizacionesPorLead(leadId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.cotizaciones.byLead(leadId),
    queryFn:  () => cotizacionesService.getByLead(leadId),
    enabled:  !!leadId,
  })
}

export function useCrearCotizacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CotizacionFormData) =>
      cotizacionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
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
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.cotizaciones.detail(id),
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}