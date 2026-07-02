import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { leadsService } from '@/services/modules/leads.service'
import { cotizacionesService } from '@/services/modules/cotizaciones.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { Lead, LeadFiltros, LeadFormData, PipelineData } from '@/types/lead.types'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, LeadState } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'
import {
  getCotizacionToResolveLeadClosure,
  getCotizacionStateFromLeadState,
  validateLeadStateTransition,
} from '@/lib/utils/lead-flow.utils'

// Resultado de un cambio de estado: el lead actualizado y, si el backend acaba
// de generar la cotización borrador al pasar a OFERTADO, esa cotización.
export interface CambioEstadoResult {
  lead: Lead
  borrador?: Cotizacion
}

// El backend crea un borrador PENDIENTE al pasar a OFERTADO y no duplica si el
// lead ya tenía cotizaciones. Detectamos el borrador como una cotización
// PENDIENTE nueva (no presente antes del cambio).
function detectarBorrador(
  antes: Cotizacion[],
  despues: Cotizacion[]
): Cotizacion | undefined {
  const idsPrevios = new Set(antes.map((c) => c.id))
  return despues
    .filter((c) => c.estado === EstadoCot.Pendiente && !idsPrevios.has(c.id))
    .sort((a, b) => b.id - a.id)[0]
}

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

const LEAD_COLUMN_LIMIT = 20

export interface PipelineColumn {
  leads: Lead[]
  total: number
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  loadingMore: boolean
  cargarMas: () => void
}

// Una columna del pipeline (un estado) con paginación incremental ("cargar más").
function useLeadColumn(estado: LeadState, filtros?: LeadFiltros): PipelineColumn {
  // El filtro global de estado decide qué columna se muestra: si se eligió un
  // estado distinto al de esta columna, la columna queda vacía (no se consulta).
  const habilitada = !filtros?.estado || filtros.estado === estado

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.leads.column(estado, filtros),
    queryFn: ({ pageParam }) =>
      leadsService.getLeadsColumn(estado, filtros, pageParam, LEAD_COLUMN_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 2,
    enabled: habilitada,
  })

  if (!habilitada) {
    return {
      leads: [],
      total: 0,
      isLoading: false,
      isError: false,
      hasMore: false,
      loadingMore: false,
      cargarMas: () => {},
    }
  }

  return {
    leads: query.data?.pages.flatMap((page) => page.data) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    cargarMas: () => { void query.fetchNextPage() },
  }
}

// Pipeline como 4 columnas independientes (una query paginada por estado).
export function usePipelineColumns(filtros?: LeadFiltros) {
  return {
    prospecto:      useLeadColumn(LeadState.Prospecto, filtros),
    ofertado:       useLeadColumn(LeadState.Ofertado, filtros),
    cierreVenta:    useLeadColumn(LeadState.CierreVenta, filtros),
    cierreSinVenta: useLeadColumn(LeadState.CierreSinVenta, filtros),
  }
}

export function useLeadsByContacto(idContacto: number) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.byContacto(idContacto),
    queryFn:  () => leadsService.getByContacto(idContacto),
    enabled:  !!idContacto,
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

