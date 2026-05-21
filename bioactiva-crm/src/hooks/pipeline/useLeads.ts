import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { LeadFiltros, LeadFormData } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'

export function usePipeline(filtros?: LeadFiltros) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.pipeline(),
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