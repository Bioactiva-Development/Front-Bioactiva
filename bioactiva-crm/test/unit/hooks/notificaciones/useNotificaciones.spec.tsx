import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const getProgramadas = jest.fn()
const getInApp = jest.fn()
const marcarLeida = jest.fn()
const cancelarProgramada = jest.fn()
const createRecordatorio = jest.fn()
const createSeguimiento = jest.fn()

jest.mock('@/services/modules/notificaciones.service', () => ({
  notificacionesService: {
    getProgramadas,
    getInApp,
    marcarLeida,
    cancelarProgramada,
    createRecordatorio,
    createSeguimiento,
  },
}))

import {
  useCancelarProgramada,
  useCrearRecordatorio,
  useCrearSeguimiento,
  useMarcarLeida,
  useNotificacionesInApp,
  useNotificacionesProgramadas,
} from '@/hooks/notificaciones/useNotificaciones'

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('notificaciones hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('loads scheduled notifications with filters', async () => {
    getProgramadas.mockResolvedValueOnce([{ id: 1 }])
    const filtros = { estado: 'PROGRAMADA' as const, idResponsable: 3 }
    const { result } = renderHook(
      () => useNotificacionesProgramadas(filtros),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getProgramadas).toHaveBeenCalledWith(filtros)
  })

  it('does not load scheduled notifications while disabled', () => {
    const filtros = { estado: 'PROGRAMADA' as const, idLead: 0 }
    renderHook(
      () => useNotificacionesProgramadas(filtros, { enabled: false }),
      { wrapper }
    )
    expect(getProgramadas).not.toHaveBeenCalled()
  })

  it('loads the in-app inbox', async () => {
    getInApp.mockResolvedValueOnce([{ id: 2, estado: 'NO_LEIDA' }])
    const { result } = renderHook(() => useNotificacionesInApp(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('marks one notification as read', async () => {
    marcarLeida.mockResolvedValueOnce({ id: 2, estado: 'LEIDA' })
    const { result } = renderHook(() => useMarcarLeida(), { wrapper })
    await act(async () => { await result.current.mutateAsync(2) })
    expect(marcarLeida).toHaveBeenCalledWith(2)
  })

  it('cancels one scheduled notification', async () => {
    cancelarProgramada.mockResolvedValueOnce({ id: 1, estado: 'CANCELADA' })
    const { result } = renderHook(() => useCancelarProgramada(), { wrapper })
    await act(async () => { await result.current.mutateAsync(1) })
    expect(cancelarProgramada).toHaveBeenCalledWith(1)
  })

  it('removes canceled scheduled notifications from cached lists', async () => {
    cancelarProgramada.mockResolvedValueOnce({ id: 1, estado: 'CANCELADA' })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const scheduledKey = ['notificaciones', 'scheduled', { estado: 'PROGRAMADA' }]
    client.setQueryData(scheduledKey, [
      { id: 1, estado: 'PROGRAMADA' },
      { id: 2, estado: 'PROGRAMADA' },
    ])

    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCancelarProgramada(), {
      wrapper: localWrapper,
    })

    await act(async () => { await result.current.mutateAsync(1) })

    expect(client.getQueryData(scheduledKey)).toEqual([
      { id: 2, estado: 'PROGRAMADA' },
    ])
  })

  it('restores cached scheduled notifications when cancellation is rejected', async () => {
    cancelarProgramada.mockRejectedValueOnce(
      Object.assign(new Error('Conflict'), { status: 409 })
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const scheduledKey = ['notificaciones', 'scheduled', { estado: 'PROGRAMADA' }]
    const scheduled = [
      { id: 1, estado: 'PROGRAMADA' },
      { id: 2, estado: 'PROGRAMADA' },
    ]
    client.setQueryData(scheduledKey, scheduled)

    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCancelarProgramada(), {
      wrapper: localWrapper,
    })

    await act(async () => {
      try { await result.current.mutateAsync(1) } catch { /* expected */ }
    })

    expect(client.getQueryData(scheduledKey)).toEqual(scheduled)
  })

  it('creates reminders and follow-ups', async () => {
    createRecordatorio.mockResolvedValueOnce({ id: 1 })
    createSeguimiento.mockResolvedValueOnce({ id: 2 })
    const reminderHook = renderHook(() => useCrearRecordatorio(), { wrapper })
    const followUpHook = renderHook(() => useCrearSeguimiento(), { wrapper })
    const reminder = {
      idLead: 1,
      minutosAntes: 30,
      asunto: 'Aviso',
      cuerpo: 'Cuerpo',
    }
    const followUp = {
      idLead: 1,
      correoCliente: 'cliente@example.com',
      instancias: [],
    }
    await act(async () => {
      await reminderHook.result.current.mutateAsync(reminder)
      await followUpHook.result.current.mutateAsync(followUp)
    })
    expect(createRecordatorio).toHaveBeenCalledWith(reminder)
    expect(createSeguimiento).toHaveBeenCalledWith(followUp)
  })
})
