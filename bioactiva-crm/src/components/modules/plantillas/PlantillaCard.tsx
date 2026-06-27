'use client'

import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { Plantilla } from '@/types/plantilla.types'

interface PlantillaCardProps {
  plantilla:   Plantilla
  onVer:       (plantilla: Plantilla) => void
  onEditar:    (plantilla: Plantilla) => void
  onEliminar:  (plantilla: Plantilla) => void
}

export function PlantillaCard({
  plantilla,
  onVer,
  onEditar,
  onEliminar,
}: Readonly<PlantillaCardProps>) {
  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    })

  const asuntoPreview = plantilla.asunto.length > 60
    ? `${plantilla.asunto.slice(0, 60)}...`
    : plantilla.asunto

  return (
    <tr className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors">

      {/* Plantilla — siempre visible; muestra estado + fecha debajo en móvil */}
      <td className="px-4 py-3">
        <div>
          <button
            type="button"
            className="text-sm font-semibold text-emerald-700 cursor-pointer
              hover:underline text-left"
            onClick={() => onVer(plantilla)}
          >
            {plantilla.nombre}
          </button>
          <p className="text-xs text-gray-400 mt-0.5">{asuntoPreview}</p>
          <div className="sm:hidden mt-1.5 flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
              ${plantilla.activo
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
              }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              {plantilla.activo ? 'Activa' : 'Inactiva'}
            </span>
            <span className="text-xs text-gray-400">{formatFecha(plantilla.createdAt)}</span>
          </div>
        </div>
      </td>

      {/* Estado — oculto en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
          ${plantilla.activo
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-500'
          }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          {plantilla.activo ? 'Activa' : 'Inactiva'}
        </span>
      </td>

      {/* Creada — oculta en móvil, visible en sm+ */}
      <td className="hidden sm:table-cell px-4 py-3">
        <p className="text-sm text-gray-500">{formatFecha(plantilla.createdAt)}</p>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onVer(plantilla)}
            title="Ver detalle"
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEditar(plantilla)}
            title="Editar"
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onEliminar(plantilla)}
            title={plantilla.activo ? 'Eliminar o desactivar' : 'Eliminar'}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500
              hover:bg-red-50 transition-colors"
          >
            {plantilla.activo ? <Trash2 size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </td>
    </tr>
  )
}
