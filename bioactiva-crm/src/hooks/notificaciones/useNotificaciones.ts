import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificacionesService } from '@/services/modules/notificaciones.service'
import { NotificacionProgramada } from '@/types/notificacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

// --- HOOK CENTRO ---
// Mientras el módulo `notifications` del backend siga "Pendiente", el service
// retorna un centro vacío en 404 sin propagar error. Usamos `retry: false`
// para evitar 3 reintentos consecutivos por cada poll, y `refetchOnWindowFocus`
// se mantiene desactivado para reducir tráfico cuando el módulo no aporta data.
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
