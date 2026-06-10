'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, X, Eye, EyeOff } from 'lucide-react'
import {
  usePlantillas,
  useEliminarPlantilla,
  useDesactivarPlantilla,
} from '@/hooks/plantillas/usePlantillas'
import { PlantillaCard } from '@/components/modules/plantillas/PlantillaCard'
import { Plantilla } from '@/types/plantilla.types'
import { getErrorMessage } from '@/lib/utils/error.utils'
import { useDebounce } from '@/hooks/shared/useDebounce'

export default function PlantillasPage() {
  const router = useRouter()

  const [searchLocal, setSearchLocal]       = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState<Plantilla | null>(null)
  const [errorEliminar, setErrorEliminar]   = useState<string | null>(null)
  const [ofrecerDesactivar, setOfrecerDesactivar] = useState(false)

  const debouncedSearch = useDebounce(searchLocal, 400)

  const { data: todasPlantillas = [], isLoading } = usePlantillas(includeInactive)

  const plantillas = debouncedSearch
    ? todasPlantillas.filter((p) =>
        p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.asunto.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : todasPlantillas

  const { mutateAsync: eliminar, isPending: eliminando }     = useEliminarPlantilla()
  const { mutateAsync: desactivar, isPending: desactivando } = useDesactivarPlantilla()

  const handleVer    = (p: Plantilla) => router.push(`/plantillas/${p.id}`)
  const handleEditar = (p: Plantilla) => router.push(`/plantillas/${p.id}/editar`)

  const abrirConfirmarEliminar = (p: Plantilla) => {
    setConfirmEliminar(p)
    setErrorEliminar(null)
    setOfrecerDesactivar(false)
  }

  const handleConfirmarEliminar = async () => {
    if (!confirmEliminar) return
    try {
      setErrorEliminar(null)
      await eliminar(confirmEliminar.id)
      setConfirmEliminar(null)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'No se pudo eliminar la plantilla.')
      const esEnUso = msg.toLowerCase().includes('asociada a una notificación')
      setErrorEliminar(msg)
      setOfrecerDesactivar(esEnUso)
    }
  }

  const handleDesactivar = async () => {
    if (!confirmEliminar) return
    try {
      setErrorEliminar(null)
      await desactivar(confirmEliminar.id)
      setConfirmEliminar(null)
    } catch (err: unknown) {
      setErrorEliminar(getErrorMessage(err, 'No se pudo desactivar la plantilla.'))
    }
  }

  const activas = todasPlantillas.filter((p) => p.activo).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100
            rounded-xl px-1 py-1 shadow-sm">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold
              bg-emerald-50 text-emerald-700">
              Plantillas
            </button>
          </div>
          <button
            onClick={() => router.push('/plantillas/nueva')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-emerald-600 hover:bg-emerald-700 text-white
              text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Nueva Plantilla
          </button>
        </div>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-emerald-600">{activas} activas</span>
          {' · '}
          <span>{todasPlantillas.length} total</span>
        </p>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plantillas de Correo</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchLocal}
              onChange={(e) => setSearchLocal(e.target.value)}
              placeholder="Buscar por nombre o asunto..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200
                bg-white text-gray-900 text-sm outline-none focus:border-emerald-400
                placeholder:text-gray-400 transition-colors"
            />
            {searchLocal && (
              <button
                onClick={() => setSearchLocal('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                  hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIncludeInactive((v) => !v)}
            title={includeInactive ? 'Ocultar inactivas' : 'Mostrar inactivas'}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm
              font-semibold transition-colors
              ${includeInactive
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
          >
            {includeInactive ? <Eye size={15} /> : <EyeOff size={15} />}
            {includeInactive ? 'Con inactivas' : 'Solo activas'}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-600
              border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && plantillas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <p className="text-sm font-semibold text-gray-500">
              No se encontraron plantillas
            </p>
          </div>
        )}

        {!isLoading && plantillas.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Plantilla
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Creada
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {plantillas.map((plantilla) => (
                <PlantillaCard
                  key={plantilla.id}
                  plantilla={plantilla}
                  onVer={handleVer}
                  onEditar={handleEditar}
                  onEliminar={abrirConfirmarEliminar}
                />
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && plantillas.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando 1 – {plantillas.length} de {plantillas.length}
            </p>
          </div>
        )}
      </div>

      {/* Modal confirmar eliminar */}
      {confirmEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title-plantilla"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-default"
            onClick={() => setConfirmEliminar(null)}
            aria-label="Cerrar diálogo"
            tabIndex={-1}
          />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 id="dialog-title-plantilla" className="text-lg font-bold text-gray-900">
              Eliminar plantilla
            </h3>
            <p className="text-sm text-gray-600">
              ¿Estás seguro de eliminar{' '}
              <span className="font-semibold">{confirmEliminar.nombre}</span>?
              Esta acción no se puede deshacer.
            </p>

            {errorEliminar && (
              <div className="bg-red-50 border border-red-200 text-red-700
                text-sm rounded-xl px-4 py-3">
                {errorEliminar}
              </div>
            )}

            {ofrecerDesactivar ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDesactivar}
                  disabled={desactivando}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold
                    bg-amber-500 hover:bg-amber-600 text-white transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {desactivando ? 'Desactivando...' : 'Desactivar en su lugar'}
                </button>
                <button
                  onClick={() => setConfirmEliminar(null)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold
                    border border-gray-200 text-gray-600 hover:bg-gray-50
                    transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmEliminar(null)
                    setErrorEliminar(null)
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                    border border-gray-200 text-gray-600 hover:bg-gray-50
                    transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                    bg-red-500 hover:bg-red-600 text-white transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {eliminando ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
