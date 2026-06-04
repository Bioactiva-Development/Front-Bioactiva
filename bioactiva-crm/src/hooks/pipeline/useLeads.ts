import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { LeadFiltros, LeadFormData, PipelineData, Lead } from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'

export function usePipeline() {
  return useQuery({
    queryKey: QUERY_KEYS.leads.pipeline(),
    queryFn:  () => leadsService.getPipeline(),
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

const ESTADO_A_COLUMNA: Record<LeadState, keyof Omit<PipelineData, 'total'>> = {
  [LeadState.Prospecto]:      'prospecto',
  [LeadState.Ofertado]:       'ofertado',
  [LeadState.CierreVenta]:    'cierreVenta',
  [LeadState.CierreSinVenta]: 'cierreSinVenta',
}

// Clave base para pipeline — permite invalidar/cancelar TODAS las variantes de filtro.
const PIPELINE_BASE_KEY = ['leads', 'pipeline']

function applyEstadoMove(
  old: PipelineData,
  id: number,
  estado: LeadState
): PipelineData {
  const cols: Array<keyof Omit<PipelineData, 'total'>> = [
    'prospecto', 'ofertado', 'cierreVenta', 'cierreSinVenta',
  ]
  let movedLead: Lead | undefined
  const newCols = cols.reduce<Partial<PipelineData>>((acc, col) => {
    acc[col] = old[col].filter((l) => {
      if (l.id === id) { movedLead = l; return false }
      return true
    })
    return acc
  }, {})

  if (movedLead) {
    const destCol = ESTADO_A_COLUMNA[estado]
    newCols[destCol] = [...(newCols[destCol] ?? []), { ...movedLead, estado }]
  }

  return { ...old, ...newCols } as PipelineData
}

export function useActualizarEstadoLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: LeadState }) =>
      leadsService.updateEstado(id, estado),

    onMutate: async ({ id, estado }) => {
      // Cancelar todas las variantes activas del pipeline
      await queryClient.cancelQueries({ queryKey: PIPELINE_BASE_KEY })

      // Snapshot de todas las variantes para poder revertir
      const snapshots = queryClient.getQueriesData<PipelineData>({
        queryKey: PIPELINE_BASE_KEY,
      })

      // Actualizar optimistamente todas las variantes en caché
      queryClient.setQueriesData<PipelineData>(
        { queryKey: PIPELINE_BASE_KEY },
        (old) => old ? applyEstadoMove(old, id, estado) : old
      )

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_BASE_KEY })
    },
  })
}