'use client'

import { useState } from 'react'
import { Bell, Clock, MessageCircle, Repeat, Plug, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { usePerfil } from '@/hooks/perfil/usePerfil'
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

  const {
    integraciones,
    integracionInfo,
    isLoadingIntegracion,
    conectarMicrosoft,
    desconectarMicrosoft,
  } = usePerfil()

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
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr] w-full overflow-hidden">
          <div className="space-y-4 min-w-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400 truncate">Pendientes</p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-emerald-700">
                  {centro?.sinLeer ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400 truncate">Programadas</p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                  {centro?.programadas.length ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  <span className="sm:hidden">Vencidas</span>
                  <span className="hidden sm:inline">Vencidas / Enviadas</span>
                </p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                  {centro?.vencidas.length ?? 0}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Notificaciones recientes</p>
                  <p className="text-xs text-gray-500 truncate">Todas las alertas y avisos pendientes.</p>
                </div>
                <Bell size={18} className="text-emerald-600 shrink-0" />
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

          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Notificaciones programadas</p>
                  <p className="text-xs text-gray-500 truncate">Tareas que se enviarán próximamente.</p>
                </div>
                <Clock size={18} className="text-blue-600 shrink-0" />
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

      {/* Integraciones Microsoft */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6 overflow-hidden">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Plug size={16} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">Integraciones Microsoft</h2>
            <p className="text-xs text-gray-500 truncate">Conecta Teams y Outlook para expandir las capacidades del CRM.</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {integracionInfo && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {integracionInfo}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Microsoft Teams</p>
              <p className="text-xs text-gray-500 mt-0.5">Crea reuniones automáticamente desde las actividades.</p>
              <div className="mt-2">
                {integraciones?.teams.conectado ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Conectado{integraciones.teams.cuenta ? ` · ${integraciones.teams.cuenta}` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> No conectado
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Microsoft Outlook</p>
              <p className="text-xs text-gray-500 mt-0.5">Sincroniza el calendario con las actividades del CRM.</p>
              <div className="mt-2">
                {integraciones?.outlook.conectado ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Conectado{integraciones.outlook.cuenta ? ` · ${integraciones.outlook.cuenta}` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> No conectado
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            {integraciones?.teams.conectado || integraciones?.outlook.conectado ? (
              <button
                onClick={desconectarMicrosoft}
                disabled={isLoadingIntegracion}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-xl transition-colors"
              >
                {isLoadingIntegracion && <Loader2 size={14} className="animate-spin" />}
                Desconectar cuenta de Microsoft
              </button>
            ) : (
              <button
                onClick={conectarMicrosoft}
                disabled={isLoadingIntegracion}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#106EBE] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {isLoadingIntegracion ? <Loader2 size={16} className="animate-spin" /> : (
                  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                )}
                Conectar con Microsoft
                <ExternalLink size={14} className="opacity-70" />
              </button>
            )}
            <p className="text-xs text-gray-400 mt-2">Un solo inicio de sesión concede acceso a Teams y Outlook.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

