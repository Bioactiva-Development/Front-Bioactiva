'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { RolUsuario } from '@/types/enums'
import { usePerfil } from '@/hooks/perfil/usePerfil'
import { useLeads } from '@/hooks/pipeline/useLeads'
import {
  useCrearRecordatorio,
  useCrearSeguimiento,
  useEditarSeguimiento,
  useNotificacionesProgramadas,
} from '@/hooks/notificaciones/useNotificaciones'
import {
  NotificacionProgramadaItem,
} from '@/components/modules/notificaciones/NotificacionItem'
import { MicrosoftCalendarPanel } from '@/components/modules/notificaciones/MicrosoftCalendarPanel'
import { RecordatorioForm } from '@/components/modules/notificaciones/RecordatorioForm'
import { SeguimientoForm } from '@/components/modules/notificaciones/SeguimientoForm'
import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
  EditarSeguimientoRequest,
  NotificacionProgramada,
  NotificacionesMeta,
} from '@/types/notificacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

type Seccion = 'historial' | 'recordatorio' | 'seguimiento' | 'calendario'

const SECCIONES: ReadonlyArray<{ id: Seccion; label: string }> = [
  { id: 'historial', label: 'Historial' },
  { id: 'recordatorio', label: 'Recordatorio' },
  { id: 'seguimiento', label: 'Seguimiento' },
  { id: 'calendario', label: 'Calendario' },
]

const TITULOS: Record<Seccion, string> = {
  historial: 'Notificaciones',
  recordatorio: 'Recordatorio',
  seguimiento: 'Seguimiento',
  calendario: 'Calendario',
}

const NOTIFICATIONS_PAGE_SIZE = 6

export default function NotificacionesPage() {
  const [seccion, setSeccion] = useState<Seccion>('historial')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [programadasPage, setProgramadasPage] = useState(1)
  const [vencidasPage, setVencidasPage] = useState(1)
  const [seguimientoEditar, setSeguimientoEditar] =
    useState<NotificacionProgramada | null>(null)
  const usuario = useAuthStore((state) => state.usuario)
  const idResponsable =
    usuario?.rol === RolUsuario.Trabajador ? usuario.id : undefined

  const { data: programadasResponse, isLoading: loadingProgramadas } =
    useNotificacionesProgramadas({
      estado: 'PROGRAMADA',
      idResponsable,
      page: programadasPage,
      limit: NOTIFICATIONS_PAGE_SIZE,
    })
  const { data: vencidasResponse, isLoading: loadingVencidas } =
    useNotificacionesProgramadas({
      estado: 'VENCIDA',
      idResponsable,
      page: vencidasPage,
      limit: NOTIFICATIONS_PAGE_SIZE,
    })
  const programadas = programadasResponse?.data ?? []
  const vencidas = vencidasResponse?.data ?? []
  const { data: leadsResponse } = useLeads({ limit: 100 })

  const leads = useMemo(
    () => leadsResponse?.data ?? [],
    [leadsResponse?.data]
  )
  const leadsPorId = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead])),
    [leads]
  )
  const { mutateAsync: crearRecordatorio, isPending: creandoRecordatorio } =
    useCrearRecordatorio()
  const { mutateAsync: crearSeguimiento, isPending: creandoSeguimiento } =
    useCrearSeguimiento()
  const { mutateAsync: editarSeguimiento, isPending: editandoSeguimiento } =
    useEditarSeguimiento()

  const {
    integraciones,
    integracionInfo,
    isLoadingIntegracion,
    desconectarMicrosoft,
  } = usePerfil()

  const resetMessages = () => {
    setFormError(null)
    setSuccessMessage(null)
  }

  const navigate = (next: Seccion) => {
    resetMessages()
    setSeguimientoEditar(null)
    setSeccion(next)
  }

  const iniciarEdicion = (notificacion: NotificacionProgramada) => {
    resetMessages()
    setSeguimientoEditar(notificacion)
    setSeccion('seguimiento')
  }

  const handleRecordatorio = async (values: CrearRecordatorioRequest) => {
    resetMessages()
    try {
      await crearRecordatorio(values)
      setSuccessMessage('Recordatorio programado correctamente.')
      setSeccion('historial')
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo programar el recordatorio.'))
    }
  }

  const handleSeguimiento = async (values: CrearSeguimientoRequest) => {
    resetMessages()
    try {
      await crearSeguimiento(values)
      setSuccessMessage('Seguimiento programado correctamente.')
      setSeccion('historial')
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo programar el seguimiento.'))
    }
  }

  const handleEditarSeguimiento = async (
    id: number,
    values: EditarSeguimientoRequest
  ) => {
    resetMessages()
    try {
      await editarSeguimiento({ id, data: values })
      setSeguimientoEditar(null)
      setSuccessMessage('Seguimiento actualizado correctamente.')
      setSeccion('historial')
    } catch (error) {
      setFormError(getErrorMessage(error, 'No se pudo actualizar el seguimiento.'))
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
          Centro de notificaciones
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          {TITULOS[seccion]}
        </h1>
        {idResponsable && seccion === 'historial' && (
          <p className="mt-1 text-xs text-gray-500">
            Mostrando programaciones asociadas a tu usuario.
          </p>
        )}
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Vistas de notificaciones">
        {SECCIONES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.id)}
            aria-current={seccion === item.id ? 'page' : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
              seccion === item.id
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {formError && seccion === 'historial' && (
        <Feedback tone="error">{formError}</Feedback>
      )}
      {successMessage && (
        <Feedback tone="success">{successMessage}</Feedback>
      )}

      {seccion === 'recordatorio' && (
        <RecordatorioForm
          onSubmit={handleRecordatorio}
          isLoading={creandoRecordatorio}
          error={formError}
          onCancel={() => navigate('historial')}
        />
      )}

      {seccion === 'seguimiento' && (
        <SeguimientoForm
          key={seguimientoEditar?.id ?? 'nuevo'}
          onSubmit={handleSeguimiento}
          onEdit={handleEditarSeguimiento}
          notificacionInicial={seguimientoEditar ?? undefined}
          isLoading={creandoSeguimiento || editandoSeguimiento}
          error={formError}
          onCancel={() => navigate('historial')}
        />
      )}

      {seccion === 'historial' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-950">
              Historial de notificaciones
            </h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <HistoryColumn
              title="Programadas"
              count={programadasResponse?.meta.total ?? 0}
              tone="scheduled"
              notifications={programadas}
              loading={loadingProgramadas}
              leadsPorId={leadsPorId}
              meta={programadasResponse?.meta}
              onPageChange={setProgramadasPage}
              onEdit={iniciarEdicion}
            />
            <HistoryColumn
              title="Enviadas"
              tone="expired"
              notifications={vencidas}
              loading={loadingVencidas}
              leadsPorId={leadsPorId}
              meta={vencidasResponse?.meta}
              onPageChange={setVencidasPage}
            />
          </div>
        </div>
      )}

      {seccion === 'calendario' && (
        <MicrosoftCalendarPanel
          leads={leads}
          idResponsable={idResponsable}
          integraciones={integraciones}
          integracionInfo={integracionInfo}
          isLoadingIntegracion={isLoadingIntegracion}
          onDisconnect={desconectarMicrosoft}
        />
      )}
    </div>
  )
}

