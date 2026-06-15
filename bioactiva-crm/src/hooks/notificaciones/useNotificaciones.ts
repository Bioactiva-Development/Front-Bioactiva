import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { notificacionesService } from '@/services/modules/notificaciones.service'
import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
  FiltrosNotificacionesProgramadas,
} from '@/types/notificacion.types'

export function useNotificacionesProgramadas(
  filtros?: FiltrosNotificacionesProgramadas
) {
  return useQuery({
    queryKey: QUERY_KEYS.notificaciones.scheduled(filtros),
    queryFn: () => notificacionesService.getProgramadas(filtros),
    staleTime: 1000 * 60,
  })
}

export function useNotificacionesInApp() {
  return useQuery({
    queryKey: QUERY_KEYS.notificaciones.inApp(),
    queryFn: () => notificacionesService.getInApp(),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  })
}

export function useMarcarLeida() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificacionesService.marcarLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notificaciones.inApp(),
      })
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
      queryClient.invalidateQueries({
        queryKey: ['notificaciones', 'scheduled'],
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCrearRecordatorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CrearRecordatorioRequest) =>
      notificacionesService.createRecordatorio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notificaciones', 'scheduled'],
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}

export function useCrearSeguimiento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CrearSeguimientoRequest) =>
      notificacionesService.createSeguimiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notificaciones', 'scheduled'],
      })
    },
    onError: (err: unknown) => {
      console.error(getErrorMessage(err))
    },
  })
}
