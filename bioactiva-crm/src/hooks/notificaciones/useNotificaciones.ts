import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificacionesService } from '@/services/modules/notificaciones.service'
import {
  CrearRecordatorioInput,
  CrearSeguimientoInput,
} from '@/types/notificacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

// --- HOOK CENTRO ---
// El centro se compone en cliente (GET /notifications + GET /notifications/in-app).
// `retry: false` evita triplicar requests en errores 4xx del contrato (p. ej. 409).
export function useCentroNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones', 'centro'],
    queryFn:  () => notificacionesService.getCentro(),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 2, // refresca cada 2 minutos
    refetchOnWindowFocus: false,
    retry: false,
  })
}

// --- HOOK LISTADO ---
export function useNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones', 'list'],
    queryFn:  () => notificacionesService.getAll(),
    staleTime: 1000 * 60 * 1,
    retry: false,
  })
}

export function useNotificacionesPorLead(leadId: number) {
  return useQuery({
    queryKey: ['notificaciones', 'lead', leadId],
    queryFn:  () => notificacionesService.getByLead(leadId),
    enabled:  !!leadId,
    staleTime: 1000 * 60 * 1,
    retry: false,
  })
}

// --- HOOK MARCAR LEÍDA ---
export function useMarcarLeida() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificacionesService.marcarLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificacionesService.marcarTodasLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCancelarProgramada() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificacionesService.cancelarProgramada(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCrearRecordatorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CrearRecordatorioInput) =>
      notificacionesService.createRecordatorio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCrearSeguimiento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CrearSeguimientoInput) =>
      notificacionesService.createSeguimiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}
