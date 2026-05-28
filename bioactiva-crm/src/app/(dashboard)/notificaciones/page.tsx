'use client'

import { useState } from 'react'
import { Bell, Clock, MessageCircle, Repeat } from 'lucide-react'
import {
  useCentroNotificaciones,
  useCrearRecordatorio,
  useCrearSeguimiento,
  useMarcarTodasLeidas,
} from '@/hooks/notificaciones/useNotificaciones'
import { NotificacionAlerta, NotificacionProgramadaItem } from '@/components/modules/notificaciones/NotificacionItem'
import { RecordatorioForm } from '@/components/modules/notificaciones/RecordatorioForm'
import { SeguimientoForm } from '@/components/modules/notificaciones/SeguimientoForm'
import {
  RecordatorioFormValues,
  SeguimientoFormValues,
} from '@/lib/validators/notificacion.schema'
import { NotificacionProgramada } from '@/types/notificacion.types'
import { getErrorMessage } from '@/lib/utils/error.utils'

type SeccionNotificaciones = 'centro' | 'recordatorio' | 'seguimiento'

export default function NotificacionesPage() {
  const [seccion, setSeccion] = useState<SeccionNotificaciones>('centro')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data: centro, isLoading: isCentroLoading } = useCentroNotificaciones()
  const { mutateAsync: crearRecordatorio, isPending: isCreatingRecordatorio } = useCrearRecordatorio()
  const { mutateAsync: crearSeguimiento, isPending: isCreatingSeguimiento } = useCrearSeguimiento()
  const { mutateAsync: marcarTodasLeidas, isPending: isMarkingAll } = useMarcarTodasLeidas()

  const handleSubmitRecordatorio = async (
    values: RecordatorioFormValues & Partial<NotificacionProgramada>
  ) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      await crearRecordatorio(values)
      setSuccessMessage('Recordatorio programado correctamente.')
      setSeccion('centro')
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'No se pudo programar el recordatorio.'))
    }
  }

  const handleSubmitSeguimiento = async (
    values: SeguimientoFormValues & Partial<NotificacionProgramada>
  ) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      await crearSeguimiento(values)
      setSuccessMessage('Seguimiento programado correctamente.')
      setSeccion('centro')
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'No se pudo programar el seguimiento.'))
    }
  }

  const handleMarcarTodas = async () => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      await marcarTodasLeidas()
      setSuccessMessage('Todas las notificaciones se marcaron como leídas.')
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'No se pudieron marcar todas como leídas.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
            Centro de notificaciones
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSeccion('recordatorio')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors
              ${seccion === 'recordatorio'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
          >
            <Clock size={16} />
            Recordatorio
          </button>
          <button
            type="button"
            onClick={() => setSeccion('seguimiento')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors
              ${seccion === 'seguimiento'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
          >
            <MessageCircle size={16} />
            Seguimiento
          </button>
          <button
            type="button"
            onClick={handleMarcarTodas}
            disabled={isMarkingAll}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700 border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Repeat size={16} />
            {isMarkingAll ? 'Marcando...' : 'Marcar todas leídas'}
          </button>
        </div>
      </div>

      {formError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {seccion === 'centro' && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Pendientes</p>
                <p className="mt-3 text-3xl font-bold text-emerald-700">
                  {centro?.sinLeer ?? 0}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Programadas</p>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {centro?.programadas.length ?? 0}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Vencidas / Enviadas</p>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {centro?.vencidas.length ?? 0}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notificaciones recientes</p>
                  <p className="text-xs text-gray-500">Todas las alertas y avisos pendientes.</p>
                </div>
                <Bell size={20} className="text-emerald-600" />
              </div>
              <div className="mt-6 space-y-4">
                {!isCentroLoading && centro?.vencidas.length === 0 && (
                  <p className="text-sm text-gray-500">No hay notificaciones por mostrar.</p>
                )}
                {centro?.vencidas.map((notificacion) => (
                  <NotificacionAlerta key={notificacion.id} notificacion={notificacion} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notificaciones programadas</p>
                  <p className="text-xs text-gray-500">Tareas que se enviarán próximamente.</p>
                </div>
                <Clock size={20} className="text-blue-600" />
              </div>
              <div className="mt-6 space-y-4">
                {!isCentroLoading && centro?.programadas.length === 0 && (
                  <p className="text-sm text-gray-500">Sin recordatorios programados</p>
                )}
                {centro?.programadas.map((notificacion) => (
                  <NotificacionProgramadaItem
                    key={notificacion.id}
                    notificacion={notificacion}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {seccion === 'recordatorio' && (
        <RecordatorioForm
          onSubmit={handleSubmitRecordatorio}
          isLoading={isCreatingRecordatorio}
          error={formError}
          onCancel={() => setSeccion('centro')}
        />
      )}

      {seccion === 'seguimiento' && (
        <SeguimientoForm
          onSubmit={handleSubmitSeguimiento}
          isLoading={isCreatingSeguimiento}
          error={formError}
          onCancel={() => setSeccion('centro')}
        />
      )}
    </div>
  )
}

