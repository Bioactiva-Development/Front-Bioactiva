import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { actividadesService } from '@/services/modules/actividades.service'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { ActividadFormData } from '@/types/actividad.types'
import { EstadoActividad, TipoActividad } from '@/types/enums'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { useAuthStore } from '@/store'

export function useActividades(leadId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.actividades.byLead(leadId),
    queryFn:  () => actividadesService.getByLead(leadId),
    enabled:  !!leadId,
  })
}

export function useActividadesCalendario(idResponsable?: number) {
  const filtros = {
    estado: EstadoActividad.Pendiente,
    tipo: TipoActividad.Reunion,
    ...(idResponsable ? { id_responsable: idResponsable } : {}),
  }

  return useQuery({
    queryKey: QUERY_KEYS.actividades.calendar(filtros),
    queryFn: () => actividadesService.getAll(filtros),
    staleTime: 1000 * 60,
  })
}

const invalidateActividadResolution = (
  queryClient: ReturnType<typeof useQueryClient>,
  leadId: number
) => {
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.actividades.byLead(leadId),
  })
  queryClient.invalidateQueries({ queryKey: ['leads'] })
  queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
}

export function useCrearActividad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ActividadFormData) =>
      actividadesService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.actividades.byLead(variables.id_lead),
      })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useActualizarActividad(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id:   number
      data: Partial<ActividadFormData>
    }) => actividadesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.actividades.byLead(leadId),
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCompletarActividad(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notas }: { id: number; notas?: string }) =>
      actividadesService.complete(id, notas),
    onSuccess: () => {
      invalidateActividadResolution(queryClient, leadId)
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCancelarActividad(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => actividadesService.cancel(id),
    onSuccess: () => {
      invalidateActividadResolution(queryClient, leadId)
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCrearEventoCalendario(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => actividadesService.createCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.actividades.byLead(leadId),
      })
      queryClient.invalidateQueries({
        queryKey: ['actividades', 'calendar'],
      })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useEliminarActividad(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => actividadesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.actividades.byLead(leadId),
      })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}


// Mantis #407 — edita el comentario (campo `notas`) de la actividad y refresca
// la lista con la respuesta del backend. Valor unico, sin historial.
export function useEditarNotasActividad(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notas }: { id: number; notas: string }) =>
      actividadesService.updateNotas(id, notas),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.actividades.byLead(leadId),
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useComentarios(actividadId: number) {
  return useQuery({
    queryKey: ['comentarios', actividadId],
    queryFn:  () => actividadesService.getComentarios(actividadId),
    enabled:  !!actividadId,
  })
}

export function useCrearComentario(actividadId: number) {
  const queryClient = useQueryClient()
  const { usuario } = useAuthStore()

  return useMutation({
    mutationFn: (texto: string) =>
      actividadesService.createComentario(
        actividadId,
        texto,
        usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comentarios', actividadId],
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}