async function syncLeadAndCotizacionState(
  lead: Lead,
  estado: LeadState
): Promise<CambioEstadoResult> {
  const cotizaciones = await cotizacionesService.getByLead(lead.id)
  const guard = validateLeadStateTransition(lead.estado, estado, cotizaciones)

  if (!guard.allowed) {
    throw new Error(guard.reason ?? 'No se puede actualizar el estado del lead.')
  }

  if (estado === LeadState.Ofertado) {
    // No creamos ni enviamos cotizaciones: el backend genera automáticamente la
    // cotización borrador PENDIENTE al pasar a OFERTADO. Solo cambiamos el
    // estado y detectamos el borrador recién creado para enlazar su edición.
    const actualizado = await leadsService.updateEstado(lead.id, estado)
    const cotizacionesActualizadas = await cotizacionesService.getByLead(lead.id)
    return {
      lead: actualizado,
      borrador: detectarBorrador(cotizaciones, cotizacionesActualizadas),
    }
  }

  if (estado === LeadState.CierreVenta || estado === LeadState.CierreSinVenta) {
    // Re-cierre desde otro estado de cierre: la cotización ya es terminal
    // (ACEPTADA/RECHAZADA) y no puede re-transicionarse. El backend permite el
    // cambio de estado directamente vía PATCH /leads/:id/status.
    if (
      lead.estado === LeadState.CierreVenta ||
      lead.estado === LeadState.CierreSinVenta
    ) {
      return { lead: await leadsService.updateEstado(lead.id, estado) }
    }

    const cotizacion = getCotizacionToResolveLeadClosure(estado, cotizaciones)
    if (!cotizacion) throw new Error('No hay una cotización asociada para cerrar el lead.')

    const targetCotState = getCotizacionStateFromLeadState(estado)

    if (cotizacion.estado === targetCotState) {
      return { lead: await leadsService.updateEstado(lead.id, estado) }
    }

    if (estado === LeadState.CierreVenta) {
      await cotizacionesService.aceptar(cotizacion.id)
    } else {
      await cotizacionesService.rechazar(cotizacion.id)
    }

    return { lead: await leadsService.getById(lead.id) }
  }

  return { lead: await leadsService.updateEstado(lead.id, estado) }
}

const PIPELINE_KEY_BY_STATE: Record<
  LeadState,
  'prospecto' | 'ofertado' | 'cierreVenta' | 'cierreSinVenta'
> = {
  [LeadState.Prospecto]:      'prospecto',
  [LeadState.Ofertado]:       'ofertado',
  [LeadState.CierreVenta]:    'cierreVenta',
  [LeadState.CierreSinVenta]: 'cierreSinVenta',
}

function moveLeadInPipeline(
  pipeline: PipelineData | undefined,
  lead: Lead,
  estado: LeadState
): PipelineData | undefined {
  if (!pipeline) return pipeline

  const targetKey = PIPELINE_KEY_BY_STATE[estado]
  const updatedLead = {
    ...lead,
    estado,
    updated_at: new Date().toISOString(),
  }

  return {
    prospecto: pipeline.prospecto.filter((item) => item.id !== lead.id),
    ofertado: pipeline.ofertado.filter((item) => item.id !== lead.id),
    cierreVenta: pipeline.cierreVenta.filter((item) => item.id !== lead.id),
    cierreSinVenta: pipeline.cierreSinVenta.filter((item) => item.id !== lead.id),
    total: pipeline.total,
    [targetKey]: [
      ...pipeline[targetKey].filter((item) => item.id !== lead.id),
      updatedLead,
    ],
  }
}

export function useCrearLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      return leadsService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'column'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
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
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'column'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'column'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'list'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cotizaciones.byLead(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
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
    onSuccess: (_data, leadId) => {
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'column'] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'list'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cotizaciones.byLead(leadId) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
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
    onMutate: async ({ lead, estado }) => {
      await queryClient.cancelQueries({ queryKey: ['leads', 'pipeline'] })

      const previousPipelineQueries =
        queryClient.getQueriesData<PipelineData>({
          queryKey: ['leads', 'pipeline'],
        })
      const previousLead = queryClient.getQueryData<Lead>(
        QUERY_KEYS.leads.detail(lead.id)
      )

      previousPipelineQueries.forEach(([queryKey, pipeline]) => {
        queryClient.setQueryData(
          queryKey,
          moveLeadInPipeline(pipeline, lead, estado)
        )
      })

      queryClient.setQueryData<Lead>(
        QUERY_KEYS.leads.detail(lead.id),
        (current) => current
          ? { ...current, estado, updated_at: new Date().toISOString() }
          : current
      )

      return { previousPipelineQueries, previousLead, leadId: lead.id }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'column'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.detail(variables.lead.id) })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', 'list'] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cotizaciones.byLead(variables.lead.id) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
    },
    onError: (err: unknown, _variables, context) => {
      context?.previousPipelineQueries.forEach(([queryKey, pipeline]) => {
        queryClient.setQueryData(queryKey, pipeline)
      })

      if (context?.previousLead) {
        queryClient.setQueryData(
          QUERY_KEYS.leads.detail(context.leadId),
          context.previousLead
        )
      }

      console.warn(getErrorMessage(err))
    },
  })
}