interface HistoryColumnProps {
  title: string
  count?: number
  tone: 'scheduled' | 'expired'
  notifications: NotificacionProgramada[]
  loading: boolean
  meta?: NotificacionesMeta
  onPageChange: (page: number) => void
  onEdit?: (notificacion: NotificacionProgramada) => void
  leadsPorId: Map<number, { codigo: string; organizacion_nombre?: string; contacto_nombre?: string; encargado_nombre?: string }>
}

function HistoryColumn({
  title,
  count,
  tone,
  notifications,
  loading,
  meta,
  onPageChange,
  onEdit,
  leadsPorId,
}: Readonly<HistoryColumnProps>) {
  const scheduled = tone === 'scheduled'
  const countLabel = scheduled
    ? count === 1 ? 'programada' : 'programadas'
    : count === 1 ? 'vencida' : 'vencidas'

  return (
    <section className="min-h-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${scheduled ? 'bg-blue-600' : 'bg-red-500'}`} />
          <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        </div>
        {typeof count === 'number' && (
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
            scheduled
              ? 'border-blue-200 bg-blue-50 text-blue-600'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}>
            {count} {countLabel}
          </span>
        )}
      </div>
      <div className="space-y-3 p-4">
        {loading && <LoadingMessage />}
        {!loading && notifications.length === 0 && (
          <EmptyMessage>
            No hay notificaciones {scheduled ? 'programadas' : 'enviadas'}.
          </EmptyMessage>
        )}
        {notifications.map((notificacion) => {
          const lead = leadsPorId.get(notificacion.idLead)
          return (
            <NotificacionProgramadaItem
              key={notificacion.id}
              notificacion={notificacion}
              leadLabel={lead
                ? `${lead.codigo} · ${lead.organizacion_nombre ?? lead.contacto_nombre ?? 'Lead'}`
                : `Lead ${notificacion.idLead}`}
              responsableActual={lead?.encargado_nombre}
              onEdit={onEdit}
            />
          )
        })}
        {meta && (meta.totalPages > 1 || meta.page > 1) && (
          <Pagination meta={meta} onPageChange={onPageChange} />
        )}
      </div>
    </section>
  )
}

function Pagination({
  meta,
  onPageChange,
}: Readonly<{
  meta: NotificacionesMeta
  onPageChange: (page: number) => void
}>) {
  const totalPages = Math.max(1, meta.totalPages)

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
      <span className="text-xs text-gray-500">
        Página {meta.page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          aria-label="Página siguiente"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= totalPages}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

function LoadingMessage() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
      <Loader2 size={16} className="animate-spin" /> Cargando...
    </div>
  )
}

function EmptyMessage({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center text-sm text-gray-500">
      {children}
    </div>
  )
}

function Feedback({
  tone,
  children,
}: Readonly<{ tone: 'success' | 'error'; children: React.ReactNode }>) {
  return (
    <div className={`rounded-2xl border p-4 text-sm ${
      tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-red-200 bg-red-50 text-red-700'
    }`}>
      {children}
    </div>
  )
}
