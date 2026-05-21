import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificacionesService } from '@/services/modules/notificaciones.service'
import { NotificacionProgramada } from '@/types/notificacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

// --- HOOK CENTRO ---
export function useCentroNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones', 'centro'],
    queryFn:  () => notificacionesService.getCentro(),
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 2, // refresca cada 2 minutos
  })
}

// --- HOOK LISTADO ---
export function useNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones', 'list'],
    queryFn:  () => notificacionesService.getAll(),
    staleTime: 1000 * 60 * 1,
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
    mutationFn: (data: Partial<NotificacionProgramada>) =>
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
    mutationFn: (data: Partial<NotificacionProgramada>) =>
      notificacionesService.createSeguimiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}