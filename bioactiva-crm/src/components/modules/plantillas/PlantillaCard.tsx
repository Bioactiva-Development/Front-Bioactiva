'use client'

import { Eye, Pencil, Trash2, Mail, Phone, Users, Tag } from 'lucide-react'
import { Plantilla, CategoriaPantilla } from '@/types/plantilla.types'

interface PlantillaCardProps {
  plantilla:   Plantilla
  onVer:       (plantilla: Plantilla) => void
  onEditar:    (plantilla: Plantilla) => void
  onEliminar:  (plantilla: Plantilla) => void
}

const CATEGORIA_STYLES: Record<CategoriaPantilla, {
  color: string
  icono: React.ReactNode
}> = {
  Email:   { color: 'bg-blue-50 text-blue-600',    icono: <Mail size={12} /> },
  Reunion: { color: 'bg-purple-50 text-purple-600', icono: <Users size={12} /> },
  Llamada: { color: 'bg-amber-50 text-amber-600',   icono: <Phone size={12} /> },
  Otro:    { color: 'bg-gray-100 text-gray-600',    icono: <Tag size={12} /> },
}

export function PlantillaCard({
  plantilla,
  onVer,
  onEditar,
  onEliminar,
}: Readonly<PlantillaCardProps>) {
  const categoriaStyle = CATEGORIA_STYLES[plantilla.categoria]

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    })

  const asuntoPreview = plantilla.asunto.length > 50
    ? `${plantilla.asunto.slice(0, 50)}...`
    : plantilla.asunto

  return (
    <tr className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors">

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center
            shrink-0 ${categoriaStyle.color}`}>
            {categoriaStyle.icono}
          </div>
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
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
          rounded-lg text-xs font-bold uppercase tracking-wide
          ${categoriaStyle.color}`}>
          {categoriaStyle.icono}
          {plantilla.categoria}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
          rounded-lg text-xs font-bold uppercase tracking-wide
          ${plantilla.activo
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-gray-100 text-gray-500'
          }`}>
          {plantilla.activo ? '✓ Activa' : 'Inactiva'}
        </span>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-gray-500">{formatFecha(plantilla.created_at)}</p>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onVer(plantilla)}
            title="Ver detalle"
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => onEditar(plantilla)}
            title="Editar"
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600
              hover:bg-emerald-50 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onEliminar(plantilla)}
            title="Eliminar"
            className={`p-2 rounded-lg transition-colors
              ${plantilla.en_uso
                ? 'text-gray-200 cursor-not-allowed'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            disabled={plantilla.en_uso}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}